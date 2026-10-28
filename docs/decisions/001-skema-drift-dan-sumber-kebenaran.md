# 001 — Basis data dev menyimpang dari migrasi; migrasi dijadikan sumber kebenaran

**Tanggal:** 2026-10-28
**Status:** diterima
**Konteks:** PRD-001 langkah 1 (skema + endpoint admin)

## Yang ditemukan

`php artisan migrate` **gagal langsung** dengan `SQLSTATE[42S21]: Duplicate column name 'role'`.
Setelah diperiksa pakai `SHOW COLUMNS`, ternyata basis data dev jauh berbeda dari isi
`backend/database/migrations/`:

| Ada di basis data dev | Ada di migrasi? |
| --- | --- |
| `users.role` enum(`admin`,`coach`,`user`) | **tidak** — tidak ditulis di migrasi mana pun |
| `users.phone` varchar(20), tanpa indeks unik | tidak |
| `users.status` enum(`active`,`inactive`,`suspended`) | tidak |
| `users.deleted_at`, `users.last_login_at` | tidak |
| `members.subscription_plan` enum(`trial`,`basic`,`pro`,`elite`) | tidak — dan bertentangan dengan keputusan "hanya member bulanan" |
| `members.subscription_status` enum(`active`,`expired`,`cancelled`) | tidak |
| — | `members.member_code`, `membership_started_at`, `plan_months` **tidak ada di DB** |

Isinya juga barang sisa seeder `User::factory()`: 51 baris `users`, 49 baris `members`, dengan
nama contoh (`coach.budi@example.com`, `admin@gymhub.com`) dan **nomor HP kembar**
(`081234567890` dipakai dua akun) — artinya indeks unik pada `phone` tidak mungkin dipasang
di atas data itu.

Temuan pendamping: `app/Models/User.php` ternyata **rusak** — ada tiga baris sisa (cuplikan
`casts`) setelah kurung tutup kelas, sehingga `php -l` gagal dan seluruh aplikasi Laravel tidak
pernah bisa boot. Sebelumnya tidak ada tanda apa pun karena backend belum pernah dipanggil
sungguhan; FE jalan sendiri di atas data mock.

## Keputusan

1. **Folder `migrations/` adalah sumber kebenaran skema.** Kolom tidak boleh ditambah lewat
   phpMyAdmin. Kalau DB berbeda dari migrasi, yang diperbaiki adalah DB-nya.
2. Basis data dev di-**`migrate:fresh`** lalu di-seed ulang dengan `AdminSeeder` (admin + 2 member
   contoh). Data lama **dicadangkan** ke
   `Projects/_backup/gymhub_gymwebsite-sebelum-prd001.sql` (34 KB) — bisa dipulihkan kalau ternyata
   masih dibutuhkan.
3. Migrasi baru **tetap dijaga `Schema::hasColumn()`**. Murah, dan membuat `migrate` tidak meledak
   kalau ada DB lain (laptop kedua, server lama) yang juga menyimpang.
4. Kolom lama `subscription_plan` / `subscription_status` **tidak dibuang** dari DB yang sudah
   menyimpang — dibiarkan supaya tidak ada data yang hilang diam-diam, dan dicatat di sini sebagai
   utang bersih-bersih.
5. `DatabaseSeeder` berhenti membuat "Test User" dari factory — itu sumber baris sampah yang tidak
   dipakai layar mana pun.

## Akibat

- Basis data dev sekarang **cocok dengan migrasi**, dan `migrate:fresh --seed` bisa diulang kapan
  saja tanpa error.
- 12 endpoint hidup dan terbukti lewat `curl` (bukti 15/15 di `docs/prd/001-...`): login admin,
  penjaga peran 401/403, daftar member, tolak nomor duplikat (409), perpanjangan bulanan
  (waktu itu 1/3/6 bulan; sekarang 1–24 bulan — lihat PRD-001 v1.2).
- Nama basis data masih `gymhub_gymwebsite` — memakai nama lama yang dilarang brand. Tidak
  diubah sekarang (butuh menyunting `.env` + membuat DB baru); masuk daftar bersih-bersih.
- Aturan baru: kalau backend memberi "500 misterius" setelah penyuntingan model, **jalankan
  `php -l` lebih dulu** — pelajaran dari `User.php` yang rusak tanpa gejala.
