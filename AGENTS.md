# AGENTS.md — Bifrost Gym

Satu-satunya pintu masuk untuk AI coding agent di repo ini. Semua yang perlu diketahui ada di sini
atau di berkas yang ditunjuk di bawah. **Tidak ada folder aturan kedua.**

**Produk:** platform manajemen gym — landing publik + dashboard 3 peran (member / coach / admin).
**Tumpukan:** React 19 + Vite 8 + TS + Tailwind 4 + shadcn/Radix · Laravel 13 + Sanctum · MySQL.

---

## Cara kerja di repo ini (hasil evaluasi cara lama)

Proyek ini pernah mangkrak karena dokumennya lebih luas dari produknya, lalu tiga dashboard
dibangun di atas backend yang belum ada. Empat aturan berikut menggantikan cara itu:

1. **Satu fitur pada satu waktu.** Fitur aktif ditulis di `docs/prd/`. Kalau belum ada PRD-nya,
   tulis PRD dulu — jangan menulis kode lebih dulu.
2. **Endpoint dulu, layar kemudian.** Jangan membangun layar yang memanggil API yang belum ada.
   Kalau terpaksa memakai data contoh, katakan "ini mock" dan catat di PRD.
3. **Bukti sebelum lanjut.** Tiap langkah ditutup dengan keluaran nyata: hasil `curl`, keluaran
   `npm run build`, tangkapan layar. Bukan "sudah selesai".
4. **Jangan menambah peran/dashboard baru** sebelum fitur yang sedang dikerjakan selesai dan teruji.

## Sumber kebenaran

| Berkas | Isi — dan hanya isi ini |
|---|---|
| `AGENTS.md` (berkas ini) | Cara kerja, perintah, larangan |
| `PRODUCT.md` | Produk: pengguna, tujuan, posisi, batasan, prinsip |
| `DESIGN.md` | Visual: palet, tipografi, aturan permukaan, larangan gaya |
| `docs/prd/<nomor>-<slug>.md` | Satu berkas per fitur: lingkup, cerita pengguna, kriteria selesai |
| `docs/api-contract.md` | Bentuk endpoint + konvensi respons |
| `docs/db-schema.md` | Skema database |
| `docs/workflow.md` | Setup lokal, perintah harian |
| `docs/decisions/` | Keputusan arsitektur (ADR), satu berkas per keputusan |

Satu fakta, satu tempat. Kalau sebuah fakta perlu muncul di dua berkas, tulis di satu tempat lalu
tunjuk dari yang lain. Berkas yang mengulang isi tabel ini adalah utang — perbaiki, jangan ditiru.

**Fitur aktif:** [PRD-001 Admin: Manajemen Member](docs/prd/001-admin-manajemen-member.md).

## Larangan

- Nama brand resmi **Bifrost Gym**. Dilarang menulis GymPro / GymHub — termasuk di
  kunci localStorage, nama variabel, dan komentar.
- Emoji dekoratif di UI. Tanpa CTA generik ("Get Started", "Learn More").
- Merah (`#DC2626`) untuk teks isi — rasionya 3,88:1, gagal AA. Merah = material & sinyal.
- Data karangan tanpa tanda. Mock wajib diberi komentar `// dummy` dan disebut di PRD.
- Dependensi baru tanpa alasan tertulis di PRD atau ADR.
  Sudah terpasang tapi **belum dipakai sama sekali**: `xlsx`, `next-themes`, `tailwindcss-animate`.
- Heading yang melompat level, `alt` kosong, target sentuh < 44 px, atau animasi yang mengabaikan
  `prefers-reduced-motion`.

## Perintah

Frontend (dijalankan di `frontend/`):

```bash
npm run dev      # vite, dev server
npm run build    # tsc -b && vite build — WAJIB hijau sebelum bilang selesai
npm run lint     # eslint — baseline 14 error; jangan menambah
```

- Node repo ini butuh **v24.22.1 portabel** (`engine-strict` menolak Node 22 host):
  `C:/Users/faust/AppData/Local/hermes/tools/node-v24.22.1-win-x64`.
- `frontend/tsconfig.app.json` memuat `"ignoreDeprecations": "6.0"` — jangan dihapus.
- Berkas repo memakai **CRLF**; pola multi-baris harus tahan terhadap `\n` dan `\r\n`.

Backend (dijalankan di `backend/`):

```bash
php artisan migrate    # sqlite lokal
php artisan serve      # http://localhost:8000
```

## Keadaan sekarang (per 2026-10-28)

Yang sudah jadi dan terukur: **landing publik** (`/`). Selebihnya belum.

| Hal | Keadaan | Kenapa penting |
|---|---|---|
| `users.role` | **sudah ada** (+ `phone`, `credential_issued_at`, soft delete) | middleware `role:admin` sudah jalan, sudah diuji 401/403/200 |
| Endpoint backend | 12: auth (5) + admin member (7) | `GET/POST /api/admin/members`, `{id}`, `{id}/renew`, `deactivate`, `reactivate` |
| Database dev | sempat **menyimpang** dari migrasi (kolom `role`/`phone`/`subscription_plan` tidak ada di migrasi mana pun) | sudah di-`migrate:fresh` + seed; cadangan ada di `Projects/_backup/gymhub_gymwebsite-sebelum-prd001.sql` |
| Nama basis data | `gymhub_gymwebsite` — memakai nama lama yang dilarang | ganti nama DB saat sempat; bukan penghalang sekarang |
| `app/Models/User.php` | **rusak** (sisa baris setelah kurung tutup -> `php -l` gagal, seluruh app tidak boot) | sudah diperbaiki 2026-10-28; kalau backend "misterius 500", cek `php -l` dulu |
| `/admin` & `/coach` | **di luar `ProtectedRoute`**; penjaga peran masih dikomentari di `App.tsx` | jangan dianggap terlindungi |
| `lib/axios.ts` | `baseURL` masih hardcode `localhost` | harus dari `VITE_API_BASE_URL` |
| Dashboard admin/coach/member di FE | masih jalan di data mock | endpoint-nya sudah siap (12 endpoint); tinggal mengganti mock di FE — langkah 3 PRD-001 |
| `docs/DESIGN.md` | sudah dihapus, isinya digabung ke `DESIGN.md` akar | rujuk `DESIGN.md` saja |
| Dashboard admin & coach | **beku** sampai PRD-001 selesai | jangan lanjutkan keduanya dulu |

Template dokumen `ai-project-docs` (39 berkas, dulu di `.agents/`) sudah **dipindah keluar repo** ke
`C:/Belajar Coding/Projects/_vendor/ai-project-docs` supaya tidak ada dua salinan kebenaran.
Boleh dibaca sebagai rujukan; jangan disalin masuk lagi.

## Konvensi kode singkat

- Komponen: fungsi TypeScript, `PascalCase`, berkas `<Nama>.tsx`.
- Gaya: utility Tailwind + token di `frontend/src/index.css`. Tidak ada CSS per komponen.
- shadcn/ui dipakai apa adanya dari `frontend/src/components/ui/`; jangan menulis ulang tombol/dialog.
- Data server: `axios` + hook. Keadaan UI: `useState`. **Satu sumber kebenaran** — jangan menyimpan
  data yang sama di hook *dan* di store global.
- Komentar dan pesan galat berbahasa Indonesia, menyebut apa yang harus dilakukan pengguna.
