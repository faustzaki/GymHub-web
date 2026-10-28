<?php

/**
 * Bersihkan sisa data uji dari basis data dev.
 *
 * Dipanggil `scripts/api-proof.py` setelah pengujiannya selesai. Sebelumnya pembersihan itu
 * memakai `php artisan tinker --execute` dengan perintah panjang penuh kutip -- di lingkungan ini
 * tinker sering gagal, dan setiap kali gagal, data ujinya tertinggal: database dev perlahan penuh
 * anggota palsu dan daftar anggota di layar jadi menyesatkan. Skrip berdiri sendiri lebih mudah
 * dipanggil dan keluarannya bisa dipercaya.
 *
 * Pakai: php scripts/bersihkan-data-uji.php <kode-anggota> [email-akun]
 */

require __DIR__ . '/../vendor/autoload.php';

$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Member;
use App\Models\Payment;
use App\Models\User;

/** Hapus permanen: model ini tidak memakai SoftDeletes, tapi penjaga ini menjaga kalau berubah. */
function hapusPermanen($model): void
{
    if (method_exists($model, 'forceDelete')) {
        $model->forceDelete();

        return;
    }

    $model->delete();
}

$kode = $argv[1] ?? null;
$email = $argv[2] ?? null;

$dibuang = ['anggota' => 0, 'akun' => 0, 'pembayaran' => 0];

if ($kode !== null && $kode !== '') {
    foreach (Member::where('member_code', $kode)->get() as $anggota) {
        $dibuang['pembayaran'] += $anggota->payments()->count();
        $anggota->user?->forceDelete();
        hapusPermanen($anggota);
        $dibuang['anggota']++;
    }
}

if ($email !== null && $email !== '') {
    foreach (User::where('email', $email)->get() as $akun) {
        if ($akun->member) {
            $dibuang['pembayaran'] += $akun->member->payments()->count();
            hapusPermanen($akun->member);
            $dibuang['anggota']++;
        }
        hapusPermanen($akun);
        $dibuang['akun']++;
    }
}

// Pembayaran yatim: baris uang yang anggotanya sudah tidak ada bikin laporan uang masuk berbohong.
foreach (Payment::whereNotIn('member_id', Member::pluck('id'))->get() as $yatim) {
    hapusPermanen($yatim);
    $dibuang['pembayaran']++;
}

echo 'dibuang: ' . json_encode($dibuang)
    . ' | sisa: ' . json_encode(['anggota' => Member::count(), 'pembayaran' => Payment::count()])
    . PHP_EOL;
