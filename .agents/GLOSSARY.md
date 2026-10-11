# 📖 GLOSSARY.md — Business Terminology & Domain Language

> **Purpose:** Dokumen ini mendefinisikan arti istilah bisnis yang digunakan dalam proyek. AI agent membaca file ini untuk memastikan naming, logic, dan flow sesuai dengan bahasa domain proyek.

---

## How to Use

- Tambahkan setiap istilah bisnis yang **spesifik** untuk proyek ini
- Sertakan definisi yang jelas dan **tidak ambigu**
- Jika istilah memiliki status/state, jelaskan setiap state-nya
- AI akan mereferensikan file ini untuk naming variable, database column, UI label, dan logic

---

## 1. Core Entities

[TODO: Definisikan entity utama dalam proyek Anda. Format:]

- **[Nama Entity]:** [Definisi]. _Jangan pakai alias: [alias yang dilarang]_

Contoh format (hapus dan ganti dengan entity proyek Anda):

- **Booking:** Reservasi layanan oleh user pada tanggal tertentu. _Jangan pakai: "order", "reservation"_
- **Member:** User terdaftar yang memiliki membership aktif. _Jangan pakai: "customer", "client"_
- **Coach:** Tenaga profesional yang memberikan layanan. _Jangan pakai: "trainer", "instructor"_

> **Kenapa ada "Jangan pakai"?** Agar AI tidak menggunakan istilah berbeda untuk hal yang sama. Konsistensi naming = konsistensi kode.

---

## 2. Status Definitions

[TODO: Definisikan setiap status/state yang ada dalam sistem. Gunakan format di bawah untuk setiap entity yang punya status.]

### [TODO: Nama Entity] Status

[TODO: Contoh format (hapus dan ganti dengan status proyek Anda):]

- **`pending`** — Dibuat tapi belum dibayar. Bisa berubah ke: `paid`, `cancelled`
- **`paid`** — Pembayaran sudah diterima. Bisa berubah ke: `confirmed`, `refunded`
- **`confirmed`** — Admin sudah approve. Bisa berubah ke: `completed`, `cancelled`
- **`completed`** — Layanan sudah selesai. Status **final**, tidak bisa berubah.
- **`cancelled`** — Dibatalkan oleh user atau admin. Status **final**.

> **Rules:**
> - Gunakan lowercase snake_case untuk kode status (`pending`, bukan `Pending`)
> - Status **final** tidak bisa berubah lagi
> - Selalu definisikan transisi yang valid (bisa berubah ke apa saja)

---

## 3. User Roles

[TODO: Definisikan setiap role. Format:]

- **`super_admin`** — Akses penuh ke semua fitur. Bisa mengakses: semua.
- **`admin`** — Mengelola operasional harian. Bisa mengakses: Dashboard, Users, Bookings.
- **`user`** — Pengguna biasa. Bisa mengakses: Profile, Booking, Payment.

---

## 4. Business Terms

[TODO: Istilah bisnis yang sering muncul dalam proyek. Format:]

- **[Istilah]:** [Definisi] — digunakan di: [modul]

Contoh (hapus dan ganti):

- **Walk-in:** Kunjungan tanpa booking sebelumnya — digunakan di: Booking module
- **No-show:** User tidak datang pada jadwal booking — digunakan di: Booking module
- **Refund:** Pengembalian dana ke user — digunakan di: Payment module

---

## 5. Technical Terms

[TODO: Istilah teknis yang perlu dipahami sama oleh semua developer/AI.]

- **Soft Delete:** Data tidak benar-benar dihapus, hanya ditandai `deleted_at`
- **Eager Loading:** Memuat relasi database sekaligus untuk menghindari N+1 query
- **Idempotency:** Request yang sama dijalankan berkali-kali memberikan hasil yang sama

---

## 6. Abbreviations

- **RBAC:** Role-Based Access Control
- **OTP:** One-Time Password
- **CRUD:** Create, Read, Update, Delete

[TODO: Tambahkan singkatan lain yang dipakai dalam proyek.]

---

## Related Documents

- [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) — Project scope & target users
- [DATABASE.md](./DATABASE.md) — Database schema (uses these terms)
- [API_CONTRACT.md](./API_CONTRACT.md) — API endpoints (uses these terms)
