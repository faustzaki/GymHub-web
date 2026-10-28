# GymHub — Frontend

React 19 + Vite 8 + TypeScript + Tailwind 4 + shadcn/ui. Satu aplikasi berisi landing publik dan
panel petugas.

## Menjalankan

```bash
npm install
cp .env.example .env.local   # VITE_API_BASE_URL=http://127.0.0.1:8001/api
npm run dev                  # http://127.0.0.1:5178
```

Node: repo ini `engine-strict` dan menolak Node 22 — pakai **v24.22.1** portabel
(`C:/Users/faust/AppData/Local/hermes/tools/node-v24.22.1-win-x64`).

## Perintah

```bash
npm run dev      # dev server, port 5178
npm run build    # tsc -b && vite build -- wajib hijau sebelum bilang selesai
npm run lint     # baseline 14 error; jangan menambah
```

## Masuk Saat Pengembangan

`npm run dev` masuk sendiri supaya tidak bolak-balik login saat mengerjakan tampilan:

- `VITE_DEV_ADMIN_EMAIL` + `VITE_DEV_ADMIN_PASSWORD` di `.env.local` (masuk `.gitignore`).
- Penjaga rute (`routes/ProtectedRoute.tsx`) dilewati hanya ketika `import.meta.env.DEV` benar.
- **Build produksi selalu meminta login** — bypass tidak ikut terbawa.
- Untuk menguji penjaganya: jalankan dev dengan `VITE_DEV_BYPASS_AUTH=0`.

## Susunan

| Folder | Isi |
| --- | --- |
| `src/pages/public/` | Landing publik |
| `src/pages/admin/members/` | Panel petugas — modul yang sudah tersambung API |
| `src/pages/admin/overview/` | Ringkasan admin — belum dirutekan, disiapkan untuk panel owner |
| `src/pages/auth/` | Halaman masuk |
| `src/pages/member/`, `src/pages/coach/` | Sisa fase lama, belum dipakai |
| `src/layouts/` | PublicLayout, AuthLayout, AdminLayout, DashboardLayout, CoachLayout |
| `src/hooks/` | Data server (`useMembers`, …) |
| `src/lib/services/` | Panggilan API per resource; status dan tanggal dibentuk di sini |
| `src/components/ui/` | shadcn/ui — pakai apa adanya, jangan ditulis ulang |

## Aturan

- Status anggota dihitung backend; FE hanya menerjemahkan ke label dan warna
  (`pages/admin/members/status.ts`).
- Tanggal tampilan **jangan** lewat `toISOString()` — itu UTC dan menggeser hari di WIB.
- Berkas `.tsx` memakai CRLF.
- Semua teks UI berbahasa Indonesia.

Setup lengkap dan daftar masalah yang sering muncul: `../docs/workflow.md`.
