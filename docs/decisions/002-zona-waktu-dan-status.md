# ADR-002 — Zona waktu aplikasi: Asia/Jakarta, bukan UTC

**Status:** diterapkan · 2026-10-28
**Konteks:** Laravel 13 · API hanya · status anggota dihitung dari tanggal

## Masalah

Aplikasi disetel `timezone => 'UTC'` (bawaan Laravel), sementara gym beroperasi di WIB (UTC+7).
Hal yang tampak sepele ini merusak dua hal yang justru jadi inti sistem:

1. **Status masa aktif salah selama 7 jam setiap pagi.** Antara pukul 00:00-07:00 WIB, tanggal di
   server masih kemarin. Anggota yang masa aktifnya berakhir kemarin terbaca **"akan berakhir"**,
   bukan "kadaluarsa" — tepat pada jam buka pagi, saat petugas paling butuh jawabannya benar.
2. **Tanggal pendaftaran tercatat sehari sebelumnya.** Anggota yang mendaftar pukul 06:00 WIB
   tersimpan mulai tanggal kemarin.

Bukti terukur (jam dinding 28 Okt 2026, 00:30 WIB, anggota berakhir 27 Okt):

| Zona | Jam server | "Hari ini" versi server | Sisa hari | Status |
| --- | --- | --- | --- | --- |
| UTC | 2026-10-27 17:30 | 2026-10-27 | 0 | akan_berakhir ❌ |
| Asia/Jakarta | 2026-10-28 00:30 | 2026-10-28 | -1 | kadaluarsa ✅ |

## Keputusan

`config/app.php` membaca zona dari `.env`:

```php
'timezone' => env('APP_TIMEZONE', 'UTC'),
```

`APP_TIMEZONE=Asia/Jakarta` di `.env` dan `.env.example`.

## Alasan

- Tanggal di sistem ini **bukan hiasan**: status, masa aktif, dan tenggat perpanjangan semuanya
  dihitung dari tanggal. Zona yang salah bukan bikin tampilan melenceng, tapi bikin keputusan
  petugas salah.
- Menyimpan di UTC lalu mengubah saat menampilkan adalah praktik yang benar untuk sistem lintas
  zona. Sistem ini satu gym, satu zona, dan tidak akan berpindah. Kesederhanaan menang.
- Kalau nanti ada anggota lintas zona, keputusan ini yang pertama ditinjau — bukan dibalik diam-diam.

## Akibat

- Semua `now()`, `Carbon::today()`, dan tanggal yang disimpan memakai WIB.
- Baris lama yang sudah tersimpan dengan tanggal hasil hitungan UTC dibiarkan; data itu data uji
  dan bisa diisi ulang lewat `php artisan db:seed --class=DemoMemberSeeder`.
- Frontend tidak perlu tahu apa pun: tanggal dikirim sebagai `YYYY-MM-DD`, dan pratinjau di layar
  memakai tanggal **lokal** (bukan `toISOString()` yang berbasis UTC — lihat `toISODate()`).
