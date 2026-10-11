# 🤖 AGENTS.md — Master AI Agent Router

> **Purpose:** File ini adalah *entry point* utama bagi AI agent. Baca file ini **PERTAMA** sebelum membaca file lain. File ini menentukan konteks mana yang harus di-load berdasarkan task yang diminta.

---

## 📌 Global Constraints (WAJIB DIPATUHI)

1. **DILARANG** menghasilkan dummy data, placeholder palsu, atau mengarang informasi yang tidak ada dalam dokumentasi.
2. **WAJIB** mereferensikan file dokumentasi yang relevan sebelum menulis kode.
3. **WAJIB** mengikuti coding rules di `CODING_RULES.md` untuk semua output kode.
4. **WAJIB** mengikuti arsitektur yang didefinisikan di `ARCHITECTURE.md`.
5. **WAJIB** mengikuti design system di `UI_UX.md` untuk semua output UI.
6. **WAJIB** mengikuti implementation patterns di `PATTERNS/` saat menulis kode.
7. **WAJIB** menggunakan terminologi yang sesuai dengan `GLOSSARY.md`.
8. **DILARANG** menambahkan dependency/library baru tanpa konfirmasi user.
9. **DILARANG** mengubah schema database tanpa mereferensikan `DATABASE.md`.
10. **DILARANG** menentang keputusan arsitektur yang tercatat di `DECISIONS/` tanpa diskusi.

---

## 📂 File Index & Routing Table

Gunakan tabel di bawah untuk menentukan file mana yang harus dibaca berdasarkan jenis task.

### Tier 1: Foundation (Selalu Dibaca)

| File | Fungsi | Kapan Dibaca |
|---|---|---|
| `AGENTS.md` | Routing & global rules | **Selalu** — entry point |
| `PROJECT_CONTEXT.md` | Identitas proyek, scope, tujuan | **Selalu** — untuk memahami konteks |
| `CODING_RULES.md` | Naming convention, code style, git workflow | **Selalu** — saat menulis kode |
| `GLOSSARY.md` | Terminologi bisnis, definisi status, domain language | **Selalu** — untuk konsistensi naming |

### Tier 2: Technical Specification (Dibaca Sesuai Kebutuhan)

| File | Fungsi | Kapan Dibaca |
|---|---|---|
| `ARCHITECTURE.md` | System design, component diagram, data flow | Saat merancang fitur baru atau refactoring |
| `STACK.md` | Tech stack, dependencies, tooling | Saat setup, install, atau memilih library |
| `DATABASE.md` | ERD, schema, migration rules | Saat bekerja dengan database/model |
| `API_CONTRACT.md` | Endpoint spec, request/response format | Saat membuat/memodifikasi API |
| `UI_UX.md` | Design tokens, component library, accessibility | Saat membuat/memodifikasi UI |

### Tier 3: Operational (Dibaca untuk Task Spesifik)

| Direktori | File | Kapan Dibaca |
|---|---|---|
| `PATTERNS/` | `*_PATTERN.md` | Saat menulis kode — mengikuti blueprint implementasi |
| `DECISIONS/` | `NNN-*.md` (ADR) | Saat perlu memahami *kenapa* keputusan arsitektur dibuat |
| `FEATURES/` | `AUTH.md`, `BOOKING.md`, `PAYMENT.md`, `GALLERY.md`, `DASHBOARD.md` | Saat mengerjakan fitur spesifik |
| `FLOWS/` | `USER_FLOW.md`, `ADMIN_FLOW.md`, `BOOKING_FLOW.md` | Saat perlu memahami user journey |
| `TASKS/` | `TODO.md`, `ROADMAP.md`, `BUGS.md` | Saat perlu status progress/bug |
| `PROMPTS/` | `UI_PROMPT.md`, `BACKEND_PROMPT.md`, `REFACTOR_PROMPT.md` | Saat perlu prompt template |

---

## 🔀 Routing Logic

Gunakan decision tree berikut untuk menentukan file yang harus dibaca:

```
START (Selalu baca: AGENTS.md → PROJECT_CONTEXT.md → GLOSSARY.md)
│
├─ Task = Menulis kode frontend?
│  → Baca: CODING_RULES.md → STACK.md → UI_UX.md → PATTERNS/ → FEATURES/[relevan].md
│
├─ Task = Menulis kode backend/API?
│  → Baca: CODING_RULES.md → STACK.md → API_CONTRACT.md → DATABASE.md → PATTERNS/ → FEATURES/[relevan].md
│
├─ Task = Merancang database/model?
│  → Baca: DATABASE.md → ARCHITECTURE.md → GLOSSARY.md → FEATURES/[relevan].md
│
├─ Task = Debugging/fixing bug?
│  → Baca: TASKS/BUGS.md → CODING_RULES.md → file terkait bug
│
├─ Task = Refactoring?
│  → Baca: PROMPTS/REFACTOR_PROMPT.md → ARCHITECTURE.md → DECISIONS/ → CODING_RULES.md
│
├─ Task = Memilih teknologi/approach?
│  → Baca: DECISIONS/ → ARCHITECTURE.md → STACK.md
│
├─ Task = Planning/roadmap?
│  → Baca: TASKS/ROADMAP.md → TASKS/TODO.md → PROJECT_CONTEXT.md
│
└─ Task = Lainnya?
   → Baca: PROJECT_CONTEXT.md → tentukan file relevan dari tabel di atas
```

---

## 🔄 Update Protocol

Saat ada perubahan pada proyek:

1. **Fitur baru ditambahkan** → Update `FEATURES/` + `TASKS/TODO.md` + `TASKS/ROADMAP.md`
2. **API endpoint berubah** → Update `API_CONTRACT.md` + `FEATURES/[relevan].md`
3. **Schema database berubah** → Update `DATABASE.md` + `ARCHITECTURE.md`
4. **Tech stack berubah** → Update `STACK.md` + `ARCHITECTURE.md` + buat ADR di `DECISIONS/`
5. **Bug ditemukan** → Tambahkan ke `TASKS/BUGS.md`
6. **Design system berubah** → Update `UI_UX.md`
7. **Keputusan arsitektur dibuat** → Buat ADR baru di `DECISIONS/`
8. **Pattern baru ditetapkan** → Tambahkan ke `PATTERNS/`
9. **Istilah bisnis baru muncul** → Tambahkan ke `GLOSSARY.md`

---

## Related Documents

- Semua file dalam direktori `.AI/`
