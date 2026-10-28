<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     *
     * Catatan: sebelumnya seeder ini membuat "Test User" dari factory. Itu sumber baris sampah
     * (51 user / 49 member) di database dev yang tidak pernah dipakai layar mana pun. Sekarang
     * yang dijalankan hanya seeder yang memang dibutuhkan untuk menguji PRD-001.
     */
    public function run(): void
    {
        $this->call([
            AdminSeeder::class,
            DemoMemberSeeder::class,
            OwnerSeeder::class,
            SettingsSeeder::class,
        ]);
    }
}
