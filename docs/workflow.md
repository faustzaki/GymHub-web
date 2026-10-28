# Workflow & Setup — GymHub

## Port yang Dipakai

| Layanan | Port | Catatan |
| --- | --- | --- |
| Frontend (Vite) | **5178** | `npm run dev`, dari `frontend/` |
| API (Laravel) | **8001** | `php artisan serve --port=8001`, dari `backend/` |
| MySQL | 3306 | Laragon; basis data `gymhub_gymwebsite` |

Port 8000 dan 5173 pernah dipakai proses lain. Port 8000 sekarang menyisakan **socket mati** yang
masih terlihat `LISTENING` — jangan pakai port itu untuk API; permintaan ke sana dijawab 404/405
dan bikin bingung ("route-nya ada kok"). API **selalu 8001**.
Kalau ada yang aneh, **cek port dulu** sebelum curiga ke kode.

## Pertama Kali

```bash
# Backend
cd backend
composer install
cp .env.example .env            # isi DB_* sesuai Laragon
php artisan key:generate
php artisan migrate
php artisan db:seed             # akun petugas + 15 anggota contoh
php artisan serve --port=8001

# Frontend (terminal lain)
cd frontend
cp .env.example .env.local
npm install
npm run dev                     # http://127.0.0.1:5178
```

Node: repo ini memakai `engine-strict` dan menolak Node 22. Pakai Node v24.22.1 portabel di
`C:/Users/faust/AppData/Local/hermes/tools/node-v24.22.1-win-x64`.

## Masuk Saat Pengembangan

Supaya tidak bolak-balik login saat mengerjakan tampilan, aplikasi masuk sendiri saat dijalankan
`npm run dev`. Bukan pengaman — hanya kenyamanan, dan **mati sendiri di build produksi**.

- `frontend/.env.local` (masuk `.gitignore`, jangan di-commit) memuat
  `VITE_DEV_ADMIN_EMAIL` dan `VITE_DEV_ADMIN_PASSWORD` dari akun hasil seeder.
- Penjaganya bisa dipaksa hidup untuk menguji ulang: jalankan dev dengan `VITE_DEV_BYPASS_AUTH=0`.

## Perintah Harian

```bash
# dari frontend/
npm run dev
npm run build     # tsc -b && vite build -- WAJIB hijau sebelum bilang selesai
npm run lint      # baseline 14 error; jangan menambah

# dari backend/
php artisan migrate
php artisan db:seed --class=DemoMemberSeeder --force   # ulang data contoh saja
php -l app/Models/Member.php                           # cek sintaks satu berkas
php scripts/api-proof.py                               # 16 pemeriksaan endpoint
php scripts/status-check.php                           # 7 pemeriksaan batas status
```

`DemoMemberSeeder` menghapus dan menulis ulang 15 anggota contoh (`GH-0001`…`GH-0015`).
Jangan dijalankan di basis data yang sudah memuat data sungguhan.

## Struktur Folder

```
GymHub-web/
├── AGENTS.md                 pintu masuk AI agent
├── PRODUCT.md  DESIGN.md     produk  ·  visual
├── docs/
│   ├── README.md             peta dokumen (mulai dari sini)
│   ├── workflow.md           berkas ini
│   ├── api-contract.md       endpoint
│   ├── db-schema.md          skema
│   ├── prd/                  satu berkas per fitur
│   ├── decisions/            ADR
│   └── landing/              catatan proses landing (arsip)
├── frontend/
│   └── src/
│       ├── pages/            admin/ · auth/ · coach/ · member/ · public/
│       ├── layouts/          PublicLayout, AuthLayout, AdminLayout, ...
│       ├── hooks/            data server (useMembers, ...)
│       ├── store/            Zustand (auth, ...)
│       ├── lib/services/     panggilan API per resource
│       └── components/ui/    shadcn/ui — jangan ditulis ulang
└── backend/
    ├── app/Http/Controllers/ satu berkas per resource
    ├── app/Models/           Eloquent
    ├── database/migrations/  SUMBER KEBENARAN SKEMA
    ├── database/seeders/     AdminSeeder, DemoMemberSeeder
    └── scripts/              api-proof.py, status-check.php
```

## Konvensi Kode

**Frontend**
- Komponen `PascalCase` (`MemberList.tsx`), hook `useCamelCase` (`useMembers.ts`).
- Semua teks UI berbahasa Indonesia.
- Tailwind utility + token di `index.css`; tidak ada CSS per komponen.
- Impor shadcn/ui dari `@/components/ui/*`.
- Berkas `.tsx` memakai CRLF.

**Backend**
- Satu controller per resource; `index`/`show`/`store`/`update`/`destroy` + method aksi.
- Balasan selalu berbentuk `{status, message, data}` — lihat `api-contract.md`.
- Validasi di controller; pesan galat berbahasa Indonesia yang menyebut apa yang harus diperbaiki.
- Migrasi adalah sumber kebenaran skema. **Jangan tambah atau ubah kolom lewat phpMyAdmin** —
  lihat `decisions/001-skema-drift-dan-sumber-kebenaran.md`.

## Kalau Ada yang Aneh

| Gejala | Periksa dulu |
| --- | --- |
| API menjawab 500 tanpa jejak | `php -l` di berkas yang terakhir diubah — satu kurung nyasar mematikan seluruh app |
| Layar nyangkut di kerangka memuat | dua permintaan jalan bareng; cek hook yang memanggil |
| Tanggal tampil bergeser sehari | ada `toISOString()` untuk tanggal tampilan; itu UTC, pakai tanggal lokal |
| Status anggota meleset | `app.timezone` harus `Asia/Jakarta` (ADR-002) |
| Frontend tidak lihat perubahan | proses `vite` basi menahan port 5178 |
