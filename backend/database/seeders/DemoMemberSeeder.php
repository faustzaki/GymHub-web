<?php

namespace Database\Seeders;

use App\Models\Member;
use App\Models\MembershipRenewal;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

/**
 * Data contoh untuk pengembangan (dummy).
 *
 * Kenapa ada: tanpa sebaran status yang lengkap, filter "akan berakhir" dan "nonaktif" tidak
 * bisa diuji, dan warna badge-nya tidak pernah kelihatan. Seeder ini menghapus seluruh anggota
 * lama -- termasuk baris sampah sisa uji otomatis yang nomornya kosong -- lalu mengisi 15 anggota
 * dengan tanggal yang sengaja disebar.
 *
 * Sebaran: 8 aktif · 3 akan berakhir (<= 7 hari) · 4 nonaktif (2 masa aktifnya lewat,
 * 2 akunnya dimatikan) -- status hanya tiga sejak keputusan josjis 2026-10-28.
 *
 * AMAN: hanya berjalan di lingkungan `local`. Di lingkungan lain seeder ini menolak jalan, jadi
 * tidak akan menghapus data sungguhan.
 *
 * Hapus data ini: php artisan db:seed --class=DemoMemberSeeder   (ulang dari bersih)
 */
class DemoMemberSeeder extends Seeder
{
    /**
     * nama, nomor HP, durasi bulan, selisih hari berakhir dari hari ini, nonaktif?
     *
     * @var array<int, array{0: string, 1: string, 2: int, 3: int, 4?: bool}>
     */
    private array $contoh = [
        ['Andi Prasetyo', '081234500001', 1, 18],
        ['Bagus Nugroho', '081234500002', 3, 62],
        ['Citra Ramadhani', '081234500003', 6, 150],
        ['Dian Permata', '081234500004', 1, 25],
        ['Eko Wibowo', '081234500005', 3, 80],
        ['Fitri Handayani', '081234500006', 1, 12],
        ['Gilang Ramadhan', '081234500007', 6, 120],
        ['Hesti Purwanti', '081234500008', 3, 45],
        ['Irfan Maulana', '081234500009', 1, 6],
        ['Jihan Salsabila', '081234500010', 1, 3],
        ['Kurnia Sandi', '081234500011', 3, 1],
        ['Lukman Hakim', '081234500012', 1, -5],
        ['Mega Sari', '081234500013', 1, -21],
        ['Nanda Pratama', '081234500014', 3, 30, true],
        ['Oscar Setiawan', '081234500015', 1, -10, true],
    ];

    public function run(): void
    {
        if (! app()->environment('local')) {
            $this->command?->warn('DemoMemberSeeder dilewati: hanya untuk lingkungan local.');

            return;
        }

        DB::transaction(function (): void {
            // Baris anggota lama dibuang lewat user-nya: relasi members.user_id memakai
            // onDelete('cascade'), jadi member + riwayat perpanjangannya ikut terhapus.
            User::withTrashed()->where('role', User::ROLE_MEMBER)->forceDelete();

            $admin = User::where('role', User::ROLE_ADMIN)->first();
            $hari = Carbon::today();

            foreach ($this->contoh as $urutan => $baris) {
                [$nama, $nomor, $bulan, $selisihHari] = $baris;
                $nonaktif = $baris[4] ?? false;
                $berakhir = $hari->copy()->addDays($selisihHari);
                $mulai = $berakhir->copy()->subMonths($bulan);

                $user = User::create([
                    'name' => $nama,
                    'phone' => $nomor,
                    'email' => null,
                    'password' => null,
                    'role' => User::ROLE_MEMBER,
                    // Tanpa akses login: anggota mendaftar di gym, bukan mendaftar sendiri.
                    'credential_issued_at' => null,
                    'created_by_user_id' => $admin?->id,
                ]);

                $member = Member::create([
                    'user_id' => $user->id,
                    'member_code' => Member::nextMemberCode(),
                    'membership_started_at' => $mulai,
                    'plan_months' => $bulan,
                    'membership_expires_at' => $berakhir,
                ]);

                // Tiga anggota pertama diberi riwayat perpanjangan supaya layar detail tidak kosong.
                if ($urutan < 3) {
                    MembershipRenewal::create([
                        'member_id' => $member->id,
                        'added_months' => $bulan,
                        'started_from' => $mulai,
                        'expires_at_after' => $berakhir,
                        'created_by_user_id' => $admin?->id,
                        'created_at' => $mulai->copy()->subMonths($bulan),
                    ]);
                }

                if ($nonaktif) {
                    $user->delete(); // soft delete -> status() mengembalikan "nonaktif"
                }
            }
        });

        $this->command?->info('Anggota contoh siap: '.count($this->contoh).' baris (8 aktif, 3 akan berakhir, 4 nonaktif).');
    }
}
