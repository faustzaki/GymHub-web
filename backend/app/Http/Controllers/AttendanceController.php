<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Member;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * Absen masuk anggota lewat kamera HP petugas.
 *
 * Keputusan josjis 2026-10-29: tidak ada alat khusus. HP petugas membuka layar Absen, kamera
 * membaca QR di kartu anggota (isinya `member_code`, mis. `GH-0001`), dan satu baris
 * `attendances` tertulis. Kode boleh juga diketik kalau kamera tidak bisa (kaca, gelap, kartu
 * kusut) -- satu endpoint untuk dua cara masuk, dibedakan kolom `method`.
 *
 * Aturan yang dijaga di sini:
 * - Anggota `nonaktif` TIDAK ditolak mentah-mentah: absennya dicatat lalu balasannya menyebut
 *   statusnya. Menolak di pintu tanpa catatan berarti kejadiannya hilang; petugas butuh tahu
 *   "orang ini masa aktifnya habis" lalu menagih di tempat, bukan layar merah tanpa jejak.
 * - Scan ganda dalam 2 menit dianggap satu kunjungan. Petugas yang mengarahkan kamera dua kali
 *   (atau kamera membaca QR yang sama berulang) tidak boleh menggelembungkan angka kunjungan.
 */
class AttendanceController extends Controller
{
    /** Jendela anti-scan-ganda, dalam menit. */
    private const JEDA_MENIT = 2;

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'code' => ['required', 'string', 'max:20'],
            'method' => ['nullable', 'in:scan,manual'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kode anggota tidak terbaca. Coba arahkan kamera lagi.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $kode = strtoupper(trim($request->string('code')));
        $member = $this->cariAnggota($kode);

        if (! $member) {
            return response()->json([
                'status' => 'error',
                'message' => "Kode {$kode} tidak terdaftar sebagai anggota.",
            ], 404);
        }

        $user = $member->relationLoaded('user')
            ? $member->getRelation('user')
            : $member->user()->withTrashed()->first();

        $sekarang = now();

        // Scan ganda: baris lama dipakai lagi, tidak ditambah. Balasannya menyebut `duplikat`
        // supaya layar bisa bilang "sudah tercatat 2 menit lalu" alih-alih "berhasil" palsu.
        $terakhir = Attendance::query()
            ->where('member_id', $member->id)
            ->where('checked_in_at', '>=', $sekarang->copy()->subMinutes(self::JEDA_MENIT))
            ->latest('checked_in_at')
            ->first();

        if ($terakhir) {
            return response()->json([
                'status' => 'success',
                'message' => 'Sudah tercatat '.$terakhir->checked_in_at->diffForHumans().'.',
                'data' => [
                    'duplikat' => true,
                    'anggota' => $this->presentAnggota($member, $user),
                    'absen' => $this->presentAbsen($terakhir),
                    'absen_hari_ini' => $this->hitungHariIni($member),
                ],
            ]);
        }

        $absen = Attendance::create([
            'member_id' => $member->id,
            'method' => $request->input('method', 'scan') === 'manual' ? 'manual' : 'scan',
            'checked_in_at' => $sekarang,
            'recorded_by_user_id' => $request->user()?->id,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Absen tercatat.',
            'data' => [
                'duplikat' => false,
                'anggota' => $this->presentAnggota($member, $user),
                'absen' => $this->presentAbsen($absen),
                'absen_hari_ini' => $this->hitungHariIni($member),
            ],
        ], 201);
    }

    /** Daftar kunjungan terakhir + ringkasan hari ini, untuk kolom kanan layar absen. */
    public function index(Request $request): JsonResponse
    {
        $batas = min(max((int) $request->query('limit', 10), 1), 50);

        $hariIni = now()->startOfDay();

        $items = Attendance::query()
            ->with(['member.user' => fn ($q) => $q->withTrashed(), 'recordedBy'])
            ->where('checked_in_at', '>=', $hariIni)
            ->latest('checked_in_at')
            ->limit($batas)
            ->get()
            ->map(fn (Attendance $a) => [
                'id' => $a->id,
                'jam' => $a->checked_in_at?->format('H:i'),
                'method' => $a->method,
                'nama' => $a->member?->user?->name,
                'member_code' => $a->member?->member_code,
                'oleh' => $a->recordedBy?->name,
            ]);

        return response()->json([
            'status' => 'success',
            'data' => [
                'items' => $items,
                'hari_ini' => Attendance::query()->where('checked_in_at', '>=', $hariIni)->count(),
                'anggota_unik' => Attendance::query()
                    ->where('checked_in_at', '>=', $hariIni)
                    ->distinct()
                    ->count('member_id'),
            ],
        ]);
    }

    /**
     * Cari anggota dari kode yang dipindai.
     *
     * Kode dari QR bisa datang dalam tiga bentuk, dan ketiganya harus diterima karena kartu
     * dicetak di beberapa tempat: `GH-0001`, `gh0001`, atau URL `.../m/GH-0001` kalau nanti
     * kartunya memuat tautan. Yang diambil selalu pola GH + angka.
     */
    private function cariAnggota(string $kode): ?Member
    {
        if (preg_match('/GH[\s-]*0*(\d+)/i', $kode, $m)) {
            $kode = 'GH-'.str_pad($m[1], 4, '0', STR_PAD_LEFT);
        }

        return Member::query()
            ->with(['user' => fn ($q) => $q->withTrashed()])
            ->where('member_code', $kode)
            ->first();
    }

    private function presentAnggota(Member $member, ?User $user): array
    {
        return [
            'id' => $member->id,
            'member_code' => $member->member_code,
            'name' => $user?->name,
            'phone' => $user?->phone,
            'status' => $member->status(),
            'days_left' => $member->daysLeft(),
            'membership_expires_at' => $member->membership_expires_at?->toDateString(),
            'nonaktif_karena_akun' => (bool) ($user?->trashed() ?? false),
        ];
    }

    private function presentAbsen(Attendance $absen): array
    {
        return [
            'id' => $absen->id,
            'jam' => $absen->checked_in_at?->format('H:i'),
            'tanggal' => $absen->checked_in_at?->toDateString(),
            'method' => $absen->method,
        ];
    }

    private function hitungHariIni(Member $member): int
    {
        return Attendance::query()
            ->where('member_id', $member->id)
            ->where('checked_in_at', '>=', now()->startOfDay())
            ->count();
    }
}
