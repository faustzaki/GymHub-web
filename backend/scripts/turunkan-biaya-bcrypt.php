<?php

/**
 * Turunkan biaya bcrypt akun pengembangan ke BCRYPT_ROUNDS yang berlaku sekarang.
 *
 * Kenapa perlu: sandi lama sudah ter-hash dengan cost 12, dan Laravel memeriksa sandi memakai cost
 * yang tertulis DI DALAM hash-nya, bukan yang ada di .env. Jadi menurunkan BCRYPT_ROUNDS saja tidak
 * membuat masuk jadi cepat -- hash-nya harus dibuat ulang. Cost 12 butuh ~0,35 detik tiap masuk di
 * mesin ini; cost 4 butuh ~0,02 detik.
 *
 * Sandi dibaca dari frontend/.env.local (berkas itu diabaikan git, jadi tidak ada sandi yang
 * tertulis di dalam skrip ini).
 *
 * Pakai: php scripts/turunkan-biaya-bcrypt.php        -> lewat composer script
 *        php scripts/turunkan-biaya-bcrypt.php cek    -> cuma periksa, tidak mengubah
 */

require __DIR__.'/../vendor/autoload.php';

$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$hanyaCek = in_array('cek', $argv, true);

$berkasEnv = __DIR__.'/../../frontend/.env.local';
$kunci = ['VITE_DEV_ADMIN_PASSWORD=', 'VITE_DEV_PASSWORD='];
if (is_file($berkasEnv)) {
    foreach (file($berkasEnv, FILE_IGNORE_NEW_LINES) as $baris) {
        foreach ($kunci as $awalan) {
            if (str_starts_with(trim($baris), $awalan)) {
                $sandiDev = trim(explode('=', $baris, 2)[1], " \t\"'");
            }
        }
    }
}

$akun = User::whereIn('email', ['owner@gymhub.local', 'admin@gymhub.local'])->get();
if ($akun->isEmpty()) {
    fwrite(STDERR, "Tidak ada akun pengembangan di database.\n");
    exit(1);
}

foreach ($akun as $u) {
    $info = password_get_info($u->password);
    $cost = $info['options']['cost'] ?? '?';
    $infoAlgoritma = $info['algoName'] ?? '?';
    if ($hanyaCek) {
        echo "  {$u->email}: {$infoAlgoritma} cost {$cost}\n";
        continue;
    }
    if ($sandiDev === null) {
        fwrite(STDERR, "VITE_DEV_PASSWORD tidak ditemukan di frontend/.env.local.\n");
        exit(1);
    }
    $u->password = Hash::make($sandiDev);
    $u->save();
    $baru = password_get_info($u->password);
    echo "  {$u->email}: cost {$cost} -> {$baru['options']['cost']} (algoritma {$baru['algoName']})\n";
}

if (! $hanyaCek) {
    echo 'BCRYPT_ROUNDS di .env: '.(env('BCRYPT_ROUNDS') ?: 'bawaan')."\n";
}
