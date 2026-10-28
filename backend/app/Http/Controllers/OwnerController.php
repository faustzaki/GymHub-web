<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\Payment;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

/**
 * Angka & keputusan untuk pemilik (rencana dashboard owner, tahap 1-2).
 *
 * Semua endpoint di sini HANYA BACA dan hanya untuk role:owner. Pembagi panel (rencana §1):
 * panel petugas mengurus satu anggota hari ini; panel owner melihat keadaan gym. Karena itu
 * tidak ada endpoint tulis untuk anggota di sini -- tombol tambah/perpanjang tetap hanya di
 * panel petugas, tidak ada versi duplikat.
 *
 * P5: semua angka mulai dari nol. Tidak ada riwayat pembayaran karangan -- uang masuk hanya
 * dari baris `payments` yang benar-benar dicatat petugas saat transaksi terjadi.
 */
class OwnerController extends Controller
{
    public function summary(): JsonResponse
    {
        // Status tetap lewat Member::status() per anggota -- satu sumber kebenaran. Versi SQL
        // sendiri berarti rumus kedua yang bisa berlainan hasil dengan layar petugas.
        $anggota = Member::query()->with(['user' => fn ($q) => $q->withTrashed()])->get();
        $hitung = ['aktif' => 0, 'akan_berakhir' => 0, 'nonaktif' => 0];
        foreach ($anggota as $m) {
            $hitung[$m->status()]++;
        }

        $mulaiBulan = now()->startOfMonth();

        $baru = Member::query()->where('created_at', '>=', $mulaiBulan)->count();

        // "Berhenti" = akunnya DIMATIKAN petugas bulan ini (soft delete). Habisnya masa aktif
        // bukan keputusan siapa pun -- anggota itu mungkin saja kembali, jadi tidak dihitung.
        $berhenti = User::onlyTrashed()
            ->where('role', User::ROLE_MEMBER)
            ->where('deleted_at', '>=', $mulaiBulan)
            ->count();

        $uang = Payment::query()
            ->where('paid_at', '>=', $mulaiBulan->toDateString())
            ->selectRaw('COALESCE(SUM(amount), 0) as total, COUNT(*) as transaksi')
            ->first();

        return response()->json([
            'status' => 'success',
            'data' => [
                'aktif' => $hitung['aktif'],
                'akan_berakhir' => $hitung['akan_berakhir'],
                'nonaktif' => $hitung['nonaktif'],
                'baru_bulan_ini' => $baru,
                'berhenti_bulan_ini' => $berhenti,
                'uang_bulan_ini' => (float) $uang->total,
                'transaksi_bulan_ini' => (int) $uang->transaksi,
                // Kalau false, kolom uang di layar tampil "harga belum diisi", bukan Rp 0.
                'harga_terisi' => Setting::money(Setting::PRICE_MONTHLY) !== null,
            ],
        ]);
    }

    public function growth(Request $request): JsonResponse
    {
        $jumlah = $this->jumlahBulan($request);
        $mulai = now()->startOfMonth()->subMonths($jumlah - 1);

        $bulanan = Member::query()
            ->where('created_at', '>=', $mulai)
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as bulan, COUNT(*) as jumlah")
            ->groupBy('bulan')
            ->pluck('jumlah', 'bulan');

        // Deret kontinu: bulan tanpa pendaftar tetap muncul dengan 0 -- grafik batang yang
        // melompati bulan kosong membuat tren terbaca salah.
        $items = [];
        foreach ($this->deretBulan($mulai, $jumlah) as $label) {
            $items[] = [
                'bulan' => $label,
                'anggota_baru' => (int) ($bulanan[$label] ?? 0),
            ];
        }

        return response()->json([
            'status' => 'success',
            'data' => ['months' => $jumlah, 'items' => $items],
        ]);
    }

    public function revenue(Request $request): JsonResponse
    {
        $jumlah = $this->jumlahBulan($request);
        $mulai = now()->startOfMonth()->subMonths($jumlah - 1);

        $bulanan = Payment::query()
            ->where('paid_at', '>=', $mulai->toDateString())
            ->selectRaw("DATE_FORMAT(paid_at, '%Y-%m') as bulan")
            ->selectRaw('COALESCE(SUM(amount), 0) as total')
            ->selectRaw('COUNT(*) as transaksi')
            ->selectRaw("COALESCE(SUM(CASE WHEN method = 'cash' THEN amount END), 0) as cash")
            ->selectRaw("COALESCE(SUM(CASE WHEN method = 'qris' THEN amount END), 0) as qris")
            ->groupBy('bulan')
            ->get()
            ->keyBy('bulan');

        $items = [];
        foreach ($this->deretBulan($mulai, $jumlah) as $label) {
            $baris = $bulanan->get($label);
            $items[] = [
                'bulan' => $label,
                'total' => (float) ($baris->total ?? 0),
                'transaksi' => (int) ($baris->transaksi ?? 0),
                'cash' => (float) ($baris->cash ?? 0),
                'qris' => (float) ($baris->qris ?? 0),
            ];
        }

        return response()->json([
            'status' => 'success',
            'data' => ['months' => $jumlah, 'items' => $items],
        ]);
    }

    /** Seberapa jauh ke depan orang masih pantas dikabari, dan berapa lama setelah lewat masih dikejar. */
    private const TAGIH_HARI_KE_DEPAN = 14;

    private const TAGIH_HARI_KE_BELAKANG = 30;

    public function priorities(): JsonResponse
    {
        $hariIni = now()->startOfDay();
        $kedepan = $hariIni->copy()->addDays(self::TAGIH_HARI_KE_DEPAN);
        $kebelakang = $hariIni->copy()->subDays(self::TAGIH_HARI_KE_BELAKANG);

        // Target tagihan: akunnya masih hidup (yang dimatikan petugas memang sudah memilih pergi),
        // punya tanggal berakhir, dan masih masuk akal dikejar -- habis dalam 14 hari ke depan, atau
        // lewat tidak lebih dari 30 hari lalu.
        //
        // Urutannya SENGAJA bukan "sisa hari menaik": yang paling telat (lewat 21 hari) hampir pasti
        // sudah pergi, dan menaruhnya di puncak daftar cuma menutupi orang yang masih bisa
        // diselamatkan. Yang di atas: yang akan habis dalam beberapa hari (masih anggota, masih bisa
        // dikabari), baru yang paling baru lewat.
        $top = Member::query()
            ->with(['user' => fn ($q) => $q->withTrashed()])
            ->whereNotNull('membership_expires_at')
            ->whereDate('membership_expires_at', '<=', $kedepan->toDateString())
            ->whereDate('membership_expires_at', '>=', $kebelakang->toDateString())
            ->whereHas('user', fn ($u) => $u->whereNull('deleted_at'))
            ->orderByRaw(
                'CASE WHEN DATE(membership_expires_at) >= ? THEN 0 ELSE 1 END ASC,'
                .' ABS(DATEDIFF(DATE(membership_expires_at), ?)) ASC',
                [$hariIni->toDateString(), $hariIni->toDateString()],
            )
            ->limit(10)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'items' => $top->map(fn (Member $m) => [
                    'id' => $m->id,
                    'member_code' => $m->member_code,
                    'name' => $m->user?->name,
                    'phone' => $m->user?->phone,
                    'membership_expires_at' => $m->membership_expires_at?->toDateString(),
                    'days_left' => $m->daysLeft(),
                    'status' => $m->status(),
                    // Nilai uang yang hilang kalau dia tidak kembali. Bisa null: harga durasi
                    // itu memang belum diisi owner -- tampil "–", bukan angka karangan.
                    'harga_paket' => Setting::priceFor((int) ($m->plan_months ?? 1))['amount'],
                ])->all(),
            ],
        ]);
    }

    /**
     * Seluruh isi layar Ringkasan dalam SATU permintaan.
     *
     * Sebabnya bukan gaya: server dev di Windows (`php -S`) melayani satu permintaan sekaligus, jadi
     * empat permintaan berarti empat kali antre dan kartu di layar menunggu yang paling belakang.
     * Terukur di browser: satu permintaan ±0,1 detik, empat permintaan berbaris ±1,3 detik.
     * Endpoint terpisah tetap ada untuk pemakaian lain (grafik di halaman Uang Masuk, dsb).
     */
    public function dashboard(Request $request): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => [
                'summary' => $this->summary()->getData(true)['data'],
                'growth' => $this->growth($request)->getData(true)['data'],
                'priorities' => $this->priorities()->getData(true)['data'],
                'settings' => Setting::publicPayload(),
            ],
        ]);
    }

    /** Batas 1-24 bulan: sama dengan batas durasi paket. Salah ketik diperedam, bukan 500. */
    private function jumlahBulan(Request $request): int
    {
        return max(1, min(24, (int) $request->query('months', 6)));
    }

    /** @return list<string> label `YYYY-MM` kontinu mulai dari $mulai sebanyak $jumlah */
    private function deretBulan(Carbon $mulai, int $jumlah): array
    {
        $labels = [];
        $kursor = $mulai->copy()->startOfMonth();
        for ($i = 0; $i < $jumlah; $i++) {
            $labels[] = $kursor->format('Y-m');
            $kursor->addMonth();
        }

        return $labels;
    }
}
