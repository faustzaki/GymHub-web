# GymHub — Manajemen Anggota Gym

Aplikasi web pengganti pencatatan anggota gym secara manual: petugas mendaftarkan anggota,
memperpanjang masa aktif, dan menonaktifkan yang sudah berhenti. Owner melihat ringkasannya.

Fase pertama **hanya mengurus keanggotaan** — jadwal, progres, dan materi latihan belum masuk
lingkup (lihat PRD-001).

## Tumpukan

| Lapis | Teknologi |
| --- | --- |
| Frontend | React 19 + Vite 8 + TypeScript + Tailwind 4 + shadcn/ui, Zustand |
| Backend | Laravel 13 + Sanctum (API saja) |
| Basis data | MySQL (Laragon lokal), zona waktu **Asia/Jakarta** |
| Font | Plus Jakarta Sans |

## Menjalankan

```bash
# Backend (port 8001)
cd backend && composer install && cp .env.example .env
php artisan key:generate && php artisan migrate && php artisan db:seed
php artisan serve --port=8001

# Frontend (port 5178)
cd frontend && cp .env.example .env.local && npm install && npm run dev
```

Langkah lengkap, port, dan pemeriksaannya: [docs/workflow.md](docs/workflow.md).

## Keadaan Sekarang

- **Panel petugas (`/admin/members`)** — daftar anggota, pendaftaran, perpanjangan, nonaktifkan.
  Sudah tersambung API dan teruji. Ini bagian yang paling matang.
- **Landing publik (`/`)** — tampil, tapi **angkanya masih contoh**. Data gym sebenarnya (biaya,
  alat, PT, alamat, jam) belum masuk; lihat [PRODUCT.md](PRODUCT.md) bagian Data yang belum ada.
- **Panel owner (`/owner`)**, **dashboard member**, **dashboard coach** — belum dibangun.
- **Masuk otomatis saat mode pengembangan**, supaya tidak bolak-balik login saat mengerjakan
  tampilan. Mati sendiri di build produksi — jangan diandalkan sebagai pengaman.

## Dokumentasi

Mulai dari **[docs/README.md](docs/README.md)**: daftar semua dokumen, mana yang hidup, mana yang
arsip, dan urutan membacanya. Untuk AI coding agent: [AGENTS.md](AGENTS.md).
