# project-context.md — Fitur & status modul

Brand: **Bifrost Gym** — platform manajemen gym digital-first, 3 peran (Member / Coach / Admin).

| Modul | Isi | Status |
|---|---|---|
| Landing publik | Hero, keunggulan, kelas & coach, harga, kontak (`src/pages/public/home/`) | ada, sedang dirombak — lihat `docs/landing-plan.md` |
| Auth | Login, register, sanctum token | jalan |
| Member | Ringkasan latihan, progres | rangka (`src/pages/member/`) |
| Coach | Ringkasan kelas & member | rangka (`src/pages/coach/`) |
| Admin | Manajemen user & coach (tabel, filter, form, ekspor Excel) | jalan dengan data mock |

Referensi wajib sebelum menyentuh sesuatu:
- `DESIGN.md` — brand, warna, tipografi, larangan (sumber kebenaran visual)
- `docs/api-contract.md` + `docs/db-schema.md` — sebelum menyentuh backend
- `docs/landing-plan.md` — rencana landing yang sedang dikerjakan
- `docs/asset-prompts.md` — daftar prompt aset (aset sudah ada di `frontend/public/assets/`)
