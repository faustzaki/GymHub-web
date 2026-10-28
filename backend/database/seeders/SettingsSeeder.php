<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

/**
 * Harga dasar (keputusan P3): satu harga per durasi, bulanan Rp 200.000.
 *
 * P5: HANYA harga bulanan yang diisi. Harga paket 3/6/12 bulan, biaya pendaftaran, dan info gym
 * sengaja dibiarkan KOSONG -- owner yang mengisinya lewat pengaturan. Angka yang muncul tanpa
 * pernah diisi akan terlihat resmi padahal cuma tebakan. Riwayat pembayaran karangan?
 * Tidak ada -- angka uang di panel owner mulai dari nol.
 *
 * Tidak menimpa nilai yang sudah ada: seed ulang tidak boleh mengembalikan harga yang sudah
 * diubah owner di layar pengaturan.
 */
class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        if (Setting::value(Setting::PRICE_MONTHLY) !== null) {
            $this->command?->info('Harga bulanan sudah ada, dibiarkan: '.Setting::value(Setting::PRICE_MONTHLY));

            return;
        }

        Setting::putMany([Setting::PRICE_MONTHLY => '200000'], null);
        $this->command?->info('Harga bulanan diset 200000 -- kunci lain dibiarkan kosong.');
    }
}
