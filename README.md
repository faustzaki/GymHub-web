# Bifrost Gym — Platform Manajemen Gym Digital

Platform manajemen gym digital-first untuk komunitas lokal. Member bisa akses jadwal latihan, progres harian, dan materi pelatihan secara online. Coach kelola kurikulum. Admin pantau operasional dan keuangan.

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 19 + Vite 8 + Tailwind CSS v4 + shadcn/ui |
| State | Zustand 5 |
| Backend | Laravel 13 + Sanctum |
| Database | MySQL (local: Laragon) |
| Font | Plus Jakarta Sans |

## Setup

Lihat [docs/workflow.md](docs/workflow.md) untuk instruksi lengkap.

**TL;DR:**
```bash
# Backend
cd backend && composer install && cp .env.example .env
php artisan key:generate && php artisan migrate && php artisan serve

# Frontend
cd frontend && cp .env.example .env.local && npm install && npm run dev
```

## Status Modul

Landing publik sudah jadi dan terukur. Dashboard member/coach/admin masih memakai data mock dan
belum tersambung backend. Fitur yang sedang dikerjakan: **PRD-001 Admin: Manajemen Member**
([docs/prd/001-admin-manajemen-member.md](docs/prd/001-admin-manajemen-member.md)).
Keadaan teknis terkini ada di [AGENTS.md](AGENTS.md).

## Dokumentasi

| File | Isi |
|------|-----|
| [PRODUCT.md](PRODUCT.md) | Produk: pengguna, tujuan, batasan, prinsip |
| [DESIGN.md](DESIGN.md) | Brand, visual, tone |
| [docs/prd/](docs/prd/) | PRD per fitur |
| [docs/db-schema.md](docs/db-schema.md) | Skema database |
| [docs/api-contract.md](docs/api-contract.md) | Endpoint API + konvensi |
| [docs/workflow.md](docs/workflow.md) | Setup lokal + konvensi kode |
| [AGENTS.md](AGENTS.md) | Panduan untuk AI coding agent |
