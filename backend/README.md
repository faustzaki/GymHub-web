# GymHub — Backend

API Laravel 13 untuk aplikasi manajemen anggota gym. Hanya API: tidak ada tampilan server-side.

## Menjalankan

```bash
composer install
cp .env.example .env      # isi DB_* sesuai Laragon; APP_TIMEZONE tetap Asia/Jakarta
php artisan key:generate
php artisan migrate
php artisan db:seed       # AdminSeeder + DemoMemberSeeder (15 anggota contoh)
php artisan serve --port=8001
```

Port **8001** (8000 pernah dijajah proses lain dan bikin API tampak hidup tapi tidak menjawab).

## Isi Penting

| Lokasi | Isi |
| --- | --- |
| `app/Http/Controllers/AdminMemberController.php` | Seluruh fitur manajemen anggota: daftar, cari, filter, tambah, perpanjang, nonaktifkan |
| `app/Http/Controllers/AuthController.php` | Masuk, keluar, `me` |
| `app/Http/Middleware/EnsureRole.php` | Penjaga peran; balasannya JSON 401/403 |
| `app/Models/Member.php` | `status()` dan `nextMemberCode()` — dua tempat paling gampang salah |
| `database/migrations/` | **Sumber kebenaran skema** |
| `database/seeders/DemoMemberSeeder.php` | 15 anggota contoh, empat keadaan berbeda |
| `scripts/api-proof.py` | 16 pemeriksaan endpoint |
| `scripts/status-check.php` | 7 pemeriksaan batas status |

## Aturan yang Mudah Terlupakan

- **Zona waktu `Asia/Jakarta`.** Menggantinya ke UTC membuat status dan tanggal pendaftaran
  meleset tiap 00:00–07:00 WIB — lihat `docs/decisions/002-zona-waktu-dan-status.md`.
- **Status anggota tiga: `aktif` · `akan_berakhir` · `nonaktif`**, dihitung di `Member::status()`,
  bukan kolom (ADR-003). Filter `?status=` menolak nilai lain dengan 422.
- **Nomor HP unik dan dinormalisasi** ke bentuk `08…`. Duplikat dibalas 409, bukan 422.
- **Nonaktif = soft delete akun.** Filter `nonaktif` wajib melepas scope soft delete, kalau tidak
  anggotanya hilang dari daftar tepat saat dicari.
- **Perpanjangan menyambung** dari tanggal berakhir lama; sisa hari tidak hangus.
- **Tidak ada tabel pembayaran.** Daftar = otomatis sudah dibayar.

Setup lengkap, port, dan pemeriksaan: `../docs/workflow.md`.
