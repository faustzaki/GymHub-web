<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Akun pemilik gym untuk panel owner (rencana dashboard owner, tahap 1).
 *
 * Tiru AdminSeeder: kata sandi dari SEED_ADMIN_PASSWORD bila ada, kalau tidak, nilai
 * pengembangan sekali pakai yang DICETAK ke layar supaya tidak diam-diam. Pemilik itu satu
 * orang -- kalau sandinya perlu beda dari admin, isi env terpisah nanti.
 */
class OwnerSeeder extends Seeder
{
    public function run(): void
    {
        $sandi = env('SEED_ADMIN_PASSWORD');
        $bawaan = $sandi === null;
        $sandi = $sandi ?: 'admin12345';

        $owner = User::updateOrCreate(
            ['email' => 'owner@gymhub.local'],
            [
                'name' => 'Owner GymHub',
                'phone' => '08110000002',
                'password' => Hash::make($sandi),
                'role' => User::ROLE_OWNER,
                'credential_issued_at' => now(),
                'email_verified_at' => now(),
            ]
        );

        $this->command?->info("Owner siap: {$owner->email} (peran: {$owner->role})");
        if ($bawaan) {
            $this->command?->warn('SEED_ADMIN_PASSWORD belum diisi -> kata sandi sementara: '.$sandi);
        }
    }
}
