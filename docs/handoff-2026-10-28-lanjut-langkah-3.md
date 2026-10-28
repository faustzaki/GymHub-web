# Handoff — lanjut PRD-001 langkah 3 (FE admin pakai API nyata)

**Tanggal:** 2026-10-28 · **Sumber:** sesi Hermes josjis (dipindah ke Orca)

## Peta cepat

| Hal | Nilai |
| --- | --- |
| Folder kerja | `C:/Belajar Coding/Projects/GymHub-web` |
| Repo | https://github.com/faustzaki/GymHub-web (publik, branch `main`) |
| Brand | **GymHub** (nama lama Bifrost Gym / GymHub lain DILARANG — `DESIGN.md` akar) |
| Backend | Laravel, MySQL `gymhub_gymwebsite` (Laragon, `C:/laragon/data/mysql-8`) |
| Frontend | React 19 + Vite + Tailwind v4, dev server port **5178** |
| API dev | `php artisan serve` port **8001** |
| Akun admin dev | `admin@gymhub.local` / `admin12345` (dari `AdminSeeder`, bisa diganti lewat `SEED_ADMIN_PASSWORD`) |

## Yang sudah selesai (jangan diulang)

- **PRD-001 v1.1** — lingkup pendaftaran member terkunci: hanya admin yang mendaftarkan (di gym),
  yang ditanya cuma **nama + nomor HP**, **tanpa kata sandi**, **tanpa paket** (bulanan saja,
  pilihan 1 / 3 / 6 bulan), dan **tanpa pencatatan pembayaran** (mendaftar = sudah bayar).
- **Skema + 7 endpoint admin hidup** dan terbukti `16/16` lewat HTTP sungguhan
  (`backend/scripts/api-proof.py`). Penjaga peran `role:admin` sudah jalan (401 / 403 / 200).
- **Rename brand** Bifrost Gym → GymHub seluruh repo + repo GitHub + folder kerja.
- Landing page sudah di-upgrade (sesi sebelumnya), 3 commit landing sudah ikut ter-push.

Baca dulu sebelum menyentuh apa pun:
`AGENTS.md` (aturan kerja) · `DESIGN.md` (aturan desain, brand) · `docs/prd/001-admin-manajemen-member.md`
(PRD + rencana rinci) · `docs/decisions/001-skema-drift-dan-sumber-kebenaran.md` (kenapa migrasi = sumber
kebenaran skema) · `docs/api-contract.md` (kontrak endpoint).

## Tugas berikutnya: langkah 3 PRD-001 — FE dashboard admin pakai API nyata

Semua halaman admin **masih memakai data mock** (angka palsu: 254 member, Rp 15,4M, paket
"Pro Membership", kolom **Email**, status `Pending/Aktif/Tidak Aktif`). Ganti jadi data nyata:

1. **Tabel daftar member** (`/admin/users` → sebaiknya di-rename jadi `/admin/members`):
   - kolom: **Nama · Nomor HP · Kode (`BFG-0001`) · Mulai · Berakhir · Status · Aksi**
   - buang kolom Email dan paket; status **dihitung** backend (`aktif` / `akan_berakhir` /
     `kadaluarsa` / `nonaktif`) — jangan hitung sendiri di FE
   - cari (`?q=` potongan nama / nomor / kode) + filter `?status=`, paginasi dari `meta` balasan API
2. **Tombol "Tambah Member"** → form **2 field saja** (nama + nomor HP) + tombol durasi **1 / 3 / 6
   bulan** (default 1) + tanggal berakhir tampil hidup sebelum disimpan
   - nomor dinormalisasi server (`+62` / `8xx` → `0xx`), jadi jangan normalisasi di FE
3. **Tangani 409** (`data.existing_member`) → tampilkan "Nomor ini sudah dipakai <nama> (<kode>)"
   + tombol buka member itu. Bukan pesan galat generik.
4. **Aksi per baris**: Perpanjang (1/3/6 bulan, `POST /admin/members/{id}/renew`),
   Nonaktifkan / Aktifkan kembali (`deactivate` / `reactivate`).
5. **Matikan pendaftaran online**: halaman `/register` + tombol "Daftar Sekarang" + "Lanjutkan
   dengan Google" di `/login` harus hilang (PRD keputusan K1).
6. **Pasang penjaga**: `/admin/*` masuk `ProtectedRoute` + pemeriksaan peran `admin` (sekarang
   masih di luar penjaga, penjaganya dikomentari di `src/App.tsx`). Member biasa harus kena tolak.
7. `lib/axios.ts` — `baseURL` masih hardcode `localhost`; ambil dari `VITE_API_BASE_URL`.
8. Bersihkan sisa bahasa mock: `/admin` (overview) angka-angka karangan, "Pendaftaran Terbaru"
   dengan "Pro Membership", menu "Keuangan" yang tak dipakai (sesuai PRD: tidak ada pembayaran).

## Cara menjalankan (Windows, shell git-bash)

```bash
# 1. MySQL (Laragon). Kalau mati, nyalakan dari cwd NETRAL -- lihat catatan di bawah
"/c/laragon/bin/mysql/mysql-8.0.30-winx64/bin/mysqld.exe" --datadir="C:/laragon/data/mysql-8" --port=3306 --console

# 2. API
cd "C:/Belajar Coding/Projects/GymHub-web/backend" && php artisan serve --host=127.0.0.1 --port=8001

# 3. FE
cd "C:/Belajar Coding/Projects/GymHub-web/frontend" && npm run dev -- --port 5178 --host 127.0.0.1 --strictPort

# 4. Bukti backend (16 uji, mengecek ISI balasan bukan cuma kode HTTP)
py -3.13 backend/scripts/api-proof.py 8001

# 5. Snapshot skema / data
php artisan migrate:fresh --seed    # data seed: 1 admin + 2 member contoh
```

## Aturan yang mudah dilanggar (sudah pernah bikin kerja ulang)

- **Jangan tambah kolom lewat phpMyAdmin.** Perubahan skema lewat migrasi; `hasColumn()` dipakai
  supaya migrasi aman di DB yang menyimpang. Database dev pernah menyimpang jauh dari migrasi.
- **Server jangan dijalankan dengan cwd di dalam folder kerja.** Proses menahan rename/move folder
  (`Device or resource busy` / WinError 32) dan penyebabnya tak terlihat di Resource Monitor.
- **Brand:** hanya `GymHub`. Jangan tulis Bifrost Gym / GymPro. Emoji dekoratif di heading/tombol
  dilarang. Palet 2 netral + 1 aksen; merah = material & sinyal, bukan warna teks; glow maksimal
  1 elemen per seksi.
- **File `.tsx` di repo ini CRLF** — pola multi-baris kadang perlu `\r\n`.
- **Jangan sebar kata sandi.** Member **tidak** punya sandi di fase ini; sandi hanya dibuat lewat
  tombol "Buat akses login" saat dashboard member dibangun (PRD §12), acak 8 karakter, wajib ganti.
- **Bukti sebelum lanjut.** Setiap langkah selesai = dikerjakan dan diuji (curl / render nyata),
  hasilnya ditempel, bukan diklaim. Uji harus memeriksa isi balasan, bukan cuma kode HTTP —
  pernah ada uji "lulus" padahal `is_active` masih `true` setelah penonaktifan.

## Yang bisa dibuang kalau perlu ruang

- `Projects/_backup/` menyimpan: dump DB sebelum `migrate:fresh`
  (`gymhub_gymwebsite-sebelum-prd001.sql`, 34 KB) dan kode prototipe statis lama
  (`orca-website-gym-prototipe-2026-10-28/`, 44 KB). Keduanya sengaja disimpan.
