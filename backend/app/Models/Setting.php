<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Pengaturan web & kebijakan -- kunci-nilai.
 *
 * Isinya dua jenis yang sengaja disatukan: **kebijakan** (harga) dan **identitas** (nama, alamat,
 * jam buka, nomor WA gym). Dua-duanya ditulis pemilik, dua-duanya dibaca landing, dan dua-duanya
 * jarang berubah -- jadi satu tabel cukup.
 *
 * Aturan harga (keputusan josjis 2026-10-28, P3): **satu harga per durasi**. Diskon per anggota
 * belum masuk lingkup. Harga yang belum diisi dibiarkan KOSONG, bukan ditebak: layar owner
 * menampilkannya sebagai "belum diisi" supaya tidak ada angka karangan yang terlihat resmi.
 */
class Setting extends Model
{
    public const PRICE_REGISTRATION = 'price.registration';

    public const PRICE_MONTHLY = 'price.monthly';

    /**
     * Biaya harian / sekali kunjungan (walk-in). Bukan paket keanggotaan -- tidak menambah masa
     * aktif apa pun, jadi tidak pernah dipakai `priceFor()`. Ada karena itu yang paling sering
     * ditanya orang di depan pintu, dan angkanya harus bisa diubah pemilik tanpa menyentuh kode.
     */
    public const PRICE_DAILY = 'price.daily';

    /**
     * Durasi yang punya harga sendiri. Di luar daftar ini dipakai harga bulanan x bulan.
     *
     * 3 bulan sengaja TIDAK punya harga sendiri (keputusan josjis 2026-10-28): form harga hanya
     * memuat 1 bulan / 6 bulan / 1 tahun, dan 3 bulan dihitung bulanan x 3. Baris `price.months_3`
     * lama dibiarkan di basis data kalau ada, tapi tidak lagi dibaca maupun ditampilkan.
     */
    public const PRICE_PER_DURATION = [6 => 'price.months_6', 12 => 'price.months_12'];

    public const GYM_NAME = 'gym.name';

    public const GYM_ADDRESS = 'gym.address';

    public const GYM_HOURS = 'gym.hours';

    public const GYM_WHATSAPP = 'gym.whatsapp';

    /**
     * URL embed Google Maps (https://www.google.com/maps/embed?pb=...). Disimpan sebagai satu teks,
     * bukan koordinat: pemilik cukup menyalin "Salin HTML"/"Sematkan peta" dari Google Maps, dan
     * tidak perlu mengubah lat/lng setiap kali alamatnya bergeser sedikit.
     */
    public const GYM_MAPS_EMBED = 'gym.maps_embed';

    /** Media sosial. Kosong = tidak ditampilkan di landing (bukan ditampilkan sebagai tautan mati). */
    public const SOCIAL_KEYS = [
        'social.instagram',
        'social.tiktok',
        'social.facebook',
        'social.youtube',
    ];

    /** Kunci yang boleh dibaca publik (landing) -- tanpa kunci internal apa pun. */
    public const PUBLIC_KEYS = [
        self::PRICE_REGISTRATION,
        self::PRICE_DAILY,
        self::PRICE_MONTHLY,
        'price.months_6',
        'price.months_12',
        self::GYM_NAME,
        self::GYM_ADDRESS,
        self::GYM_HOURS,
        self::GYM_WHATSAPP,
        self::GYM_MAPS_EMBED,
        'social.instagram',
        'social.tiktok',
        'social.facebook',
        'social.youtube',
    ];

    protected $primaryKey = 'key';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['key', 'value', 'updated_by_user_id'];

    /** @var array<string, string|null>|null */
    private static ?array $memo = null;

    /** Semua pengaturan dalam satu kueri. Dipanggil beberapa kali per permintaan, jadi diingat. */
    public static function map(): array
    {
        return self::$memo ??= self::query()->pluck('value', 'key')->all();
    }

    /** Lupakan ingatan sementara. Wajib dipanggil setelah menulis, kalau tidak bacaan berikutnya basi. */
    public static function forget(): void
    {
        self::$memo = null;
    }

    public static function value(string $key): ?string
    {
        $value = self::map()[$key] ?? null;

        return ($value === null || $value === '') ? null : $value;
    }

    public static function money(string $key): ?float
    {
        $value = self::value($key);

        return $value === null ? null : (float) $value;
    }

    /**
     * Harga untuk durasi tertentu.
     *
     * @return array{amount: float|null, source: string, key: string|null}
     *         source: `paket` (harga khusus durasi itu), `bulanan` (diturunkan dari harga bulanan),
     *         `kosong` (belum ada harga sama sekali)
     */
    public static function priceFor(int $months): array
    {
        $key = self::PRICE_PER_DURATION[$months] ?? ($months === 1 ? self::PRICE_MONTHLY : null);

        if ($key !== null) {
            $harga = self::money($key);
            if ($harga !== null) {
                return ['amount' => $harga, 'source' => $key === self::PRICE_MONTHLY ? 'bulanan' : 'paket', 'key' => $key];
            }
        }

        // Durasi tanpa harga sendiri: diturunkan dari harga bulanan. Ini patokan, bukan kebenaran --
        // petugas boleh menimpa nominalnya saat mencatat pembayaran.
        $bulanan = self::money(self::PRICE_MONTHLY);
        if ($bulanan !== null) {
            return ['amount' => $bulanan * $months, 'source' => 'bulanan', 'key' => self::PRICE_MONTHLY];
        }

        return ['amount' => null, 'source' => 'kosong', 'key' => $key];
    }

    /**
     * @param  array<string, string|null>  $pairs
     */
    public static function putMany(array $pairs, ?int $userId): void
    {
        foreach ($pairs as $key => $value) {
            self::query()->updateOrCreate(
                ['key' => $key],
                ['value' => $value, 'updated_by_user_id' => $userId],
            );
        }

        self::forget();
    }

    /** Untuk landing: hanya kunci publik, dan angka kosong dikirim sebagai null (bukan 0). */
    public static function publicPayload(): array
    {
        $map = self::map();
        $out = [];

        foreach (self::PUBLIC_KEYS as $key) {
            $value = $map[$key] ?? null;
            $out[$key] = ($value === null || $value === '') ? null : $value;
        }

        return $out;
    }
}
