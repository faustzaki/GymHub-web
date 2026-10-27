# system-context.md — Lingkungan lokal

- OS: Windows. Shell agent: bash (git-bash). Path native pakai `C:/...` untuk program Windows.
- Laragon menyediakan PHP/MySQL. Backend: `cd backend && php artisan serve`.
- Frontend: `cd frontend && npm install && npm run dev` -> http://localhost:5173
- Env frontend: `frontend/.env.local` (contoh di `frontend/.env.example`).

Verifikasi (jalankan sebelum bilang selesai):

```bash
cd frontend
npm run build     # tsc -b + vite build
npm run lint      # eslint
```

Catatan yang sudah terbukti:
- `npm run build` **gagal** sebelum `ignoreDeprecations` dipasang: `error TS5101` soal `baseUrl`.
- `npm run lint` punya **26 error bawaan** (unused vars, `any`). Target: **jangan menambah error baru**.
- Kalau `node` di PATH terlalu tua, pakai yang portabel: `C:/Users/faust/AppData/Local/hermes/tools/node-v24.22.1-win-x64/node.exe`.
