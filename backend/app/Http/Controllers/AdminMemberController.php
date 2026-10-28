<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\MembershipRenewal;
use App\Models\Payment;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

/**
 * Manajemen member oleh admin — PRD-001 (docs/prd/001-admin-manajemen-member.md).
 *
 * Aturan yang dipatuhi di sini:
 * - Pendaftaran hanya oleh admin. Yang ditanyakan cuma nama + nomor telepon (keputusan K1/K2).
 * - Member baru TIDAK diberi kata sandi. `credential_issued_at` dibiarkan null (K3).
 * - Masa aktif awal 1 bulan, boleh langsung 3 atau 6 bulan (K4). Tanpa tabel paket, tanpa harga:
 *   status "sudah bayar" dianggap otomatis saat pendaftaran.
 * - Nomor telepon = identitas unik, dinormalisasi ke bentuk 08xxxxxxxxxx sebelum disimpan (K5).
 * - Status tidak disimpan; dihitung di Member::status().
 */
class AdminMemberController extends Controller
{
    /** Pilihan durasi cepat yang tampil di layar. Durasi lain boleh -- lihat PLAN_MAX_MONTHS. */
    private const PLAN_CHOICES = [1, 3, 6, 12];

    /**
     * Batas atas durasi dalam bulan. Bukan untuk menahan orang, tapi menahan salah ketik:
     * tanpa batas, "240" akan membuat masa aktif 20 tahun dan tidak ada yang curiga.
     */
    private const PLAN_MAX_MONTHS = 24;

    public function index(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->query('per_page', 15), 1), 100);
        $cari = trim((string) $request->query('q', ''));
        $status = (string) $request->query('status', '');

        // Status yang tidak dikenal ditolak, bukan diabaikan: kalau diabaikan, salah ketik
        // ("kadaluarsa" misalnya) diam-diam menampilkan SELURUH anggota dan angkanya terlihat wajar.
        if ($status !== '' && ! in_array($status, ['aktif', 'akan_berakhir', 'nonaktif'], true)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Status tidak dikenal. Pilih: aktif, akan_berakhir, atau nonaktif.',
            ], 422);
        }

        // withTrashed: member nonaktif tetap punya baris user (soft delete), jadi relasinya
        // harus dimuat tanpa scope default. Tanpa ini, status member nonaktif salah dan
        // aksi "aktifkan kembali" meledak dengan trashed() on null.
        $query = Member::query()->with(['user' => fn ($q) => $q->withTrashed()]);

        // Hanya member. User ber-role coach/admin tidak pernah muncul di layar ini.
        //
        // Filter "nonaktif" harus bisa menampilkan akun yang SUDAH dimatikan, dan akun itu tersimpan
        // sebagai soft delete -- relasi bawaan menyaringnya, jadi scope-nya dilepas khusus di sini.
        // Tanpa ini, anggota nonaktif hilang dari daftar justru saat dicari.
        $hanyaYangHidup = $status !== 'nonaktif';
        $query->whereHas('user', function ($q) use ($hanyaYangHidup) {
            $hanyaYangHidup ? $q->whereNull('deleted_at') : $q->withTrashed();
            $q->where('role', User::ROLE_MEMBER);
        });

        if ($cari !== '') {
            $angka = preg_replace('/\D/', '', $cari);
            $query->where(function ($w) use ($cari, $angka) {
                $w->where('member_code', 'like', "%{$cari}%");
                $w->orWhereHas('user', function ($u) use ($cari, $angka) {
                    $u->where('name', 'like', "%{$cari}%");
                    if ($angka !== '') {
                        $u->orWhere('phone', 'like', "%{$angka}%");
                    }
                });
            });
        }

        $hariIni = now()->startOfDay();
        $batas = $hariIni->copy()->addDays(Member::SOON_DAYS);

        // Tiga status saja (keputusan josjis 2026-10-28): aktif, akan berakhir (tenggat 7 hari),
        // nonaktif -- yang mencakup dua sebab: masa aktifnya lewat, atau akunnya dimatikan petugas.
        // whereDate dipakai supaya jam yang tersimpan tidak ikut menentukan.
        match ($status) {
            'aktif' => $query->whereDate('membership_expires_at', '>', $batas->toDateString()),
            'akan_berakhir' => $query
                ->whereDate('membership_expires_at', '>=', $hariIni->toDateString())
                ->whereDate('membership_expires_at', '<=', $batas->toDateString()),
            'nonaktif' => $query->where(function ($w) use ($hariIni) {
                $w->whereNull('membership_expires_at')
                    ->orWhereDate('membership_expires_at', '<', $hariIni->toDateString())
                    ->orWhereHas('user', fn ($u) => $u->withTrashed()->whereNotNull('deleted_at'));
            }),
            default => null,
        };

        $halaman = $query->orderByDesc('membership_expires_at')->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => [
                'items' => collect($halaman->items())->map(fn (Member $m) => $this->present($m))->all(),
                'meta' => [
                    'current_page' => $halaman->currentPage(),
                    'last_page' => $halaman->lastPage(),
                    'per_page' => $halaman->perPage(),
                    'total' => $halaman->total(),
                ],
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'min:2', 'max:80'],
            'phone' => ['required', 'string', 'max:20'],
            'plan_months' => ['nullable', 'integer', 'min:1', 'max:'.self::PLAN_MAX_MONTHS],
            'payment_method' => ['nullable', 'in:'.implode(',', Payment::METODE)],
            'amount_paid' => ['nullable', 'numeric', 'min:0'],
        ], [
            'name.required' => 'Nama member wajib diisi.',
            'name.min' => 'Nama member minimal 2 huruf.',
            'phone.required' => 'Nomor HP wajib diisi.',
            'plan_months.min' => 'Durasi paling singkat 1 bulan.',
            'plan_months.max' => 'Durasi paling lama 24 bulan (2 tahun).',
            'payment_method.in' => 'Cara bayar hanya cash atau qris.',
            'amount_paid.numeric' => 'Nominal yang dibayar harus angka.',
            'amount_paid.min' => 'Nominal yang dibayar tidak boleh minus.',
        ]);

        if ($validator->fails()) {
            return $this->galatValidasi($validator->errors()->toArray());
        }

        $data = $validator->validated();
        $telepon = $this->normalisasiTelepon($data['phone']);

        if (! preg_match('/^08[0-9]{7,12}$/', $telepon)) {
            return $this->galatValidasi([
                'phone' => ['Nomor HP tidak dikenali. Contoh yang benar: 08123456789.'],
            ]);
        }

        // Nomor sudah dipakai? Kembalikan 409 + data pemiliknya supaya UI bisa menawarkan
        // "buka member itu" -- bukan sekadar bilang gagal (PRD US-1).
        $pemilik = User::withTrashed()->where('phone', $telepon)->first();
        if ($pemilik) {
            $memberLama = $pemilik->member;

            return response()->json([
                'status' => 'error',
                'message' => "Nomor ini sudah dipakai {$pemilik->name}.",
                'data' => [
                    'existing_member' => $memberLama ? [
                        'id' => $memberLama->id,
                        'name' => $pemilik->name,
                        'member_code' => $memberLama->member_code,
                    ] : null,
                ],
            ], 409);
        }

        $bulan = $data['plan_months'] ?? 1;
        $mulai = now()->startOfDay();
        $metode = $data['payment_method'] ?? Payment::METODE[0];
        ['nominal' => $nominal, 'sumber' => $sumber, 'alasan' => $alasan] = $this->nominalPembayaran($data, $bulan, true);

        [$member, $pembayaran] = DB::transaction(function () use ($data, $telepon, $bulan, $mulai, $metode, $nominal, $request) {
            $user = User::create([
                'name' => $data['name'],
                'phone' => $telepon,
                'role' => User::ROLE_MEMBER,
                'created_by_user_id' => $request->user()->id,
                // email & password sengaja dibiarkan null: member walk-in belum punya akses login.
            ]);

            $member = Member::create([
                'user_id' => $user->id,
                'height' => null,
                'weight' => null,
                'goal' => null,
                'membership_started_at' => $mulai,
                'plan_months' => $bulan,
                // addMonthsNoOverflow: 31 Jan + 1 bulan = 28/29 Feb, bukan 2/3 Mar.
                'membership_expires_at' => $mulai->copy()->addMonthsNoOverflow($bulan),
            ]);

            $member->member_code = Member::nextMemberCode();
            $member->save();

            // P2: uang dicatat SAAT pendaftaran. Tanpa nominal yang bisa dihitung, tidak ada
            // baris bernilai nol -- petugas diberi tahu lewat payment_recorded + alasannya.
            $pembayaran = null;
            if ($nominal !== null) {
                $pembayaran = Payment::create([
                    'member_id' => $member->id,
                    'kind' => Payment::KINDA_PENDAFTARAN,
                    'method' => $metode,
                    'amount' => $nominal,
                    'months' => $bulan,
                    'paid_at' => $mulai,
                    'recorded_by_user_id' => $request->user()->id,
                ]);
                $pembayaran->setRelation('recordedBy', $request->user());
            }

            return [$member, $pembayaran];
        });

        $hasil = $this->present($member->fresh(['user' => fn ($q) => $q->withTrashed()]));
        $hasil['payment_recorded'] = $pembayaran !== null;
        if ($pembayaran) {
            $hasil['payment'] = $this->bentukPembayaran($pembayaran) + ['harga_sumber' => $sumber];
        } else {
            $hasil['payment_note'] = $alasan;
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Member tersimpan.',
            'data' => $hasil,
        ], 201);
    }

    public function show(Member $member): JsonResponse
    {
        $member->load(['user' => fn ($q) => $q->withTrashed(), 'renewals.admin', 'payments.recordedBy']);

        return response()->json([
            'status' => 'success',
            'data' => $this->present($member) + [
                'riwayat' => $member->renewals->map(fn (MembershipRenewal $r) => [
                    'added_months' => $r->added_months,
                    'started_from' => $r->started_from?->toDateString(),
                    'expires_at_after' => $r->expires_at_after?->toDateString(),
                    'oleh' => $r->admin?->name,
                    'kapan' => $r->created_at?->toDateTimeString(),
                ])->all(),
                'pembayaran' => collect($member->payments->all())->map(fn (Payment $p) => $this->bentukPembayaran($p))->all(),
                // Petugas perlu tahu berapa yang harus ditagih untuk durasi sekarang.
                'harga_saran' => Setting::priceFor((int) ($member->plan_months ?? 1)),
            ],
        ]);
    }

    public function update(Request $request, Member $member): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => ['sometimes', 'string', 'min:2', 'max:80'],
            'phone' => ['sometimes', 'string', 'max:20'],
        ], [
            'name.min' => 'Nama member minimal 2 huruf.',
        ]);

        if ($validator->fails()) {
            return $this->galatValidasi($validator->errors()->toArray());
        }

        $data = $validator->validated();
        $user = $this->userOf($member);

        if (isset($data['phone'])) {
            $telepon = $this->normalisasiTelepon($data['phone']);
            if (! preg_match('/^08[0-9]{7,12}$/', $telepon)) {
                return $this->galatValidasi([
                    'phone' => ['Nomor HP tidak dikenali. Contoh yang benar: 08123456789.'],
                ]);
            }

            $bentrok = User::withTrashed()
                ->where('phone', $telepon)
                ->whereKeyNot($user->id)
                ->first();

            if ($bentrok) {
                return response()->json([
                    'status' => 'error',
                    'message' => "Nomor ini sudah dipakai {$bentrok->name}.",
                ], 409);
            }

            $user->phone = $telepon;
        }

        if (isset($data['name'])) {
            $user->name = $data['name'];
        }

        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Data member diperbarui.',
            'data' => $this->present($member->fresh(['user' => fn ($q) => $q->withTrashed()])),
        ]);
    }

    public function renew(Request $request, Member $member): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'plan_months' => ['required', 'integer', 'min:1', 'max:'.self::PLAN_MAX_MONTHS],
            'payment_method' => ['nullable', 'in:'.implode(',', Payment::METODE)],
            'amount_paid' => ['nullable', 'numeric', 'min:0'],
        ], [
            'plan_months.required' => 'Pilih durasi perpanjangan.',
            'plan_months.min' => 'Durasi paling singkat 1 bulan.',
            'plan_months.max' => 'Durasi paling lama 24 bulan (2 tahun).',
            'payment_method.in' => 'Cara bayar hanya cash atau qris.',
            'amount_paid.numeric' => 'Nominal yang dibayar harus angka.',
            'amount_paid.min' => 'Nominal yang dibayar tidak boleh minus.',
        ]);

        if ($validator->fails()) {
            return $this->galatValidasi($validator->errors()->toArray());
        }

        $data = $validator->validated();
        $bulan = (int) $data['plan_months'];
        $hariIni = now()->startOfDay();
        $metode = $data['payment_method'] ?? Payment::METODE[0];
        ['nominal' => $nominal, 'sumber' => $sumber, 'alasan' => $alasan] = $this->nominalPembayaran($data, $bulan, false);

        // Masih aktif -> tambah dari tanggal berakhir lama (sisa waktu tidak dipotong).
        // Sudah lewat -> hitung dari hari ini.
        $masihAktif = $member->membership_expires_at && $member->membership_expires_at->startOfDay()->gte($hariIni);
        $dasar = $masihAktif ? $member->membership_expires_at->copy()->startOfDay() : $hariIni;
        $baru = $dasar->copy()->addMonthsNoOverflow($bulan);

        $pembayaran = DB::transaction(function () use ($member, $bulan, $dasar, $baru, $metode, $nominal, $hariIni, $request) {
            MembershipRenewal::create([
                'member_id' => $member->id,
                'added_months' => $bulan,
                'started_from' => $dasar,
                'expires_at_after' => $baru,
                'created_by_user_id' => $request->user()->id,
            ]);

            $member->plan_months = $bulan;
            $member->membership_expires_at = $baru;
            if (! $member->membership_started_at) {
                $member->membership_started_at = $dasar;
            }
            $member->save();

            // P2: uang perpanjangan dicatat pada saat perpanjangannya dicatat, satu transaksi DB.
            if ($nominal === null) {
                return null;
            }

            $bayar = Payment::create([
                'member_id' => $member->id,
                'kind' => Payment::KINDA_PERPANJANGAN,
                'method' => $metode,
                'amount' => $nominal,
                'months' => $bulan,
                'paid_at' => $hariIni,
                'recorded_by_user_id' => $request->user()->id,
            ]);
            $bayar->setRelation('recordedBy', $request->user());

            return $bayar;
        });

        $hasil = $this->present($member->fresh(['user' => fn ($q) => $q->withTrashed()]));
        $hasil['payment_recorded'] = $pembayaran !== null;
        if ($pembayaran) {
            $hasil['payment'] = $this->bentukPembayaran($pembayaran) + ['harga_sumber' => $sumber];
        } else {
            $hasil['payment_note'] = $alasan;
        }

        return response()->json([
            'status' => 'success',
            'message' => $masihAktif
                ? 'Ditambahkan dari tanggal berakhir sebelumnya.'
                : 'Dihitung dari hari ini karena masa aktif sudah lewat.',
            'data' => $hasil,
        ]);
    }

    public function deactivate(Member $member): JsonResponse
    {
        if ($this->userOf($member)?->trashed()) {
            return response()->json(['status' => 'error', 'message' => 'Member ini sudah nonaktif.'], 409);
        }

        $this->userOf($member)?->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Member dinonaktifkan.',
            'data' => $this->present($member->fresh(['user' => fn ($q) => $q->withTrashed()])),
        ]);
    }

    public function reactivate(Member $member): JsonResponse
    {
        if (! ($this->userOf($member)?->trashed() ?? false)) {
            return response()->json(['status' => 'error', 'message' => 'Member ini masih aktif.'], 409);
        }

        $this->userOf($member)?->restore();

        return response()->json([
            'status' => 'success',
            'message' => 'Member diaktifkan kembali.',
            'data' => $this->present($member->fresh(['user' => fn ($q) => $q->withTrashed()])),
        ]);
    }

    /**
     * Bentuk satu baris member yang dipakai semua endpoint (PRD-001 §8).
     *
     * @return array<string, mixed>
     */
    /**
     * Relasi user milik member, termasuk yang sudah di-soft-delete.
     * Dipakai supaya member nonaktif masih bisa ditampilkan dan diaktifkan kembali.
     */
    private function userOf(Member $member): ?User
    {
        return $member->relationLoaded('user')
            ? $member->getRelation('user')
            : $member->user()->withTrashed()->first();
    }

    private function present(Member $member): array
    {
        $user = $this->userOf($member);

        return [
            'id' => $member->id,
            'member_code' => $member->member_code,
            'name' => $user?->name,
            'phone' => $user?->phone,
            'membership_started_at' => $member->membership_started_at?->toDateString(),
            'membership_expires_at' => $member->membership_expires_at?->toDateString(),
            'plan_months' => $member->plan_months,
            'status' => $member->status(),
            'days_left' => $member->daysLeft(),
            'has_login' => (bool) $user?->canLogin(),
            'is_active' => ! ($user?->trashed() ?? false),
        ];
    }

    /**
     * Menyeragamkan nomor HP supaya "0812-3456-789", "+628123456789", dan "628123456789"
     * dianggap satu nomor yang sama. Tanpa ini, satu orang bisa terdaftar dua kali.
     */
    private function normalisasiTelepon(string $nomor): string
    {
        $angka = preg_replace('/\D/', '', $nomor) ?? '';

        if (str_starts_with($angka, '62')) {
            $angka = '0'.substr($angka, 2);
        } elseif (str_starts_with($angka, '8')) {
            $angka = '0'.$angka;
        }

        return $angka;
    }

    /**
     * @param  array<string, array<int, string>>  $errors
     */
    private function galatValidasi(array $errors): JsonResponse
    {
        return response()->json([
            'status' => 'error',
            'message' => 'Validasi gagal',
            'errors' => $errors,
        ], 422);
    }

    /**
     * Hitung nominal pembayaran yang dicatat untuk transaksi ini (keputusan P2/P3).
     *
     * `amount_paid` dari petugas SELALU menang -- harga di pengaturan cuma saran yang boleh
     * ditimpa (diskon, bayar sebagian). Pendaftaran memakai biaya pendaftaran + harga paket;
     * perpanjangan hanya harga paketnya. Kalau petugas tidak mengirim nominal dan harga memang
     * belum diisi owner, nominal kembali null: tidak ada baris pembayaran bernilai nol.
     *
     * @param  array<string, mixed>  $data  hasil validasi (`amount_paid` boleh tidak ada)
     * @return array{nominal: float|null, sumber: string|null, alasan: string|null}
     */
    private function nominalPembayaran(array $data, int $bulan, bool $pendaftaran): array
    {
        if (array_key_exists('amount_paid', $data)) {
            return ['nominal' => (float) $data['amount_paid'], 'sumber' => 'petugas', 'alasan' => null];
        }

        $paket = Setting::priceFor($bulan);
        $biayaDaftar = $pendaftaran ? Setting::money(Setting::PRICE_REGISTRATION) : null;

        if ($paket['amount'] === null && $biayaDaftar === null) {
            return [
                'nominal' => null,
                'sumber' => null,
                'alasan' => 'Harga belum diisi owner dan nominal tidak dikirim petugas, jadi pembayaran tidak dicatat. Isi harga di pengaturan owner atau kirim amount_paid.',
            ];
        }

        $bagian = [];
        if ($biayaDaftar !== null) {
            $bagian[] = 'pendaftaran';
        }
        if ($paket['amount'] !== null) {
            $bagian[] = $paket['source'];
        }

        return [
            'nominal' => ($biayaDaftar ?? 0) + ($paket['amount'] ?? 0),
            'sumber' => implode('+', $bagian),
            'alasan' => null,
        ];
    }

    /**
     * Satu baris pembayaran untuk respons/history. Memerlukan relasi `recordedBy` termuat
     * (di show() dimuat bersama; di store()/renew() disetel dari user yang sedang masuk).
     *
     * @return array<string, mixed>
     */
    private function bentukPembayaran(Payment $p): array
    {
        return [
            'id' => $p->id,
            'kind' => $p->kind,
            'method' => $p->method,
            'amount' => (float) $p->amount,
            'months' => $p->months,
            'paid_at' => $p->paid_at?->toDateString(),
            'oleh' => $p->recordedBy?->name,
            'kapan' => $p->created_at?->toDateTimeString(),
        ];
    }
}
