# Database Schema — GymHub

> **Sumber kebenaran skema adalah `backend/database/migrations/`.** Dokumen ini ringkasan bacaan
> saja; kalau berbeda, migrasi yang benar dan dokumen ini yang harus diperbarui.
> Jangan menambah kolom lewat phpMyAdmin — lihat `decisions/001-skema-drift-dan-sumber-kebenaran.md`.

Zona waktu aplikasi **`Asia/Jakarta`**. Kolom bertipe `date` dibaca sebagai tanggal lokal; jangan
menghitung selisih hari dengan UTC (ADR-002).

---

## Tabel yang Ada

### `users` — akun, termasuk petugas dan (nanti) pemilik

Dari `0001_01_01_000000_create_users_table` + `add_member_management_fields_to_users_table`.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | bigint PK | |
| name | varchar(255) | |
| email | varchar(255) unique, **nullable** | Anggota yang belum pernah masuk tidak punya email |
| email_verified_at | timestamp nullable | |
| password | varchar(255), **nullable** | Anggota baru belum punya sandi sampai kredensialnya diterbitkan |
| role | enum(`member`,`coach`,`admin`), default `member`, index | Peran; `admin` = petugas. Pemilik (`owner`) **belum** ada di enum |
| phone | varchar(20) unique, nullable | Identitas anggota. Disimpan ternormalisasi: `081299998888` |
| credential_issued_at | timestamp nullable | Kapan kredensial masuk diberikan ke anggota |
| created_by_user_id | bigint FK → users.id, nullOnDelete | Petugas yang mendaftarkan |
| deleted_at | timestamp nullable | Soft delete = **dinonaktifkan**. Anggota yang dimatikan tidak dihapus sungguhan |
| remember_token, created_at, updated_at | | |

### `members` — data keanggotaan

Dari `create_members_table` + `add_membership_fields_to_members_table`.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | bigint PK | |
| user_id | bigint FK → users.id, cascade | |
| member_code | varchar(12) unique, nullable | Nomor anggota, mis. `GH-0001`. Dihitung dari kode tertinggi yang ada |
| membership_started_at | date nullable | Awal masa aktif yang sedang berjalan |
| membership_expires_at | timestamp nullable | Akhir masa aktif. **Kosong = nonaktif** |
| plan_months | unsignedSmallInteger, default 1 | Paket terakhir, dalam bulan |
| height | decimal(5,2) nullable | cm |
| weight | decimal(5,2) nullable | kg |
| goal | varchar nullable | |
| created_at, updated_at | | |

**Status anggota tidak disimpan sebagai kolom** — dihitung dari tanggal + soft delete di
`Member::status()`. Nilainya tiga: `aktif` · `akan_berakhir` (≤7 hari lagi) · `nonaktif`
(lewat tenggat atau akunnya dimatikan) — ADR-003.
Batas 24 bulan pada `plan_months` dijaga di controller, bukan di kolom.

### `membership_renewals` — riwayat perpanjangan

Dari `create_membership_renewals_table`. Ditulis otomatis oleh endpoint perpanjang, tidak pernah
diisi manual.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | bigint PK | |
| member_id | bigint FK → members.id, cascade | |
| started_from | date | Tanggal berakhir yang lama — perpanjangan menyambung dari sini, sisa hari tidak hangus |
| expires_at_after | date | Tanggal berakhir setelah perpanjangan |
| created_by_user_id | bigint FK → users.id, nullOnDelete | Petugas yang memproses |
| created_at, updated_at | | |

### Tabel bawaan Laravel

`password_reset_tokens`, `sessions`, `cache`, `cache_locks`, `jobs`, `job_batches`, `failed_jobs`,
`personal_access_tokens` (token Sanctum). Tidak perlu disentuh.

---

## Yang **Tidak** Dibangun

Ada di rencana lama, tapi **di luar lingkup sekarang** — jangan dibuat tanpa PRD:

| Tabel | Kenapa ditunda |
| --- | --- |
| `coaches`, `coach_certifications`, `coach_social_media` | Peran coach belum dipakai |
| `schedules`, `progress_logs`, `todos`, `materials`, `member_materials` | Dashboard anggota & coach — fase berikutnya |
| `transactions` | Pendaftaran dianggap sudah dibayar; **tidak ada pencatatan pembayaran** di fase ini |

Data lama dari buku/Excel **tidak diimpor**.

---

## Relasi

```
User 1—1 Member        (user_id) — role 'member'
User 1—N Member        (created_by_user_id) — petugas yang mendaftarkan
Member 1—N MembershipRenewal
```

## Aturan yang Menjaga Data

- **Nomor HP unik.** Pendaftaran dengan nomor yang sudah terpakai dibalas **409** + data anggota
  yang sudah ada, supaya petugas ditawari membuka anggota itu, bukan membuat kembaran.
- **Nonaktif = soft delete**, bukan hapus. Riwayat perpanjangan tetap utuh.
- **Kode anggota tidak pernah dipakai ulang.** Dihitung dari kode tertinggi, bukan dari `id` baris.
