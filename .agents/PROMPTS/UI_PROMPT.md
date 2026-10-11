# 🎨 UI_PROMPT.md — Reusable Prompts for UI Development

> **Purpose:** Kumpulan prompt template yang siap pakai untuk meminta AI agent membuat atau memodifikasi UI.

---

## How to Use

1. Pilih prompt template yang sesuai
2. Ganti bagian `[PLACEHOLDER]` dengan detail spesifik
3. Copy-paste ke AI agent sebagai instruksi

---

## Prompt Templates

### 1. Create New Page

```
# Task
Buat halaman [NAMA_HALAMAN] untuk [TUJUAN].

# Context
- Baca file: UI_UX.md, STACK.md, CODING_RULES.md
- Baca file fitur: FEATURES/[NAMA_FITUR].md
- Ikuti design system yang sudah didefinisikan

# Requirements
- Layout: [DESKRIPSI_LAYOUT]
- Komponen yang dibutuhkan: [DAFTAR_KOMPONEN]
- Data source: [API_ENDPOINT atau MOCK_DATA]
- Responsive: Ya, mobile-first

# Constraints
- Gunakan HANYA komponen dan token dari design system
- JANGAN tambah dependency baru tanpa konfirmasi
- Ikuti naming convention di CODING_RULES.md
```

---

### 2. Create New Component

```
# Task
Buat komponen [NAMA_KOMPONEN] yang reusable.

# Context
- Baca file: UI_UX.md, CODING_RULES.md
- Komponen ini digunakan di: [HALAMAN_YANG_MENGGUNAKAN]

# Requirements
- Props: [DAFTAR_PROPS_DENGAN_TYPE]
- Variants: [DAFTAR_VARIANT]
- States: default, hover, active, disabled, loading
- Accessible: keyboard navigable, proper ARIA labels

# Output
- File komponen di: src/components/[path]
- Ikuti component structure pattern di CODING_RULES.md
```

---

### 3. Fix UI Bug

```
# Task
Fix bug UI di halaman/komponen [NAMA].

# Bug Description
- Expected: [APA_YANG_SEHARUSNYA]
- Actual: [APA_YANG_TERJADI]
- Steps to reproduce: [LANGKAH]

# Context
- File terkait: [PATH_FILE]
- Baca: UI_UX.md untuk referensi design yang benar

# Constraints
- Fix hanya bug yang diminta, JANGAN refactor kode lain
- Test di semua breakpoint (mobile, tablet, desktop)
```

---

### 4. Redesign/Improve UI

```
# Task
Improve UI untuk [HALAMAN/KOMPONEN].

# Current Issues
- [ISSUE_1]
- [ISSUE_2]

# Desired Outcome
- [IMPROVEMENT_1]
- [IMPROVEMENT_2]

# Context
- Baca: UI_UX.md untuk design system reference
- Referensi visual: [LINK_ATAU_DESKRIPSI]

# Constraints
- Pertahankan fungsionalitas yang ada
- Ikuti design system tokens
```

---

### 5. Create Form

```
# Task
Buat form [NAMA_FORM] dengan validasi.

# Fields
| Field | Type | Required | Validation |
|---|---|---|---|
| [field_name] | [text/email/select/etc] | [Yes/No] | [rules] |

# Context
- API endpoint: [POST/PUT endpoint dari API_CONTRACT.md]
- Baca: CODING_RULES.md untuk error handling pattern

# Requirements
- Client-side validation
- Loading state saat submit
- Success/error feedback (toast/alert)
- Reset form setelah berhasil
```

---

## Related Documents

- [UI_UX.md](../UI_UX.md) — Design system reference
- [CODING_RULES.md](../CODING_RULES.md) — Code standards
- [PROMPTS/BACKEND_PROMPT.md](./BACKEND_PROMPT.md) — Backend prompts
