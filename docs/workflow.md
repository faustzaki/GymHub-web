# Workflow & Setup — Bifrost Gym

## Setup Lokal (Laragon)

### Backend (Laravel)
```bash
# Di folder /backend
composer install
cp .env.example .env          # lalu isi DB_DATABASE, DB_USERNAME, DB_PASSWORD sesuai Laragon
php artisan key:generate
php artisan migrate
php artisan db:seed            # seed user test
php artisan serve              # running di http://localhost:8000
```

Konfigurasi `.env` minimum untuk Laragon:
```
APP_URL=http://localhost:8000
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=bifrost_gym
DB_USERNAME=root
DB_PASSWORD=
```

CORS: pastikan `config/cors.php` ada. Di Laravel 11+, jalankan:
```bash
php artisan config:publish --tag=cors
```
Lalu set `allowed_origins` ke `['http://localhost:5173']` dan `supports_credentials` ke `true`.

### Frontend (React/Vite)
```bash
# Di folder /frontend
cp .env.example .env.local     # buat file ini dulu
npm install
npm run dev                    # running di http://localhost:5173
```

Isi `frontend/.env.local`:
```
VITE_API_BASE_URL=http://localhost:8000/api
```

> Catatan: `lib/axios.ts` harus diubah dari hardcode `http://localhost:8000/api` ke `import.meta.env.VITE_API_BASE_URL`.

## Struktur Folder

```
bifrost-gym/ (root)
├── AGENTS.md              ← Entry file semua rules agent
├── DESIGN.md              ← Design direction (brand, visual, tone)
├── README.md              ← Overview proyek untuk manusia
├── docs/
│   ├── db-schema.md       ← Skema database lengkap
│   ├── api-contract.md    ← Endpoint skeleton + konvensi response
│   └── workflow.md        ← File ini
├── frontend/              ← React + Vite
│   └── src/
│       ├── components/    ← UI components (shadcn/ui + custom)
│       ├── pages/         ← Route-level pages
│       ├── layouts/       ← Layout wrappers (PublicLayout, DashboardLayout, dll)
│       ├── hooks/         ← Custom React hooks (logika dipisah dari UI)
│       ├── store/         ← Zustand stores (global state)
│       ├── lib/
│       │   ├── axios.ts   ← Konfigurasi axios global
│       │   ├── services/  ← Service layer (ganti mock ke API call di sini)
│       │   └── mock/      ← TEMPORARY — hapus saat backend siap
│       └── assets/        ← Gambar statis
└── backend/               ← Laravel
    ├── app/
    │   ├── Http/
    │   │   ├── Controllers/   ← Satu file per resource
    │   │   └── Middleware/    ← EnsureRole.php wajib ada
    │   └── Models/            ← Eloquent models
    ├── database/
    │   ├── migrations/        ← Satu migration per tabel/perubahan
    │   └── seeders/           ← Seed data test realistis (bukan dummy Barat)
    └── routes/
        └── api.php            ← Semua route API (hapus /test-integration sebelum production)
```

## Konvensi Kode

### Frontend
- Nama file komponen: PascalCase (`HeroSection.tsx`)
- Nama file hook: camelCase dengan prefix `use` (`useScrollNavbar.ts`)
- Semua teks UI dalam Bahasa Indonesia (kecuali label teknis)
- Import shadcn/ui dari `@/components/ui/*`
- Styling hanya Tailwind utility class, tidak boleh inline style kecuali nilai dinamis (transform, dll)

### Backend
- Satu controller per resource, method standar: `index`, `show`, `store`, `update`, `destroy`
- Response selalu gunakan format standar (lihat `docs/api-contract.md`)
- Validasi di controller menggunakan `Validator::make()` atau Form Request class
- Nama tabel: snake_case plural (`progress_logs`, `coach_certifications`)
- Kolom FK: `{singular_table}_id` (`member_id`, `coach_id`)

## Catatan Kritis Saat Ini
- `backend/app/Models/User.php` punya parse error (baris duplikat setelah closing brace). Perbaiki sebelum apapun.
- Auth frontend MASIH MOCK. Jangan deploy atau demo ke klien sebelum auth diganti ke API nyata.
- Route `/api/test-integration` harus dihapus sebelum production.
- Mock data di `frontend/src/lib/mock/` bersifat sementara; jangan tambah file baru di sana.
