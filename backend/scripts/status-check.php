<?php
/**
 * Cek batas status masa aktif — satu perintah, jalan sendiri.
 *
 * Status anggota dihitung dari tanggal (`Member::status()`), dan batas hari itu satu-satunya
 * bagian yang gampang salah tanpa kelihatan: sehari meleset berarti anggota yang sudah habis masa
 * aktifnya masih dilayani, atau sebaliknya. Skrip ini membuat anggota sementara tepat di sekitar
 * ambang, memeriksa statusnya, lalu membersihkannya kembali.
 *
 * Jalankan dari folder backend:  php scripts/status-check.php
 *
 * Keluar dengan kode 1 kalau ada satu saja yang tidak sesuai.
 */

$base = dirname(__DIR__);

require $base.'/vendor/autoload.php';
$app = require $base.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Member;
use App\Models\User;
use Illuminate\Support\Carbon;

$hariIni = Carbon::today();
$admin = User::where('role', User::ROLE_ADMIN)->first();
$nomorUji = '0899000000';

// nama, tambahan hari (null = tanpa tanggal berakhir), nonaktif, status yang diharapkan
$kasus = [
    ['Uji Batas H-1', -1, false, 'nonaktif'],
    ['Uji Batas Hari Ini', 0, false, 'akan_berakhir'],
    ['Uji Batas H+1', 1, false, 'akan_berakhir'],
    ['Uji Batas H+7', 7, false, 'akan_berakhir'],
    ['Uji Batas H+8', 8, false, 'aktif'],
    ['Uji Batas Tanpa Tanggal', null, false, 'nonaktif'],
    ['Uji Batas Nonaktif', 30, true, 'nonaktif'],
];

$gagal = 0;
printf("hari ini: %s (zona %s)\n\n", $hariIni->toDateString(), config('app.timezone'));

try {
    foreach ($kasus as $urutan => [$nama, $tambahan, $nonaktif, $harapan]) {
        $nomor = $nomorUji.str_pad((string) ($urutan + 1), 2, '0', STR_PAD_LEFT);

        $user = User::create([
            'name' => $nama,
            'phone' => $nomor,
            'email' => null,
            'password' => null,
            'role' => User::ROLE_MEMBER,
            'created_by_user_id' => $admin?->id,
        ]);

        $anggota = Member::create([
            'user_id' => $user->id,
            'member_code' => Member::nextMemberCode(),
            'membership_started_at' => $hariIni->copy()->subMonth(),
            'plan_months' => 1,
            'membership_expires_at' => $tambahan === null ? null : $hariIni->copy()->addDays($tambahan),
        ]);

        if ($nonaktif) {
            $user->delete();
        }

        $anggota->refresh();
        $dapat = $anggota->status();
        $cocok = $dapat === $harapan;
        $gagal += $cocok ? 0 : 1;

        printf(
            "%-24s berakhir %-12s sisa %3s -> %-15s %s\n",
            $nama,
            $anggota->membership_expires_at?->toDateString() ?? '(kosong)',
            $anggota->membership_expires_at ? $anggota->daysLeft() : '-',
            $dapat,
            $cocok ? 'OK' : "SALAH (harusnya {$harapan})"
        );
    }
} finally {
    // Selalu bersihkan, walaupun ada yang meledak di tengah jalan.
    $dibuang = User::withTrashed()->where('phone', 'like', $nomorUji.'%')->forceDelete();
    printf("\ndibersihkan %d anggota uji\n", $dibuang);
}

printf("hasil: %d dari %d sesuai\n", count($kasus) - $gagal, count($kasus));
exit($gagal === 0 ? 0 : 1);
