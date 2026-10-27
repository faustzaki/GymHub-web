# PRD-001 — Admin: Manajemen Member

| | |
|---|---|
| **Status** | Draft v0.9 — menunggu 3 jawaban di §12 |
| **Pemilik** | josjis |
| **Fase** | 1 dari urutan baru: **satu fitur, FE + API bareng** |
| **Permukaan** | Dashboard admin (`/admin/members`) — desktop & HP |
| **Ketergantungan** | `docs/api-contract.md`, `docs/db-schema.md`. **Tidak** bergantung pada Booking / Payment / Gallery |

---

## 1. Masalah

Calon member datang lewat Instagram atau WhatsApp, lalu datang ke gym. Saat ini tidak ada tempat
untuk mencatat mereka: pendaftaran hanya bisa lewat `/register` publik yang **dilakukan sendiri oleh
calon member**, dan itu pun langsung membuat akun login dengan email + kata sandi.

Akibatnya:

- Front-desk tidak bisa mendaftarkan orang yang datang langsung — padahal ini jalur utama gym lokal.
- Banyak calon member tidak punya email aktif; mereka punya **nomor WhatsApp**.
- Tidak ada satu tempat untuk melihat siapa yang masa aktifnya habis minggu ini.
- Dashboard admin yang sudah dibangun menjalankan **data karangan** (`generateDummyUsers(50)`) —
  tidak pernah menyentuh backend, jadi belum pernah terbukti bekerja.

## 2. Tujuan

1. Admin bisa mendaftarkan member baru dari HP dalam **< 60 detik**, tanpa mengetik ulang data yang
   bisa dipilih.
2. Satu layar untuk melihat, mencari, dan memperpanjang masa aktif member.
3. Data member benar-benar tersimpan di backend — bukan mock — dan bisa dibaca kembali setelah
   halaman dimuat ulang.
4. Menghapus **seluruh** mock manajemen user yang ada sekarang (956 baris) dan menggantinya dengan
   alur nyata, tanpa menyisakan dua sumber kebenaran.

## 3. Bukan cakupan fase ini

Ditulis eksplisit supaya tidak melebar seperti kemarin:

- Booking / jadwal / kelas berkelompok
- Pembayaran daring, laporan keuangan, `transactions`
- Galeri, materi pelatihan, progres latihan
- Dashboard coach, dashboard member
- Manajemen coach
- Registrasi mandiri member lewat halaman publik (sudah ada, tidak diubah di fase ini)

## 4. Pengguna

**Admin / front-desk** — satu-satunya peran yang memakai layar ini.

- Kerjanya sambil berdiri, satu tangan pegang HP, calon member berdiri di depan.
- Bukan orang teknis. Tidak boleh dipaksa memahami istilah seperti "endpoint", "token", "role".
- Sering salah ketik nomor HP karena mendengar dari mulut orang.
- Butuh kepastian: "tadi datanya kesimpan atau tidak?"

## 5. Istilah (dibekukan di sini, dipakai di seluruh dokumen)

- **User** — siapa pun yang bisa login. Punya `role`: `member` / `coach` / `admin`.
- **Member** — profil gym milik seorang user ber-role `member`.
  Punya nomor HP, tinggi, berat, tujuan latihan, dan masa aktif.
- **Member tanpa akun** — member yang didaftarkan admin **tanpa** email/kata sandi. Ia tetap punya
  baris `users` (email teknis kosong ditandai) supaya skema tetap satu jalur, tetapi tidak bisa
  login sampai admin memberi email + kata sandi.

## 6. Cerita pengguna & kriteria selesai

### US-1 — Daftarkan member baru (jalur utama)

> Sebagai admin, saat calon member berdiri di depan saya, saya ingin mencatat namanya, nomor HP-nya,
> dan paket yang diambil, lalu langsung selesai.

**Kriteria selesai**

- [ ] Form hanya meminta **3 hal wajib**: nama, nomor HP, paket (durasi). Sisanya opsional.
- [ ] Nomor HP divalidasi format Indonesia (`08…`, `+62…`, spasi/tanda hubung diabaikan) dan
      **tidak boleh duplikat**; kalau duplikat, admin diberi tahu **nama member yang sudah ada**
      dan ditawari "buka member itu" — bukan sekadar "gagal".
- [ ] Paket dipilih dari daftar (bukan diketik). Durasi menentukan tanggal berakhir yang
      **langsung ditampilkan** sebelum tombol simpan.
- [ ] Tanggal mulai default hari ini, tapi bisa diubah (mis. member bayar kemarin).
- [ ] Selesai → notifikasi `sonner` "Member tersimpan", form tertutup, dan member baru
      **langsung terlihat di baris atas daftar** tanpa perlu memuat ulang halaman.
- [ ] Tombol simpan terkunci saat proses berjalan (tidak bisa dobel-klik).
- [ ] Kalau jaringan gagal: data yang sudah diketik **tidak hilang**, ada tombol coba lagi,
      dan pesan galat menyebut apa yang harus dilakukan.
- [ ] Target waktu: dari tekan "Tambah member" sampai notifikasi muncul **< 60 detik**
      untuk jalan lurus (diuji dengan stopwatch, bukan perasaan).

### US-2 — Lihat & cari member

> Saya ingin menemukan member dengan mengetik potongan nama atau nomor HP.

- [ ] Kotak cari menyaring di sisi server (bukan menyaring 1 halaman di browser).
- [ ] Bisa mencari pakai **sebagian** nomor HP, mis. `8123` menemukan `0812…`.
- [ ] Filter status: `Aktif` / `Akan berakhir (≤7 hari)` / `Kadaluarsa` / `Nonaktif`.
- [ ] Daftar dimuat per halaman 15 baris dengan nomor halaman.
- [ ] Keadaan yang wajib ada semua: memuat (skeleton), kosong, kosong-karena-filter,
      gagal memuat + tombol coba lagi.
- [ ] Di HP, tabel menjadi **kartu bertumpuk** — tidak ada geser horizontal.

### US-3 — Lihat detail & perpanjang masa aktif

> Seorang member datang dan memperpanjang. Saya ingin menambah durasi tanpa menyentuh data lain.

- [ ] Panel detail: identitas, nomor HP, paket terakhir, tanggal mulai, tanggal berakhir, status.
- [ ] Tombol "Perpanjang" menambah durasi dari:
      - **tanggal berakhir lama** kalau masih aktif (tidak memotong sisa waktu), atau
      - **hari ini** kalau sudah kadaluarsa.
      Aturan mana yang dipakai harus **tertulis di panel** supaya admin tahu.
- [ ] Riwayat perpanjangan tercatat (siapa, kapan, jadi tanggal berapa) — minimal tersimpan di DB.
- [ ] Nomor HP bisa dikoreksi dari panel ini (kasus salah ketik, US-1).

### US-4 — Nonaktifkan & hapus

> Saya ingin member yang berhenti tidak lagi muncul di daftar harian, tapi datanya tidak lenyap.

- [ ] "Nonaktifkan" (soft delete) menyembunyikan member dari daftar default; filter
      "Nonaktif" bisa menampilkannya kembali.
- [ ] Menonaktifkan member yang **masa aktifnya masih berjalan** memerlukan konfirmasi eksplisit
      yang menyebut tanggal berakhirnya.
- [ ] "Aktifkan kembali" tersedia untuk member nonaktif.
- [ ] Tidak ada tombol "hapus permanen" di UI fase ini.

### US-5 — Daftarkan member tanpa email

> Banyak yang datang tidak punya email aktif; saya tetap ingin mendaftarkannya.

- [ ] Email **tidak wajib**. Kalau dikosongkan, sistem membuat penanda internal
      (mis. `member-<kode>@no-email.local`) dan menandai member itu **Tidak bisa login**.
- [ ] Admin bisa melengkapi email + kata sandi sementara kapan pun dari panel detail.
- [ ] Member tanpa akun tetap muncul di daftar, punya kode member, dan bisa dicari.

## 7. Model data

Perubahan pada skema yang ada (bukan tabel baru, kecuali yang disebut).

### `users` — tambah

| Kolom | Tipe | Kenapa |
|---|---|---|
| `role` | enum(`member`,`coach`,`admin`) default `member`, index | **Hilang saat ini.** Tanpa ini middleware `role:admin` di kontrak API tidak mungkin jalan, dan dashboard admin tidak bisa diamankan |
| `phone` | varchar(20) nullable, **unique** | Jalur utama gym: WhatsApp. Dicari & divalidasi |
| `deleted_at` | timestamp nullable | Soft delete. **Pakai SoftDeletes bawaan Laravel**, bukan kolom `is_deleted` bikinan sendiri seperti di mock lama |
| `created_by_user_id` | FK users.id nullable | Siapa admin yang mendaftarkan |

### `members` — tambah

| Kolom | Tipe | Kenapa |
|---|---|---|
| `member_code` | varchar(12) unique, index | Dibacakan admin ke member saat mendaftar; identitas tanpa perlu email |
| `membership_started_at` | date nullable | Untuk tahu sisa waktu, dan dasar perpanjangan |
| `plan_name` | varchar(50) nullable | Paket terakhir yang diambil (mis. "Bulanan") |
| `plan_days` | integer nullable | Durasi paket, dasar perhitungan perpanjangan |

Kolom lama `height`/`weight`/`goal` tetap, tetap opsional — dipakai fitur lain nanti, bukan di layar ini.

**Status adalah hasil hitungan, bukan kolom.** Dihitung dari `membership_expires_at` + `deleted_at`:

| Status | Aturan |
|---|---|
| Nonaktif | `deleted_at` terisi |
| Kadaluarsa | berakhir < hari ini |
| Akan berakhir | berakhir antara hari ini s/d +7 hari |
| Aktif | berakhir > +7 hari |

Alasan: kolom status yang bisa ditulis akan selalu basi — waktu berjalan tanpa ada yang mengubahnya.

### Tabel baru `membership_renewals`

| Kolom | Tipe |
|---|---|
| id | bigint PK |
| member_id | FK members.id CASCADE |
| added_days | integer |
| started_from | date |
| expires_at_after | date |
| created_by_user_id | FK users.id nullable |
| created_at / updated_at | timestamps |

## 8. Kontrak API

Mengikuti konvensi `docs/api-contract.md` (`{status,message,data}`, pagination `items`+`meta`,
galat validasi 422 `errors`). Semua endpoint di bawah `auth:sanctum` + `role:admin`.

> **Catatan kontrak:** `docs/api-contract.md` menyebut `/api/admin/users` untuk list/buat/hapus.
> Ubah menjadi `/api/admin/members` karena isi layarnya adalah profil member (HP, paket, masa
> aktif). Urusan peran user akan jadi endpoint sendiri kalau nanti diperlukan.

| Method | Path | Keterangan |
|---|---|---|
| GET | `/api/admin/members` | List + cari & filter. Query: `q`, `status`, `per_page`, `page` |
| POST | `/api/admin/members` | Daftarkan member baru |
| GET | `/api/admin/members/{id}` | Detail + riwayat perpanjangan |
| PATCH | `/api/admin/members/{id}` | Koreksi data (nama, HP, email, tinggi, berat, goal) |
| POST | `/api/admin/members/{id}/renew` | Perpanjang; body: `plan_days` |
| POST | `/api/admin/members/{id}/deactivate` | Soft delete |
| POST | `/api/admin/members/{id}/reactivate` | Batal soft delete |
| GET | `/api/admin/members/{id}/credential` | Status "bisa login atau belum" (bukan kata sandi) |

Jawaban satu baris member:

```json
{
  "id": 12,
  "member_code": "BFG-0012",
  "name": "Budi Santoso",
  "phone": "08123456789",
  "email": "budi@example.com",
  "can_login": true,
  "plan_name": "Bulanan",
  "membership_started_at": "2026-10-01",
  "membership_expires_at": "2026-10-31",
  "status": "akan_berakhir",
  "days_left": 3,
  "is_active": true
}
```

## 9. Validasi (server **dan** klien, sumber kebenaran di server)

| Field | Aturan | Pesan ke admin (bahasa manusia) |
|---|---|---|
| `name` | wajib, 2–80 karakter | "Nama member wajib diisi." |
| `phone` | wajib, setelah normalisasi `^(\+62\|62\|0)8[0-9]{7,12}$`, unik | "Nomor HP ini sudah dipakai <Nama>. Buka member itu?" |
| `email` | opsional, format email, unik di `users` | "Email ini sudah terdaftar." |
| `plan_days` | wajib saat daftar & perpanjang, integer 1–730 | "Durasi paket tidak masuk akal." |
| `membership_started_at` | opsional, tidak lebih dari 1 tahun ke belakang, tidak di masa depan > 30 hari | "Tanggal mulai di luar batas wajar." |
| `height` / `weight` | opsional, 50–250 cm / 20–400 kg | "Tinggi/berat di luar batas wajar." |

Prinsip pesan galat: **menyebut apa yang harus dilakukan**, bukan mengulang nama kolom database.

## 10. Yang harus dibongkar dari kode yang ada

Bukan menambah di atas mock, tapi menggantinya. Daftar kerja konkret:

- [ ] `lib/mock/dummy-users.ts` — hapus
- [ ] `store/useUserManagementStore.ts` — hapus. Ini **sumber kebenaran kedua** untuk data yang
      sama dengan `hooks/useUserManagement.ts`; pilih **satu**: data server di hook, sisanya state UI lokal
- [ ] `pages/admin/users/*` — ganti jadi `pages/admin/members/*`, komponen tabel/filter/panel dipertahankan
      (sudah bagus) tetapi disambungkan ke API nyata
- [ ] `lib/axios.ts` — `baseURL` dari `import.meta.env.VITE_API_BASE_URL` (sekarang hardcode
      `http://localhost:8000/api`, mati saat di-deploy); kunci token `gymhub_token` → `bifrost_token`
- [ ] `App.tsx` — pindahkan `/admin` ke dalam `<ProtectedRoute>` dan aktifkan penjaga peran admin
      (sekarang dikomentari, jadi `/admin/users` bisa dibuka siapa saja)
- [ ] Tambah `EnsureRole` middleware di backend (sudah direncanakan di `docs/api-contract.md`, belum ada)

## 11. Non-fungsional

- Kontras ≥ 4,5:1 (≥3:1 untuk teks besar); target sentuh ≥ 44 px; `:focus-visible` terlihat;
  navigasi keyboard penuh sampai tombol simpan — mengikuti `PRODUCT.md` §Accessibility.
- **Tanpa dependensi baru.** Pakai yang sudah terpasang: shadcn Table/Dialog/Sheet/AlertDialog,
  `sonner`, `zustand`, `axios`, `lucide-react`.
- Hormati `prefers-reduced-motion` untuk animasi panel.
- Daftar 15 baris pertama harus tampil < 1,5 detik pada jaringan lokal.
- Angka uji: `?per_page=100` harus tetap dilayani tanpa menggantung (batasi maksimum 100 di server).

## 12. Pertanyaan terbuka (menentukan bentuk akhir)

1. **Member tanpa akun:** cukup data member saja (tanpa baris `users` sama sekali), atau tetap
   dibuatkan baris `users` bertanda "tidak bisa login" seperti rancangan §5?
   → Rancangan sekarang memilih yang kedua supaya satu jalur skema.
2. **Paket & harga:** apakah fase ini perlu menyimpan **harga** dan **status pembayaran**
   (mis. "Lunas / Bayar separuh"), atau cukup durasi + tanggal berakhir saja?
   → Kalau harga ikut masuk, sebaiknya tabel `payments` minimal disiapkan di fase ini.
3. **Kode member:** perlu kode yang dibacakan ke member (mis. `BFG-0012`), atau nomor HP sudah cukup
   jadi identitas sehari-hari?

## 13. Definisi selesai (diuji, bukan diklaim)

- [ ] Migration `role` + `phone` + soft delete di `users`, kolom member baru, tabel `membership_renewals`
      jalan di `php artisan migrate` bersih
- [ ] Seeder admin: satu akun admin bisa login, role-nya `admin`
- [ ] 8 endpoint §8 hidup, diuji lewat `curl`/HTTP client dengan token admin — keluarannya ditempel di laporan
- [ ] `/admin/members` bisa dibuka **hanya** oleh admin; member biasa dapat 403 (dibuktikan, bukan diasumsikan)
- [ ] Alur US-1 dijalankan di browser sungguhan, datanya muncul lagi setelah **refresh** (bukti mock sudah hilang)
- [ ] `dummy-users.ts` dan `useUserManagementStore.ts` hilang dari repo
- [ ] Build hijau, lint **tidak menambah** dari baseline 14
- [ ] Tangkapan layar: daftar (desktop + HP), form tambah, panel detail, perpanjang, keadaan kosong, keadaan gagal

## 14. Urutan kerja (satu fitur, FE + API bareng)

1. Skema + seeder admin + `EnsureRole` → uji lewat curl
2. 8 endpoint + uji curl (bukti ditempel)
3. Ganti mock → API di FE (daftar, cari, filter, halaman)
4. Form tambah member + validasi + keadaan gagal
5. Panel detail + perpanjang + nonaktifkan
6. Bersih-bersih: hapus mock & store kembar, perbaiki `axios.ts` & rute terproteksi
7. Uji ulang semuanya + tangkapan layar

**Aturan yang tidak boleh dilanggar:** jangan mulai langkah berikutnya sebelum langkah sebelumnya
punya bukti. Tidak ada dashboard baru sebelum endpoint-nya ada.
