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
    /**
     * Kelompok waktu halaman Uang Masuk -> batas paling banyak periode yang boleh diminta.
     * Batas ini juga yang menahan `?jumlah=99999` supaya tidak ada yang bisa memaksa server
     * menghitung ribuan titik data sekali klik.
     */
    private const KELOMPOK_WAKTU = ['harian' => 31, 'mingguan' => 26, 'bulanan' => 24];

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

    /**
     * Uang masuk per kelompok waktu: harian, mingguan, atau bulanan.
     *
     * Keputusan josjis 2026-10-28: halaman Uang Masuk harus bisa dilihat harian dan mingguan,
     * bukan cuma bulanan. Yang memilih kelompok waktunya layar, bukan server: satu endpoint dengan
     * parameter `group`, supaya menambah kelompok baru tidak perlu rute baru.
     *
     * Periode tanpa transaksi tetap muncul bernilai 0 -- grafik yang bolong-bolong lebih sulit
     * dibaca daripada grafik berisi nol.
     */
    public function revenue(Request $request): JsonResponse
    {
        $kelompok = (string) $request->query('group', 'bulanan');

        if (! array_key_exists($kelompok, self::KELOMPOK_WAKTU)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kelompok waktu tidak dikenal. Pilih: '
                    .implode(' / ', array_keys(self::KELOMPOK_WAKTU)).'.',
            ], 422);
        }

        $bawaan = ['harian' => 14, 'mingguan' => 8, 'bulanan' => 6][$kelompok];
        $banyak = max(1, min(self::KELOMPOK_WAKTU[$kelompok], (int) $request->query('jumlah', $bawaan)));

        [$ekspresi, $mulai] = match ($kelompok) {
            'harian' => ["DATE_FORMAT(paid_at, '%Y-%m-%d')", now()->startOfDay()->subDays($banyak - 1)],
            'mingguan' => ["DATE_FORMAT(paid_at, '%x-W%v')", now()->startOfWeek()->subWeeks($banyak - 1)],
            default => ["DATE_FORMAT(paid_at, '%Y-%m')", now()->startOfMonth()->subMonths($banyak - 1)],
        };

        // `%x-W%v` = tahun-minggu ISO 8601, sama persis dengan bentuk Carbon 'o-\WW' yang dipakai
        // waktu menyusun deret kosong di bawah. Kalau keduanya beda, grafiknya jadi nol semua.
        $tercatat = Payment::query()
            ->where('paid_at', '>=', $mulai->toDateString())
            ->selectRaw("$ekspresi as periode")
            ->selectRaw('COALESCE(SUM(amount), 0) as total')
            ->selectRaw('COUNT(*) as transaksi')
            ->selectRaw("COALESCE(SUM(CASE WHEN method = 'cash' THEN amount END), 0) as cash")
            ->selectRaw("COALESCE(SUM(CASE WHEN method = 'qris' THEN amount END), 0) as qris")
            ->groupBy('periode')
            ->get()
            ->keyBy('periode');

        $items = [];
        foreach ($this->deretPeriode($kelompok, $mulai, $banyak) as $label) {
            $baris = $tercatat->get($label);
            $items[] = [
                'periode' => $label,
                'total' => (float) ($baris->total ?? 0),
                'transaksi' => (int) ($baris->transaksi ?? 0),
                'cash' => (float) ($baris->cash ?? 0),
                'qris' => (float) ($baris->qris ?? 0),
            ];
        }

        return response()->json([
            'status' => 'success',
            'data' => ['group' => $kelompok, 'jumlah' => $banyak, 'items' => $items],
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

    /**
     * Deret periode waktu yang berurutan dan tidak bolong: harian (tanggal), mingguan (tahun-minggu
     * ISO), atau bulanan (tahun-bulan). Bentuknya harus sama persis dengan hasil DATE_FORMAT di
     * kueri, karena label inilah kunci pencocokannya.
     */
    private function deretPeriode(string $kelompok, Carbon $mulai, int $banyak): array
    {
        [$format, $kursor] = match ($kelompok) {
            'harian' => ['Y-m-d', $mulai->copy()->startOfDay()],
            'mingguan' => ['o-\WW', $mulai->copy()->startOfWeek()],
            default => ['Y-m', $mulai->copy()->startOfMonth()],
        };

        $labels = [];
        for ($i = 0; $i < $banyak; $i++) {
            $labels[] = $kursor->format($format);

            if ($kelompok === 'harian') {
                $kursor->addDay();
            } elseif ($kelompok === 'mingguan') {
                $kursor->addWeek();
            } else {
                $kursor->addMonth();
            }
        }

        return $labels;
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
