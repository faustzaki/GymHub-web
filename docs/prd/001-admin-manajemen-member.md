# PRD-001 — Admin: Manajemen Member

| | |
|---|---|
| **Status** | **v1.0** — lingkup pendaftaran terkunci (2026-10-28) |
| **Pemilik** | josjis |
| **Fase** | 1 dari urutan baru: **satu fitur, FE + API bareng** |
| **Permukaan** | Dashboard admin (`/admin/members`) — desktop & HP |
| **Ketergantungan** | `docs/api-contract.md`, `docs/db-schema.md`. **Tidak** bergantung pada Booking / Payment / Gallery |

---

## 0. Keputusan yang sudah dikunci

| # | Keputusan | Alasan |
|---|---|---|
| K1 | Pendaftaran **hanya oleh admin**, saat member datang ke gym. **Tidak ada pendaftaran online.** | Jalur utama gym lokal; halaman `/register` publik tidak dipakai lagi |
| K2 | Admin hanya menanyakan **nama** dan **nomor telepon**. Tidak ada field lain yang wajib | Member berdiri di depan; makin sedikit yang diketik, makin kecil salahnya |
| K3 | Member baru **tidak diberi kata sandi** di fase ini. Akses login dibuat nanti saat dashboard member dibangun (§12) | Kata sandi hanya berguna kalau ada layar yang dipakai member. Sekarang belum ada |
| K4 | Masa aktif awal otomatis **+30 hari**, bisa dikoreksi admin dari panel detail | Supaya pendaftaran tetap 2 field, tapi masa aktif tetap punya nilai |
| K5 | Nomor telepon = **identitas unik**. Nama boleh kembar, dipakai sebagai username tampilan | "Budi" bisa ada tiga; nomor HP tidak |
| K6 | `member_code` dibuat otomatis di belakang layar untuk rujukan admin, **tidak ditanyakan** ke member | Berguna untuk struk/laporan, tanpa menambah beban admin |

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

1. Admin bisa mendaftarkan member baru dari HP dalam **< 60 detik**, dengan **2 field wajib saja**
   (nama + nomor telepon).
2. Satu layar untuk melihat, mencari, dan memperpanjang masa aktif member.
3. Data member benar-benar tersimpan di backend — bukan mock — dan bisa dibaca kembali setelah
   halaman dimuat ulang.
4. Menghapus **seluruh** mock manajemen user yang ada sekarang (956 baris) dan menggantinya dengan
   alur nyata, tanpa menyisakan dua sumber kebenaran.

## 3. Bukan cakupan fase ini

Ditulis eksplisit supaya tidak melebar seperti kemarin:

- Pendaftaran mandiri lewat halaman publik (halaman `/register` akan dimatikan, lihat §10)
- Membuat/mengirim kata sandi untuk member (rencananya di §D)
- Booking / jadwal / kelas berkelompok
- Pembayaran daring, harga paket, laporan keuangan, `transactions`
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
- **Member** — profil gym milik seorang user ber-role `member`. Punya nomor HP, masa aktif, dan
  (opsional, menyusul) tinggi/berat/tujuan latihan.
- **Akses login** — kemampuan seorang member masuk ke aplikasi. Di fase ini **semua member baru
  tidak punya akses login**. Ini keadaan normal, bukan kekurangan.

## 6. Cerita pengguna & kriteria selesai

### US-1 — Daftarkan member baru (jalur utama)

> Sebagai admin, saat calon member berdiri di depan saya, saya ingin mencatat **namanya** dan
> **nomor HP-nya**, lalu langsung selesai.

**Kriteria selesai**

- [ ] Form meminta **tepat 2 hal wajib**: nama (username) dan nomor HP. Nama tidak perlu unik.
- [ ] Nomor HP dinormalisasi sebelum divalidasi: spasi, tanda hubung, dan awalan `+62`/`62`
      dirapikan ke bentuk `08…`; format akhir harus `^08[0-9]{7,12}$`.
- [ ] Nomor HP **tidak boleh duplikat**. Kalau sudah ada, admin diberi tahu **nama member yang
      sudah memakai nomor itu** dan ditawari "buka member itu" — bukan sekadar "gagal".
- [ ] Masa aktif otomatis **+30 hari** dan tanggal berakhirnya **ditampilkan sebelum disimpan**,
      dengan kontrol kecil untuk mengubah durasi (tidak wajib disentuh).
- [ ] Selesai → notifikasi `sonner` "Member tersimpan", form tertutup, dan member baru
      **langsung terlihat di baris atas daftar** tanpa perlu memuat ulang halaman.
- [ ] Tombol simpan terkunci saat proses berjalan (tidak bisa dobel-klik).
- [ ] Kalau jaringan gagal: data yang sudah diketik **tidak hilang**, ada tombol coba lagi,
      dan pesan galat menyebut apa yang harus dilakukan.
- [ ] Target: dari tekan "Tambah member" sampai notifikasi muncul **< 60 detik** untuk jalan
      lurus — diuji dengan stopwatch, bukan perasaan.

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

- [ ] Panel detail: nama, nomor HP, masa aktif mulai/berakhir, status, riwayat perpanjangan,
      dan catatan "Belum punya akses login".
- [ ] Tombol "Perpanjang" menambah durasi dari:
      - **tanggal berakhir lama** kalau masih aktif (tidak memotong sisa waktu), atau
      - **hari ini** kalau sudah kadaluarsa.
      Aturan yang dipakai **tertulis di panel** supaya admin tahu.
- [ ] Setiap perpanjangan tercatat: siapa adminnya, kapan, jadi tanggal berapa.
- [ ] Nama dan nomor HP bisa dikoreksi dari panel ini (kasus salah ketik di US-1).

### US-4 — Nonaktifkan & aktifkan kembali

> Saya ingin member yang berhenti tidak muncul di daftar harian, tapi datanya tidak lenyap.

- [ ] "Nonaktifkan" (soft delete) menyembunyikan member dari daftar default; filter `Nonaktif`
      bisa menampilkannya kembali.
- [ ] Menonaktifkan member yang masa aktifnya masih berjalan memerlukan konfirmasi eksplisit yang
      menyebut tanggal berakhirnya.
- [ ] "Aktifkan kembali" tersedia untuk member nonaktif.
- [ ] Tidak ada tombol "hapus permanen" di UI fase ini.

> US-5 lama ("daftarkan member tanpa email") **dihapus** — bukan lagi kasus khusus. Email memang
> tidak pernah ditanyakan (K2), jadi tidak ada jalur kedua yang perlu diurus.

## 7. Model data

Perubahan pada skema yang ada (bukan tabel baru, kecuali yang disebut).

### `users` — tambah

| Kolom | Tipe | Kenapa |
|---|---|---|
| `role` | enum(`member`,`coach`,`admin`) default `member`, index | **Hilang saat ini.** Tanpa ini middleware `role:admin` di kontrak API tidak mungkin jalan, dan dashboard admin tidak bisa diamankan |
| `phone` | varchar(20) **unique**, wajib untuk member | Identitas utama (K5). Dicari & divalidasi |
| `email` | varchar(255) **nullable** unique | Member walk-in sering tidak punya email (K2) |
| `password` | varchar(255) **nullable** | Member baru belum punya kata sandi (K3) |
| `credential_issued_at` | timestamp nullable | `null` = belum punya akses login. Penanda eksplisit, bukan tebakan dari kolom lain |
| `deleted_at` | timestamp nullable | Soft delete — pakai `SoftDeletes` bawaan Laravel, **bukan** kolom `is_deleted` bikinan sendiri seperti di mock lama |
| `created_by_user_id` | FK users.id nullable | Siapa admin yang mendaftarkan |

### `members` — tambah

| Kolom | Tipe | Kenapa |
|---|---|---|
| `member_code` | varchar(12) unique | Dibuat otomatis (`BFG-0001`) untuk rujukan admin. **Tidak ditanyakan** ke member (K6) |
| `membership_started_at` | date nullable | Dasar perhitungan sisa waktu & perpanjangan |
| `plan_days` | integer nullable default 30 | Durasi paket terakhir; dasar perpanjangan (K4) |
| `membership_expires_at` | timestamp nullable | **Sudah ada.** Tetap jadi sumber status |

Kolom lama `height` / `weight` / `goal` tetap, tetap opsional — dipakai fitur lain nanti.

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
| POST | `/api/admin/members` | Daftarkan member baru. Body: `name`, `phone`, `plan_days` (opsional, default 30) |
| GET | `/api/admin/members/{id}` | Detail + riwayat perpanjangan |
| PATCH | `/api/admin/members/{id}` | Koreksi nama / nomor HP |
| POST | `/api/admin/members/{id}/renew` | Perpanjang; body: `plan_days` |
| POST | `/api/admin/members/{id}/deactivate` | Soft delete |
| POST | `/api/admin/members/{id}/reactivate` | Batal soft delete |

Jawaban satu baris member:

```json
{
  "id": 12,
  "member_code": "BFG-0012",
  "name": "Budi Santoso",
  "phone": "08123456789",
  "membership_started_at": "2026-10-28",
  "membership_expires_at": "2026-11-27",
  "plan_days": 30,
  "status": "aktif",
  "days_left": 30,
  "has_login": false,
  "is_active": true
}
```

`POST /api/admin/members` untuk nomor HP yang sudah terpakai mengembalikan **409** dengan
`data.existing_member` berisi `{id, name, member_code}` supaya UI bisa menawarkan "buka member itu".

## 9. Validasi (server **dan** klien, sumber kebenaran di server)

| Field | Aturan | Pesan ke admin (bahasa manusia) |
|---|---|---|
| `name` | wajib, 2–80 karakter, **tidak** harus unik | "Nama member wajib diisi." |
| `phone` | wajib; setelah normalisasi `^08[0-9]{7,12}$`; unik di `users` | "Nomor HP ini sudah dipakai <Nama>. Buka member itu?" |
| `plan_days` | opsional, integer 1–730, default 30 | "Durasi paket tidak masuk akal." |

Prinsip pesan galat: **menyebut apa yang harus dilakukan**, bukan mengulang nama kolom database.

## 10. Yang harus dibongkar dari kode yang ada

Bukan menambah di atas mock, tapi menggantinya. Daftar kerja konkret:

- [ ] `lib/mock/dummy-users.ts` — hapus
- [ ] `store/useUserManagementStore.ts` — hapus. Ini **sumber kebenaran kedua** untuk data yang
      sama dengan `hooks/useUserManagement.ts`; pilih **satu**: data server di hook, sisanya state UI lokal
- [ ] `pages/admin/users/*` — ganti jadi `pages/admin/members/*`, komponen tabel/filter/panel dipertahankan
      (sudah bagus) tetapi disambungkan ke API nyata
- [ ] Halaman `/register` publik — arahkan ke "datang langsung ke gym" atau matikan; yang
      mendaftar adalah admin (K1). `POST /api/register` ikut dinonaktifkan kalau halaman itu mati
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
- Daftar 15 baris pertama tampil < 1,5 detik pada jaringan lokal.
- `per_page` dibatasi maksimum 100 di server.

## 12. Rencana akses login member (fase berikutnya — belum dikerjakan sekarang)

Fase ini **tidak** membuat kata sandi. Alasannya: kata sandi hanya berguna kalau ada layar yang
dipakai member untuk masuk, dan dashboard member belum dibangun. Membuatnya sekarang berarti
menyimpan data rahasia tanpa pemakainya.

Saat dashboard member dibangun, aturan yang **tidak boleh** dilanggar:

- **Jangan** memakai satu kata sandi template untuk semua member. Nomor HP itu setengah publik;
  dengan sandi seragam, siapa pun yang tahu nomor temannya bisa masuk ke akun temannya. Satu
  kebocoran = seluruh daftar member terbuka.
- **Jangan** menurunkan kata sandi dari data yang bisa ditebak (6 digit terakhir nomor HP, tanggal
  lahir). Itu sama saja dengan tidak berkata sandi.
- Yang dipakai: tombol **"Buat akses login"** di panel admin → sistem membuat kata sandi acak
  **8 karakter** tanpa huruf/angka yang mudah tertukar (`0/O`, `1/l/I`), ditampilkan **sekali** dengan
  tombol salin untuk dibacakan admin ke member → member **wajib menggantinya** saat masuk pertama →
  kalau lupa, admin membuat ulang (yang lama tidak bisa dilihat lagi).
- Kata sandi disimpan hanya sebagai hash (`Hash::make`).

Diperkirakan masuk PRD-002 bersama dashboard member.

### 12.1 Pertanyaan yang masih terbuka

1. **Uang.** Fase ini mencatat **durasi + tanggal berakhir** saja. Apakah harga paket dan status
   pembayaran (Lunas / separuh) perlu dicatat sekarang? Kalau ya, tabel `payments` minimal sebaiknya
   disiapkan di fase ini supaya tidak menambah migrasi di belakang.
   → Kalau tidak dijawab, fase 1 jalan tanpa harga.

## 13. Definisi selesai (diuji, bukan diklaim)

- [ ] Migration `role` + `phone` + `email` nullable + `password` nullable + `credential_issued_at`
      + soft delete di `users`, kolom baru di `members`, tabel `membership_renewals` — `php artisan migrate` bersih
- [ ] Seeder akun admin, bisa login, `role = admin`
- [ ] 7 endpoint §8 hidup, diuji lewat `curl` dengan token admin — keluarannya ditempel di laporan
- [ ] `/admin/members` bisa dibuka **hanya** oleh admin; member biasa dapat 403 (dibuktikan, bukan diasumsikan)
- [ ] US-1 dijalankan di browser sungguhan: **2 field saja**, member muncul lagi setelah **refresh**
- [ ] Nomor HP duplikat ditolak dengan menyebut nama pemilik nomor itu (diuji)
- [ ] `dummy-users.ts` dan `useUserManagementStore.ts` hilang dari repo
- [ ] Build hijau, lint **tidak menambah** dari baseline 14
- [ ] Tangkapan layar: daftar (desktop + HP), form tambah, panel detail, perpanjang, keadaan kosong, keadaan gagal

## 14. Urutan kerja (satu fitur, FE + API bareng)

1. Skema + seeder admin + `EnsureRole` → uji lewat curl
2. 8 endpoint + uji curl (bukti ditempel)
3. Ganti mock → API di FE (daftar, cari, filter, halaman)
4. Form tambah member + validasi + keadaan gagal
5. Panel detail + perpanjang + nonaktifkan
6. Bersih-bersih: hapus mock & store kembar, matikan `/register` publik, perbaiki `axios.ts`,
   amankan rute `/admin`
7. Uji ulang semuanya + tangkapan layar

**Aturan yang tidak boleh dilanggar:** jangan mulai langkah berikutnya sebelum langkah sebelumnya
punya bukti. Tidak ada dashboard baru sebelum endpoint-nya ada.
