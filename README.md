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

Lihat [.agents/rules/project-context.md](.agents/rules/project-context.md) untuk status terbaru per modul.

## Dokumentasi

| File | Isi |
|------|-----|
| [DESIGN.md](DESIGN.md) | Brand, visual, tone |
| [docs/db-schema.md](docs/db-schema.md) | Skema database |
| [docs/api-contract.md](docs/api-contract.md) | Endpoint API + konvensi |
| [docs/workflow.md](docs/workflow.md) | Setup lokal + konvensi kode |
| [AGENTS.md](AGENTS.md) | Panduan untuk AI coding agent |
