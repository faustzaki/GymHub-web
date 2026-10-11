# 📋 PROJECT_CONTEXT.md — Project Identity & Scope

> **Purpose:** Dokumen ini mendefinisikan identitas proyek secara menyeluruh. AI agent membaca file ini untuk memahami *apa* yang sedang dibangun, *untuk siapa*, dan *batasan* scope-nya.

---

## 1. Project Identity

- **Project Name:** Website Gym Integrated Platform
- **Project Code:** `website-gym`
- **Version:** v1.0.0-dev
- **Status:** In Development
- **Repository URL:** `https://github.com/faustzaki/website-gym`
- **Last Updated:** 2026-07-22

---

## 2. Project Description

Website Gym adalah platform manajemen gym & fitness center terintegrasi berbasis web modern. Platform ini menghubungkan Pengelola Gym (Admin), Pelatih (Coach), dan Peserta/Member dalam satu ekosistem terpadu.

Solusi ini memfasilitasi administrasi keanggotaan (Member Management), pengelolaan instruktur/pelatih (Coach Management & Multi-Spesialisasi), penjadwalan latihan interaktif, pelacakan progres fisik/latihan harian, booking kelas/paket, serta pelaporan keuangan & operasional gym.

---

## 3. Target Users (3-Tier Roles)

| Role | Deskripsi | Kebutuhan Utama |
|---|---|---|
| **User (Peserta / Member)** | Member gym yang mengikuti program latihan/kursus | Akses materi & modul latihan, kalender kegiatan, progress tracking harian, booking kelas/coach |
| **Coach (Pelatih)** | Instruktur & pelatih fitness gym | Upload/update modul latihan, atur jadwal member (kalender), monitor progres harian anak bimbingan |
| **Admin (Pengelola / Owner)** | Pengelola operasional & keuangan gym | Kelola akses Member & Coach, penetapan Coach untuk paket/member, dashboard finansial & laporan transaksi |

---

## 4. Business Requirements

### Functional Requirements

- **FR-001 (Auth & Access Control):** Authentikasi multi-role (Admin, Coach, Member) menggunakan Laravel Sanctum + React Protected Routes.
- **FR-002 (Member Management):** Admin dapat melihat, membuat, mengedit, mengaktifkan/menonaktifkan member, serta meng-export data member ke Excel (`.xlsx`).
- **FR-003 (Coach Management):** Admin dapat mengelola profil coach, penetapan multi-spesialisasi, pengatur tarif per jam/sesi, jam ketersediaan (availability), dan status aktif/non-aktif.
- **FR-004 (Class & Package Booking):** Member dapat memesan kelas fitness atau sesi privat coach.
- **FR-005 (Workout Schedule & To-Do List):** Kalender interaktif latihan dan to-do list harian untuk member.
- **FR-006 (Progress Tracking):** Pelacakan pencapaian fisik dan progres latihan harian member yang dipantau coach.
- **FR-007 (Financial Dashboard):** Admin dapat memantau pendapatan, transaksi booking, dan laporan finansial gym.

### Non-Functional Requirements

- **NFR-001 (Performance):** Page load < 2 detik, kompresi assets Vite, performa query terindeks.
- **NFR-002 (Security):** Password hashing bcrypt, CSRF & Token-based API protection via Sanctum, Role-based Middleware/Guards.
- **NFR-003 (UI/UX Excellence):** Desain premium modern (Dark/Light Mode), menggunakan Tailwind CSS v4 + shadcn/ui components.

---

## 5. Project Scope

### In Scope ✅

- Auth System & Role-Based Access Control (Sanctum + Zustand)
- Admin Management: Users/Members, Coaches (dengan multi-spesialisasi & tarif)
- Class & Package Booking System
- Interactive Workout Calendar & Daily Gym To-Do List
- Daily Progress Tracker untuk Member & Coach
- Export Data ke Excel (`xlsx`) untuk laporan Admin

### Out of Scope ❌

- Application Mobile Native (iOS/Android — saat ini fokus Web App Responsive)
- Payment Gateway otomatis skala internasional (tahap awal menggunakan manual/lokal gateway)

---

## 6. Key Stakeholders

- **Project Owner:** Management Gym / Owner
- **Developer:** Senior Full-Stack Developer (`faustzaki`)
- **Designer:** UI/UX Design Lead (shadcn/ui + Tailwind CSS System)

---

## 7. Success Metrics

- **Metric 1:** 100% fungsionalitas CRUD Admin (Member & Coach) berjalan tanpa error.
- **Metric 2:** Waktu respons API < 300ms untuk semua query standar.
- **Metric 3:** UI/UX responsive dan mendukung tema Gelap & Terang secara konsisten.

---

## Related Documents

- [ARCHITECTURE.md](./ARCHITECTURE.md) — System architecture
- [STACK.md](./STACK.md) — Technology stack
- [TASKS/ROADMAP.md](./TASKS/ROADMAP.md) — Detailed roadmap
- [TASKS/TODO.md](./TASKS/TODO.md) — Current tasks

