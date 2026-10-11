# 📘 MANUAL.md — Panduan Penggunaan AI Project Documentation

> **Version:** 1.0  
> **Last Updated:** 2026-05-07  
> **Author:** AI Systems Designer

---

## Daftar Isi

1. [Apa Ini?](#1-apa-ini)
2. [Struktur Lengkap](#2-struktur-lengkap)
3. [Quick Start — Proyek Baru](#3-quick-start--proyek-baru)
4. [Penjelasan Setiap File](#4-penjelasan-setiap-file)
5. [Cara Kerja Routing AI](#5-cara-kerja-routing-ai)
6. [Workflow Harian](#6-workflow-harian)
7. [Cara Mengisi Template](#7-cara-mengisi-template)
8. [Best Practices](#8-best-practices)
9. [FAQ](#9-faq)

---

## 1. Apa Ini?

Folder `.AI/` adalah **"otak" proyek Anda** — kumpulan dokumentasi terstruktur yang membantu AI agent (seperti GitHub Copilot, Cursor, ChatGPT, dll) memahami proyek Anda secara mendalam.

### Masalah yang Diselesaikan

| Tanpa `.AI/` | Dengan `.AI/` |
|---|---|
| AI menebak-nebak tech stack | AI tahu persis stack yang dipakai |
| Output kode tidak konsisten | Kode mengikuti pattern & rules yang sama |
| AI lupa konteks di chat baru | Konteks tersimpan permanen di file |
| Harus jelaskan ulang setiap sesi | AI baca dokumentasi otomatis |
| Naming tidak konsisten | Terminologi seragam via GLOSSARY |

### Prinsip Desain

1. **Zero Hallucination** — Semua template menggunakan `<!-- TODO -->` markers, bukan dummy data
2. **Layered Reading** — AI tidak perlu baca semua file, hanya yang relevan (hemat token)
3. **Universal Template** — Bisa dipakai ulang di proyek apapun

---

## 2. Struktur Lengkap

```
.AI/
│
├── 📘 MANUAL.md              ← Anda sedang membaca ini
├── 🤖 AGENTS.md              ← Entry point AI (routing table)
│
├── ── Tier 1: Foundation (Selalu dibaca AI) ──
├── 📋 PROJECT_CONTEXT.md     ← Identitas proyek
├── 📏 CODING_RULES.md        ← Standar penulisan kode
├── 📖 GLOSSARY.md            ← Kamus istilah bisnis
│
├── ── Tier 2: Technical Spec (Dibaca sesuai kebutuhan) ──
├── 🏗️ ARCHITECTURE.md        ← Arsitektur sistem
├── 🛠️ STACK.md                ← Teknologi yang digunakan
├── 💾 DATABASE.md             ← Desain database & ERD
├── 🔌 API_CONTRACT.md        ← Spesifikasi API
├── 🎨 UI_UX.md               ← Design system
│
├── ── Tier 3: Operational (Dibaca untuk task spesifik) ──
├── PATTERNS/                  ← Blueprint implementasi kode
│   ├── README.md
│   └── _TEMPLATE.md
├── DECISIONS/                 ← Catatan keputusan arsitektur (ADR)
│   ├── README.md
│   └── _TEMPLATE.md
├── FEATURES/                  ← Spesifikasi per fitur
│   ├── AUTH.md
│   ├── BOOKING.md
│   ├── PAYMENT.md
│   ├── GALLERY.md
│   └── DASHBOARD.md
├── FLOWS/                     ← Alur interaksi user/admin
│   ├── USER_FLOW.md
│   ├── ADMIN_FLOW.md
│   └── BOOKING_FLOW.md
├── TASKS/                     ← Tracking progress & bugs
│   ├── TODO.md
│   ├── ROADMAP.md
│   └── BUGS.md
└── PROMPTS/                   ← Prompt template siap pakai
    ├── UI_PROMPT.md
    ├── BACKEND_PROMPT.md
    └── REFACTOR_PROMPT.md
```

---

## 3. Quick Start — Proyek Baru

Ikuti langkah ini saat memulai proyek baru:

### Step 1: Copy Folder

```
1. Copy seluruh folder .AI/ ke root proyek baru
2. Hapus file yang tidak relevan di FEATURES/ (sesuaikan dengan fitur proyek)
```

### Step 2: Isi Foundation Files (Wajib, Urut)

```
Urutan pengisian:

  ①  PROJECT_CONTEXT.md   ← Isi identitas proyek DULU
  ②  STACK.md             ← Tentukan tech stack
  ③  GLOSSARY.md          ← Definisikan istilah bisnis
  ④  CODING_RULES.md      ← Sesuaikan rules dengan stack yang dipilih
```

> **Kenapa urut?** Karena file selanjutnya bergantung pada file sebelumnya. Misal: `CODING_RULES.md` butuh tahu stack apa yang dipakai (dari `STACK.md`).

### Step 3: Isi Technical Files (Sesuai Kebutuhan)

```
  ⑤  ARCHITECTURE.md      ← Sesuaikan diagram dengan arsitektur proyek
  ⑥  DATABASE.md          ← Buat ERD dan table schema
  ⑦  API_CONTRACT.md      ← Definisikan endpoint API
  ⑧  UI_UX.md             ← Set color palette, typography, components
```

### Step 4: Isi Operational Files

```
  ⑨  FEATURES/*.md        ← Hapus yang tidak relevan, tambah yang baru
  ⑩  FLOWS/*.md           ← Sesuaikan flow diagram
  ⑪  TASKS/ROADMAP.md     ← Set milestones
  ⑫  DECISIONS/           ← Catat keputusan arsitektur pertama
  ⑬  PATTERNS/            ← Buat pattern pertama setelah coding dimulai
```

### Step 5: Update AGENTS.md

Pastikan routing table di `AGENTS.md` mencerminkan file yang ada. Jika Anda menghapus atau menambah file di `FEATURES/`, update tabelnya.

---

## 4. Penjelasan Setiap File

### Tier 1: Foundation

| File | Apa Isinya | Kapan Diisi | Kapan Diupdate |
|---|---|---|---|
| **AGENTS.md** | Daftar file + aturan routing untuk AI | Setup awal | Saat file ditambah/dihapus |
| **PROJECT_CONTEXT.md** | Nama, tujuan, target user, scope proyek | Setup awal | Saat scope berubah |
| **CODING_RULES.md** | Naming convention, code style, git rules | Setup awal | Saat convention berubah |
| **GLOSSARY.md** | Definisi istilah bisnis & status | Setup awal | Saat istilah baru muncul |

### Tier 2: Technical Specification

| File | Apa Isinya | Kapan Diisi | Kapan Diupdate |
|---|---|---|---|
| **ARCHITECTURE.md** | Diagram sistem, komponen, data flow | Awal development | Saat arsitektur berubah |
| **STACK.md** | Daftar framework, library, tools | Setup awal | Saat dependency berubah |
| **DATABASE.md** | ERD, table schema, migration rules | Sebelum coding model | Saat schema berubah |
| **API_CONTRACT.md** | Format response, daftar endpoint | Sebelum coding API | Saat endpoint berubah |
| **UI_UX.md** | Color, typography, components, a11y | Sebelum coding UI | Saat design berubah |

### Tier 3: Operational

| Folder | Apa Isinya | Cara Pakai |
|---|---|---|
| **PATTERNS/** | Blueprint kode (contoh implementasi) | Copy `_TEMPLATE.md`, isi dengan contoh kode nyata |
| **DECISIONS/** | Catatan keputusan arsitektur (ADR) | Copy `_TEMPLATE.md`, isi setiap kali ada keputusan penting |
| **FEATURES/** | Spesifikasi per fitur (user stories, acceptance criteria) | Satu file per fitur |
| **FLOWS/** | Diagram alur interaksi (flowchart) | Satu file per flow utama |
| **TASKS/** | Todo list, roadmap, bug tracking | Update berkala |
| **PROMPTS/** | Prompt template siap pakai | Copy-paste ke AI, ganti placeholder |

---

## 5. Cara Kerja Routing AI

`AGENTS.md` berfungsi sebagai **traffic controller**. Saat AI menerima task, ia membaca `AGENTS.md` untuk menentukan file mana yang perlu dibaca.

```
User: "Buat halaman login"

AI membaca AGENTS.md:
  → Task = Frontend? ✅
  → Route: CODING_RULES.md → STACK.md → UI_UX.md → PATTERNS/ → FEATURES/AUTH.md
  → AI membaca 5 file tersebut
  → AI menghasilkan kode yang konsisten
```

```
User: "Buat API untuk booking"

AI membaca AGENTS.md:
  → Task = Backend/API? ✅
  → Route: CODING_RULES.md → STACK.md → API_CONTRACT.md → DATABASE.md → PATTERNS/ → FEATURES/BOOKING.md
  → AI membaca 6 file tersebut
  → AI menghasilkan kode yang konsisten
```

### Tier Priority

```
Tier 1 (SELALU dibaca)     →  Foundation files
Tier 2 (SESUAI kebutuhan)  →  Technical specs
Tier 3 (TASK spesifik)     →  Operational files
```

---

## 6. Workflow Harian

### Saat Mulai Coding Fitur Baru

```
1. Buat/update file FEATURES/[NAMA_FITUR].md
2. Update TASKS/TODO.md (tambah task baru)
3. Buat ADR jika ada keputusan penting → DECISIONS/
4. Mulai coding (AI akan baca file yang relevan)
5. Buat pattern jika ada pola baru → PATTERNS/
```

### Saat Menemukan Bug

```
1. Catat di TASKS/BUGS.md (gunakan template yang ada)
2. Fix bug
3. Update status di BUGS.md menjadi "Fixed"
4. Pindahkan ke section "Fixed Bugs"
```

### Saat Menambah Dependency Baru

```
1. Update STACK.md (tambah ke tabel yang sesuai)
2. Buat ADR di DECISIONS/ (jelaskan kenapa dipilih)
3. Update AGENTS.md jika perlu
```

### Saat Refactoring

```
1. Baca PROMPTS/REFACTOR_PROMPT.md (pilih template yang sesuai)
2. Baca DECISIONS/ (pastikan tidak melanggar keputusan yang ada)
3. Baca PATTERNS/ (ikuti pattern yang sudah ditetapkan)
4. Lakukan refactoring
5. Update file yang berubah
```

---

## 7. Cara Mengisi Template

Semua file menggunakan `<!-- TODO -->` markers. Berikut cara mengisinya:

### Sebelum (template kosong)

```markdown
| **Frontend** | <!-- TODO: e.g., React / Vue.js / Next.js --> | <!-- TODO --> |
```

### Sesudah (sudah diisi)

```markdown
| **Frontend** | React 18 + Vite 5 | v18.3.1 |
```

### Rules Pengisian

1. **Hapus seluruh `<!-- TODO: ... -->`** dan ganti dengan data aktual
2. **Hapus baris contoh** yang bertanda "Instruksi: Hapus contoh di atas..."
3. **Jangan biarkan `<!-- TODO -->`** di file yang sudah final — AI bisa mengabaikan section tersebut
4. **Isi minimal Tier 1 files** sebelum mulai coding

### Cara Cepat Menemukan Semua TODO

Gunakan fitur Find in Files di editor Anda:

```
Search: <!-- TODO
Path: .AI/
```

Ini akan menunjukkan semua placeholder yang belum diisi.

---

## 8. Best Practices

### ✅ DO (Lakukan)

| # | Practice |
|---|---|
| 1 | **Isi PROJECT_CONTEXT.md pertama** — ini fondasi semua file lain |
| 2 | **Update dokumentasi bersamaan dengan kode** — jangan tunda |
| 3 | **Buat ADR untuk setiap keputusan penting** — ini investasi jangka panjang |
| 4 | **Gunakan PROMPTS/ saat meminta AI** — hasilnya lebih konsisten |
| 5 | **Review GLOSSARY.md berkala** — tambah istilah baru yang muncul |
| 6 | **Satu pattern per file** di PATTERNS/ — jangan gabung |
| 7 | **Isi section Related Documents** di setiap file — bantu navigasi AI |

### ❌ DON'T (Jangan Lakukan)

| # | Anti-Pattern | Kenapa Buruk |
|---|---|---|
| 1 | Mengisi dummy data | AI menganggapnya fakta dan menulis kode berdasarkan itu |
| 2 | Membiarkan `<!-- TODO -->` selamanya | AI skip section yang kosong |
| 3 | Duplikasi informasi di 2+ file | Saat update, salah satu pasti terlupa → inkonsistensi |
| 4 | File terlalu panjang (>300 baris) | AI kehilangan fokus, context window terbuang |
| 5 | Tidak update AGENTS.md saat file berubah | AI tidak tahu file baru ada |
| 6 | Mencampur bahasa (ID+EN) dalam satu field | Konsistensi menurun |
| 7 | Menambah file tanpa alasan jelas | Documentation sprawl = beban maintenance |

### Prinsip Golden Rule

> **Satu sumber kebenaran per topik.** Jika informasi sudah ada di file A, jangan duplikasi ke file B. Gunakan link referensi saja.

---

## 9. FAQ

### Q: Harus pakai bahasa Indonesia atau Inggris?

**Pilih satu dan konsisten.** Template ini menggunakan campuran (heading bahasa Indonesia, konten teknis bahasa Inggris) karena bersifat universal. Saat proyek nyata, pilih satu bahasa untuk:
- Komentar kode
- Commit message
- Dokumentasi

### Q: Apakah AI benar-benar membaca file ini?

**Tergantung AI tool yang digunakan:**

| Tool | Cara Kerja |
|---|---|
| **Cursor / Windsurf** | Otomatis baca file di workspace jika direferensikan |
| **GitHub Copilot** | Baca file yang terbuka di editor |
| **ChatGPT / Claude** | Copy-paste konten file ke chat, atau gunakan attachment |
| **Gemini Code Assist** | Baca rules files di workspace |

### Q: File mana yang paling penting?

**Top 5 yang harus diisi duluan:**
1. `PROJECT_CONTEXT.md` — tanpa ini, AI tidak tahu proyek apa
2. `STACK.md` — tanpa ini, AI pakai framework random
3. `CODING_RULES.md` — tanpa ini, kode tidak konsisten
4. `GLOSSARY.md` — tanpa ini, naming bisa kacau
5. `AGENTS.md` — tanpa ini, AI tidak tahu harus baca file mana

### Q: Saya punya proyek kecil, perlu semua file?

**Tidak.** Minimum viable documentation:

```
.AI/
├── AGENTS.md
├── PROJECT_CONTEXT.md
├── STACK.md
├── CODING_RULES.md
└── GLOSSARY.md
```

Tambahkan file lain seiring proyek berkembang.

### Q: Bagaimana kalau proyek saya tidak punya fitur Booking/Payment/Gallery?

**Hapus file yang tidak relevan** di `FEATURES/` dan `FLOWS/`. Ganti dengan fitur proyek Anda. Ingat update `AGENTS.md` routing table.

### Q: Kapan harus buat ADR baru di DECISIONS/?

Buat ADR saat:
- Memilih framework/library
- Mengubah arsitektur (monolith → microservice)
- Memilih pattern tertentu (service layer vs repository)
- Memilih third-party service (payment gateway, hosting)
- Mengubah database/schema secara signifikan

**Tidak perlu** ADR untuk keputusan kecil (pilih warna button, nama variable).

### Q: Bagaimana cara share `.AI/` ke tim?

```
1. Commit folder .AI/ ke Git repository
2. Tambahkan ke .gitignore hanya file yang mengandung secrets (jika ada)
3. Tim bisa clone dan langsung pakai
4. Treat .AI/ seperti kode — review perubahan via PR
```

---

## Related Documents

- [AGENTS.md](./AGENTS.md) — Master routing (entry point AI)
- Semua file dalam direktori `.AI/`
