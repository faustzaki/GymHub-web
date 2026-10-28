# AGENTS.md — GymHub

Pintu masuk untuk AI coding agent di repo ini. Semua yang perlu diketahui ada di sini atau di
berkas yang ditunjuk. **Tidak ada folder aturan kedua.**

Produk: aplikasi manajemen anggota gym (pendaftaran, perpanjangan, nonaktif) — panel petugas untuk
sekarang, panel owner menyusul. Bukan platform latihan digital.
Tumpukan: React 19 + Vite 8 + TS + Tailwind 4 + shadcn/Radix · Laravel 13 + Sanctum · MySQL.

---

## Cara kerja di repo ini

Proyek ini pernah mangkrak karena dokumennya lebih luas dari produknya, lalu tiga dashboard
dibangun di atas backend yang belum ada. Empat aturan berikut menggantikan cara itu:

1. **Satu fitur pada satu waktu.** Fitur aktif ditulis di `docs/prd/`. Kalau belum ada PRD-nya,
   tulis PRD dulu — jangan menulis kode lebih dulu.
2. **Endpoint dulu, layar kemudian.** Jangan membangun layar yang memanggil API yang belum ada.
   Kalau terpaksa memakai data contoh, tandai `// dummy`, dan catat di PRD.
3. **Bukti sebelum lanjut.** Tiap langkah ditutup dengan keluaran nyata: hasil `curl`, keluaran
   `npm run build`, tangkapan layar. Bukan "sudah selesai".
4. **Jangan menambah peran atau dashboard baru** sebelum yang sedang dikerjakan selesai dan teruji.

## Sumber kebenaran

| Berkas | Isi — dan hanya isi ini |
| --- | --- |
| `AGENTS.md` (berkas ini) | Cara kerja, perintah, larangan, keadaan terkini |
| `docs/README.md` | Peta semua dokumen + urutan baca |
| `PRODUCT.md` | Produk: pengguna, tujuan, lingkup, prinsip, data yang belum ada |
| `DESIGN.md` | Visual: palet, tipografi, aturan permukaan, larangan gaya |
| `docs/prd/<nomor>-<slug>.md` | Satu berkas per fitur: lingkup, cerita pengguna, kriteria selesai |
| `docs/api-contract.md` | Bentuk endpoint + konvensi respons |
| `docs/db-schema.md` | Skema database (sumber asli: `backend/database/migrations/`) |
| `docs/workflow.md` | Setup lokal, port, perintah harian |
| `docs/decisions/` | ADR — satu berkas per keputusan, **jangan diubah tanpa alasan baru** |

Satu fakta, satu tempat. Kalau sebuah fakta perlu muncul di dua berkas, tulis di satu tempat lalu
tunjuk dari yang lain. Berkas yang mengulang isi tabel ini adalah utang.

## Larangan

- Nama brand resmi **GymHub** (diputuskan josjis 2026-10-28). Dilarang menulis **Bifrost Gym**,
  **GymPro**, atau `bifrost-gym` — termasuk di kunci localStorage, nama variabel, dan komentar.
- Emoji dekoratif di UI. Tanpa CTA generik ("Get Started", "Learn More").
- Merah (`#DC2626`) untuk teks isi — rasio 3,88:1, gagal AA. Merah = material & sinyal.
- Data karangan tanpa tanda. Angka contoh wajib diberi komentar `// dummy` atau `[angka nyata]`.
- Dependensi baru tanpa alasan tertulis di PRD atau ADR. Terpasang tapi belum dipakai:
  `xlsx` (calon untuk ekspor data), `next-themes`, `tailwindcss-animate`.
- Heading yang melompat level, `alt` kosong, target sentuh < 44 px, animasi yang mengabaikan
  `prefers-reduced-motion`.
- Mengubah `app.timezone` dari `Asia/Jakarta` (ADR-002) atau `Member::status()` jadi empat nilai
  (ADR-003) — dua-duanya pernah jadi sumber bug nyata.
- Menyalakan jalur masuk otomatis dev di build produksi.

## Perintah

Frontend (dijalankan di `frontend/`):

```bash
npm run dev      # vite di port 5178
npm run build    # tsc -b && vite build -- WAJIB hijau sebelum bilang selesai
npm run lint     # eslint -- baseline 14 error; jangan menambah
```

- Node repo ini butuh **v24.22.1 portabel** (`engine-strict` menolak Node 22 host):
  `C:/Users/faust/AppData/Local/hermes/tools/node-v24.22.1-win-x64`.
- `frontend/tsconfig.app.json` memuat `"ignoreDeprecations": "6.0"` — jangan dihapus.
- Berkas `.tsx` repo ini memakai **CRLF**; pola pencocokan teks harus tahan `\n` dan `\r\n`.

Backend (dijalankan di `backend/`):

```bash
php artisan migrate            # MySQL gymhub_gymwebsite
php artisan db:seed            # admin + 15 anggota contoh
php artisan serve --port=8001  # API
php scripts/api-proof.py       # 16 pemeriksaan endpoint
php scripts/status-check.php   # 7 pemeriksaan batas status
```

## Keadaan sekarang (per 2026-10-28)

| Hal | Keadaan |
| --- | --- |
| Panel petugas `/admin/members` | **jadi & teruji** — daftar, cari, filter, tambah, perpanjang, nonaktifkan |
| Masuk saat dev | otomatis (tanpa login) — `DEV_BYPASS_AUTH` + `.env.local`; mati di build produksi |
| Zona waktu | `Asia/Jakarta` (ADR-002). Sebelumnya UTC dan itu membuat status salah tiap 00:00–07:00 WIB |
| Status anggota | **tiga**: `aktif` · `akan_berakhir` (≤7 hari) · `nonaktif` (habis masa aktif atau dimatikan) — ADR-003 |
| Kode anggota | `GH-0001`, dihitung dari kode tertinggi yang ada, bukan dari `id` baris |
| Durasi keanggotaan | pilihan cepat 1/3/6/12 bulan atau disusun sendiri, batas 24 bulan |
| Perpanjangan | menyambung dari tanggal berakhir lama; sisa hari tidak hangus |
| Data contoh | `DemoMemberSeeder` — 15 anggota `GH-0001`…`GH-0015` (8 aktif, 3 akan berakhir, 4 nonaktif) |
| Landing publik | tampil, **angkanya masih contoh** — data gym sebenarnya belum masuk |
| Panel owner, dashboard member/coach | **belum ada** |
| Route sisa | `GET /api/test-integration` dan `GET /api/user` — hapus sebelum produksi |
| `docs/landing/` | catatan proses penggarapan landing — arsip, bukan aturan |

## Konvensi kode singkat

- Komponen: fungsi TypeScript, `PascalCase`, berkas `<Nama>.tsx`.
- Gaya: utility Tailwind + token di `frontend/src/index.css`. Tidak ada CSS per komponen.
- shadcn/ui dipakai apa adanya dari `frontend/src/components/ui/`; jangan menulis ulang tombol/dialog.
- Data server: `axios` + hook. Keadaan UI: `useState`. **Satu sumber kebenaran** — jangan menyimpan
  data yang sama di hook *dan* di store global.
- Komentar dan pesan galat berbahasa Indonesia, menyebut apa yang harus dilakukan pengguna.
- Status dihitung di backend (`Member::status()`); FE hanya menerjemahkan ke label dan warna.

## Kalau ada yang aneh

- Backend "misterius 500" → jalankan `php -l` di berkas yang baru diubah dulu.
- Layar nyangkut di skeleton → biasanya dua permintaan jalan bareng; cek hook-nya.
- Tanggal bergeser sehari → jangan pakai `toISOString()` untuk tanggal tampilan (itu UTC).
