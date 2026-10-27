<?php

namespace Database\Seeders;

use App\Models\Member;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Akun admin untuk menguji PRD-001 (tanpa admin, tidak ada yang bisa membuka layar manajemen member).
 *
 * Kata sandi diambil dari `SEED_ADMIN_PASSWORD` di .env. Kalau tidak diisi, dipakai nilai
 * pengembangan yang jelas-jelas sekali pakai, dan itu DICETAK ke layar supaya tidak diam-diam.
 * Jangan pakai nilai bawaan di server yang bisa diakses dari luar.
 *
 * Seeder ini juga membuat satu member contoh supaya daftar tidak kosong saat UI diuji. Datanya
 * sengaja diberi penanda "(contoh)" -- lihat aturan tanda mock di AGENTS.md.
 */
class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $sandi = env('SEED_ADMIN_PASSWORD');
        $bawaan = $sandi === null;
        $sandi = $sandi ?: 'admin12345';

        $admin = User::updateOrCreate(
            ['email' => 'admin@bifrost.local'],
            [
                'name' => 'Admin Bifrost',
                'phone' => '08110000001',
                'password' => Hash::make($sandi),
                'role' => User::ROLE_ADMIN,
                'credential_issued_at' => now(),
                'email_verified_at' => now(),
            ]
        );

        $this->command?->info("Admin siap: {$admin->email} (peran: {$admin->role})");
        if ($bawaan) {
            $this->command?->warn("SEED_ADMIN_PASSWORD belum diisi -> kata sandi sementara: {$sandi}");
        }

        $contoh = [
            ['name' => 'Budi Santoso (contoh)', 'phone' => '081200000002', 'bulan' => 1],
            ['name' => 'Sari Wijaya (contoh)', 'phone' => '081200000003', 'bulan' => 3],
        ];

        foreach ($contoh as $c) {
            $user = User::withTrashed()->firstOrCreate(
                ['phone' => $c['phone']],
                [
                    'name' => $c['name'],
                    'role' => User::ROLE_MEMBER,
                    'created_by_user_id' => $admin->id,
                ]
            );

            if ($user->member()->exists()) {
                continue;
            }

            $mulai = now()->startOfDay();

            $member = Member::create([
                'user_id' => $user->id,
                'membership_started_at' => $mulai,
                'plan_months' => $c['bulan'],
                'membership_expires_at' => $mulai->copy()->addMonthsNoOverflow($c['bulan']),
            ]);

            $member->member_code = Member::nextMemberCode();
            $member->save();
        }

        $this->command?->info('Member contoh dibuat: '.Member::count().' baris');
    }
}
