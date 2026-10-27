# tech-stack.md — Tumpukan teknologi

| Layer | Teknologi | Catatan |
|---|---|---|
| Frontend | React 19 + Vite 8 + TypeScript 6 | entry `frontend/src/main.tsx` |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) + shadcn/ui (Radix) | token lewat `@theme`, bukan `tailwind.config.js` |
| State | Zustand 5 | satu store per domain di `src/store/` |
| Routing | react-router-dom 7 | rute publik & rute terproteksi dipisah |
| Notifikasi | sonner | jangan bikin toast sendiri |
| Backend | Laravel 13 + Sanctum | `backend/` |
| Database | MySQL (Laragon lokal) | skema: `docs/db-schema.md` |
| Font | Plus Jakarta Sans | sudah terpasang, jangan tambah font lain |

Aturan:
- Alias import `@/` menunjuk `src/` (lihat `tsconfig.app.json`).
- **Jangan menambah dependensi baru** untuk hal yang bisa diselesaikan stdlib/browser/CSS. Kalau memang perlu, sebut alasannya dulu.
- `tsconfig.app.json` punya `"ignoreDeprecations": "6.0"` — jangan dihapus, tanpa itu `tsc -b` gagal (TS 6 menolak opsi `baseUrl`).
