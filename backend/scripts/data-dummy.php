<?php

/**
 * Data dummy untuk mengisi panel supaya tidak terlihat kosong (permintaan josjis 2026-10-28).
 *
 * Skrip berdiri sendiri, bukan `artisan tinker --execute`: tinker dengan kutip panjang pernah
 * gagal diam-diam (lihat catatan di scripts/bersihkan-data-uji.php).
 *
 * Arah pembuatannya SENGAJA dari riwayat pembayaran ke masa aktif, bukan sebaliknya: pembayaran
 * terakhir terjadi di masa lalu, lalu `membership_expires_at` = tanggal itu + durasi yang dibeli.
 * Dua akibat penting:
 *   1. Tidak ada pembayaran bertanggal masa depan. Uang yang belum diterima tidak dicatat --
 *      versi pertama skrip ini salah di situ, dan `uang_bulan_ini` di Ringkasan Owner jadi
 *      membengkak (Rp 47,6 juta padahal grafik bulanannya cuma Rp 7,8 juta).
 *   2. Status anggota (aktif / akan berakhir / nonaktif) muncul dari kapan terakhir dia bayar,
 *      persis seperti kejadian sungguhan.
 *
 * `created_at` TIDAK bisa diatur lewat `create()`: kolomnya tidak fillable, jadi Eloquent
 * menimpanya dengan waktu sekarang dan semua anggota dummy tampak "baru bulan ini". Diatur lewat
 * query builder setelah barisnya ada.
 *
 * Nomor HP semua berawalan 0899 supaya data dummy bisa dikenali dengan mata telanjang; id-nya
 * dicatat di storage/app/dummy-ids.json supaya bisa dibersihkan PERSIS (data asli tidak tersentuh).
 *
 * Pakai:
 *   php scripts/data-dummy.php isi [jumlah]   -> bawaan 78 anggota
 *   php scripts/data-dummy.php bersih         -> hapus persis yang dibuat skrip ini
 *   php scripts/data-dummy.php cek            -> lihat jumlah sekarang tanpa mengubah apa pun
 */

require __DIR__.'/../vendor/autoload.php';

$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Member;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

const HARGA_PER_BULAN = 200000;
const AWALAN_HP_DUMMY = '0899';

$berkasId = __DIR__.'/../storage/app/dummy-ids.json';
$mode = $argv[1] ?? 'cek';

// ----------------------------------------------------------------------------- cek
if ($mode === 'cek') {
    echo '  anggota   : '.Member::count().' (dummy tercatat: '.jumlahDummy($berkasId).')'.PHP_EOL;
    echo '  pembayaran: '.Payment::count().PHP_EOL;

    return;
}

// --------------------------------------------------------------------------- bersih
if ($mode === 'bersih') {
    if (! is_file($berkasId)) {
        echo '  tidak ada catatan data dummy; tidak ada yang dihapus.'.PHP_EOL;

        return;
    }
    $id = json_decode((string) file_get_contents($berkasId), true) ?: [];
    $anggota = $id['members'] ?? [];
    $akun = $id['users'] ?? [];

    $pembayaran = Payment::whereIn('member_id', $anggota)->delete();
    $barisAnggota = Member::whereIn('id', $anggota)->delete();
    // withTrashed: sebagian akun dummy sengaja dimatikan (soft delete), jadi harus dipaksa.
    $barisAkun = User::withTrashed()->whereIn('id', $akun)->forceDelete();

    @unlink($berkasId);
    echo "  dihapus: {$pembayaran} pembayaran, {$barisAnggota} anggota, {$barisAkun} akun".PHP_EOL;
    echo '  sisa   : '.Member::count().' anggota, '.Payment::count().' pembayaran'.PHP_EOL;

    return;
}

// ------------------------------------------------------------------------------- isi
if ($mode !== 'isi') {
    fwrite(STDERR, "Perintah tidak dikenal: {$mode}. Pakai: isi | bersih | cek".PHP_EOL);
    exit(1);
}

$jumlah = max(1, (int) ($argv[2] ?? 78));
$petugas = User::where('role', User::ROLE_ADMIN)->orderBy('id')->first()
    ?? User::where('role', User::ROLE_OWNER)->orderBy('id')->first();
if (! $petugas) {
    fwrite(STDERR, "Tidak ada akun petugas/owner untuk mencatat pembayaran.".PHP_EOL);
    exit(1);
}

$namaDepan = ['Andi', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fitri', 'Gilang', 'Hendra', 'Indra', 'Joko',
    'Kartika', 'Lukman', 'Maya', 'Nadia', 'Oki', 'Putri', 'Rangga', 'Sari', 'Tono', 'Umi',
    'Vina', 'Wahyu', 'Yanti', 'Zaki', 'Agus', 'Bella', 'Cahyo', 'Dian', 'Eka', 'Fajar',
    'Gita', 'Hesti', 'Irfan', 'Jihan', 'Kurnia', 'Lina', 'Mega', 'Nanda', 'Rina', 'Slamet'];

$namaBelakang = ['Pratama', 'Saputra', 'Wijaya', 'Nugroho', 'Ramadhan', 'Hidayat', 'Kusuma',
    'Permata', 'Siregar', 'Halim', 'Maulana', 'Lestari', 'Handayani', 'Purwanti', 'Setiawan',
    'Susanto', 'Firmansyah', 'Anggraini', 'Prasetyo', 'Wibowo', 'Salsabila', 'Ramadhani',
    'Hakim', 'Sandi', 'Rahmawati'];

$tujuan = ['Menurunkan berat badan', 'Menambah massa otot', 'Kebugaran umum', 'Rehabilitasi cedera',
    'Persiapan lomba', 'Postur & mobilitas', null, null];

// Sebaran kelompok anggota. Angka ini yang menentukan isi semua layar: daftar anggota (saring
// status), kartu Ringkasan, dan daftar tagih owner.
$kelompok = [];
for ($i = 0; $i < $jumlah; $i++) {
    $undian = $i % 20;
    $kelompok[] = $undian < 11 ? 'aktif'                  // 55%
        : ($undian < 13 ? 'akan_berakhir'                 // 10% (masa aktifnya tinggal <=7 hari)
        : ($undian < 17 ? 'lewat'                         // 20% (masa aktifnya sudah habis)
        : 'dimatikan'));                                  // 15% (akun dimatikan petugas)
}
shuffle($kelompok);

$kodeTerakhir = (int) preg_replace('/\D/', '', (string) (Member::orderByDesc('member_code')->value('member_code') ?: 'GH-0000'));
$hariIni = Carbon::today();

$idAkun = [];
$idAnggota = [];

DB::transaction(function () use (
    $jumlah, $kelompok, $namaDepan, $namaBelakang, $tujuan, $petugas, $hariIni,
    &$kodeTerakhir, &$idAkun, &$idAnggota
) {
    for ($i = 0; $i < $jumlah; $i++) {
        $grup = $kelompok[$i];
        $dimatikan = $grup === 'dimatikan';

        // Tanggal berakhir ditentukan lebih dulu, lalu pembayaran terakhir DITURUNKAN darinya:
        // bayar terakhir = berakhir - paket, dengan paket = durasi terkecil (1/3/6/12 bulan) yang
        // masih menutupi sisa waktunya. Karena itu bayar terakhir selalu jatuh di masa lalu atau
        // hari ini -- tidak ada uang yang belum diterima tetapi sudah dicatat.
        $berakhir = match ($grup) {
            'aktif' => $hariIni->copy()->addDays(random_int(8, 240)),
            'akan_berakhir' => $hariIni->copy()->addDays(random_int(0, 7)),
            'lewat' => $hariIni->copy()->subDays(random_int(5, 180)),
            default => $hariIni->copy()->addDays(random_int(-120, 200)),
        };

        // Beberapa anggota sengaja dibayar HARI INI: kalau tidak, kolom "Hari ini" dan "Minggu ini"
        // di halaman Uang Masuk tampil Rp 0 -- justru bagian yang paling kelihatan kosong.
        if ($i < 5) {
            $berakhir = $hariIni->copy()->addDays(random_int(27, 33));
        }

        $sisaHari = (int) $hariIni->diffInDays($berakhir, false);
        $paket = 12;
        foreach ([1, 3, 6, 12] as $p) {
            if ($p * 30.44 >= $sisaHari) {
                $paket = $p;
                break;
            }
        }
        $bayarTerakhir = $berakhir->copy()->subMonths($paket);
        if ($bayarTerakhir->gt($hariIni)) {          // jaring pengaman: tidak boleh di masa depan
            $bayarTerakhir = $hariIni->copy();
        }

        // Riwayat sebelumnya: jalan mundur dari pembayaran terakhir, 1-3 kali perpanjangan.
        $kursor = $bayarTerakhir->copy();
        $pembayaran = [[$kursor->toDateString(), $paket]];
        for ($m = 0; $m < random_int(1, 3); $m++) {
            $kursor = $kursor->copy()->subMonths([1, 1, 3, 6][random_int(0, 3)]);
            if ($kursor->lte($hariIni->copy()->subYears(3))) {
                break;
            }
            $pembayaran[] = [$kursor->toDateString(), 1];
        }
        $pembayaran = array_reverse($pembayaran);          // urut dari yang paling lama
        $mulai = Carbon::parse($pembayaran[0][0]);
        $berakhir = $bayarTerakhir->copy()->addMonths($paket);

        $kodeTerakhir++;
        $kode = 'GH-'.str_pad((string) $kodeTerakhir, 4, '0', STR_PAD_LEFT);
        $nama = $namaDepan[$i % count($namaDepan)].' '.$namaBelakang[($i * 7) % count($namaBelakang)];
        $telepon = AWALAN_HP_DUMMY.str_pad((string) (10000000 + ($i + 1) * 1114), 8, '0', STR_PAD_LEFT);

        $akun = User::create([
            'name' => $nama,
            'email' => null,
            'phone' => $telepon,
            'password' => Hash::make('dummy-tidak-untuk-masuk-'.$kode),
            'role' => User::ROLE_MEMBER,
        ]);
        $idAkun[] = $akun->id;

        $anggota = Member::create([
            'user_id' => $akun->id,
            'member_code' => $kode,
            'height' => random_int(0, 9) ? random_int(150, 188) : null,
            'weight' => random_int(0, 9) ? random_int(45, 105) : null,
            'goal' => $tujuan[$i % count($tujuan)],
            'plan_months' => $paket,
            'membership_started_at' => $mulai->toDateString(),
            'membership_expires_at' => $berakhir->toDateString(),
        ]);
        $idAnggota[] = $anggota->id;

        // created_at/updated_at lewat query builder: bukan kolom fillable, jadi `create()` di atas
        // menimpanya dengan waktu sekarang -- itu yang bikin "anggota baru bulan ini" salah hitung.
        $waktuMulai = $mulai->copy()->setTime(9, 0);
        User::whereKey($akun->id)->update(['created_at' => $waktuMulai, 'updated_at' => $waktuMulai]);
        Member::whereKey($anggota->id)->update([
            'created_at' => $waktuMulai,
            'updated_at' => $berakhir->copy()->setTime(17, 0),
        ]);

        $urutan = 0;
        foreach ($pembayaran as [$tanggal, $bulan]) {
            $bayar = Payment::create([
                'member_id' => $anggota->id,
                'kind' => $urutan === 0 ? 'pendaftaran' : 'perpanjangan',
                'method' => random_int(0, 1) ? 'cash' : 'qris',
                'amount' => $bulan * HARGA_PER_BULAN,
                'months' => $bulan,
                'paid_at' => $tanggal,
                'recorded_by_user_id' => $petugas->id,
                'notes' => null,
            ]);
            $waktu = Carbon::parse($tanggal)->setTime(10, 15);
            Payment::whereKey($bayar->id)->update(['created_at' => $waktu, 'updated_at' => $waktu]);
            $urutan++;
        }

        if ($dimatikan) {
            $akun->delete();          // soft delete, sama seperti petugas mematikan akun
            // deleted_at bawaan = waktu sekarang; digeser ke masa lalu supaya "berhenti bulan ini"
            // di Ringkasan Owner tidak menumpuk seluruhnya di satu bulan.
            User::withTrashed()->whereKey($akun->id)->update([
                'deleted_at' => $bayarTerakhir->copy()->addDays(random_int(1, 25))->setTime(11, 0),
            ]);
        }
    }
});

file_put_contents($berkasId, json_encode(['members' => $idAnggota, 'users' => $idAkun], JSON_PRETTY_PRINT));

// ---- ringkasan hasil: dihitung ulang dari database, bukan dari yang barusan dikira-kira ----
$anggotaDummy = Member::whereIn('id', $idAnggota)->with(['user' => fn ($q) => $q->withTrashed()])->get();
$hitung = ['aktif' => 0, 'akan_berakhir' => 0, 'nonaktif' => 0];
foreach ($anggotaDummy as $m) {
    $hitung[$m->status()]++;
}
$pembayaranDummy = Payment::whereIn('member_id', $idAnggota);
$masaDepan = Payment::whereIn('member_id', $idAnggota)->where('paid_at', '>', $hariIni->toDateString())->count();
$terlama = Payment::whereIn('member_id', $idAnggota)->min('paid_at');
$terbaru = Payment::whereIn('member_id', $idAnggota)->max('paid_at');

echo "  dibuat     : {$jumlah} anggota dummy (nomor HP berawalan ".AWALAN_HP_DUMMY.')'.PHP_EOL;
echo '  kode       : GH-0016 .. GH-'.str_pad((string) $kodeTerakhir, 4, '0', STR_PAD_LEFT).PHP_EOL;
echo '  status     : aktif '.$hitung['aktif'].' | akan berakhir '.$hitung['akan_berakhir'].
    ' | nonaktif '.$hitung['nonaktif'].PHP_EOL;
echo '  pembayaran : '.$pembayaranDummy->count().' baris, Rp '.
    number_format((float) $pembayaranDummy->sum('amount'), 0, ',', '.').
    ' ('.$terlama.' .. '.$terbaru.')'.PHP_EOL;
echo '  masa depan : '.($masaDepan === 0 ? 'tidak ada (benar)' : $masaDepan.' BERTANGGAL MASA DEPAN (salah)').PHP_EOL;
echo '  catatan id : storage/app/dummy-ids.json'.PHP_EOL;

function jumlahDummy(string $berkasId): int
{
    if (! is_file($berkasId)) {
        return 0;
    }
    $id = json_decode((string) file_get_contents($berkasId), true) ?: [];

    return count($id['members'] ?? []);
}
