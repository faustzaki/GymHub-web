# ⚙️ BACKEND_PROMPT.md — Reusable Prompts for Backend Development

> **Purpose:** Kumpulan prompt template yang siap pakai untuk meminta AI agent membuat atau memodifikasi backend code.

---

## How to Use

1. Pilih prompt template yang sesuai
2. Ganti bagian `[PLACEHOLDER]` dengan detail spesifik
3. Copy-paste ke AI agent sebagai instruksi

---

## Prompt Templates

### 1. Create CRUD API

```
# Task
Buat CRUD API lengkap untuk resource [NAMA_RESOURCE].

# Context
- Baca file: API_CONTRACT.md, DATABASE.md, CODING_RULES.md
- Baca file fitur: FEATURES/[NAMA_FITUR].md

# Requirements
- Model: [NAMA_MODEL] dengan fields: [DAFTAR_FIELDS]
- Migration file
- Controller dengan method: index, show, store, update, destroy
- Form Request validation
- API Resource / Response transformer
- Route definition

# Constraints
- Ikuti response format di API_CONTRACT.md
- Ikuti naming convention di CODING_RULES.md
- Gunakan soft delete jika applicable
- Tambahkan authorization/policy
```

---

### 2. Create Migration & Model

```
# Task
Buat migration dan model untuk tabel [NAMA_TABEL].

# Context
- Baca: DATABASE.md untuk naming convention dan schema format
- Relasi dengan tabel: [DAFTAR_RELASI]

# Schema
| Column | Type | Constraints |
|---|---|---|
| [column_name] | [type] | [constraints] |

# Requirements
- Migration file dengan `up()` dan `down()`
- Model dengan: fillable, casts, relationships
- Factory (opsional)
- Seeder (opsional)
```

---

### 3. Add Authentication/Authorization

```
# Task
Implementasi [AUTH_TYPE] untuk [SCOPE].

# Context
- Baca: FEATURES/AUTH.md, API_CONTRACT.md
- Auth method: [JWT/Sanctum/Session]

# Requirements
- [DAFTAR_REQUIREMENT_SPESIFIK]

# Constraints
- Ikuti security best practices di ARCHITECTURE.md
- Hash semua password
- Implement rate limiting pada auth endpoints
```

---

### 4. Fix Backend Bug

```
# Task
Fix bug di [MODULE/ENDPOINT].

# Bug Description
- Expected: [APA_YANG_SEHARUSNYA]
- Actual: [APA_YANG_TERJADI]
- Error message: [ERROR_MESSAGE]

# Context
- File terkait: [PATH_FILE]
- Baca: TASKS/BUGS.md untuk konteks tambahan

# Constraints
- Fix hanya bug yang diminta
- Tambahkan test untuk memastikan bug tidak terulang
- Update TASKS/BUGS.md setelah fix
```

---

### 5. Create Service/Business Logic

```
# Task
Buat service class untuk [NAMA_BISNIS_LOGIC].

# Context
- Baca: ARCHITECTURE.md untuk pola service layer
- Baca: FEATURES/[NAMA_FITUR].md untuk business rules

# Requirements
- Service class di: app/Services/[NamaService].php
- Method: [DAFTAR_METHOD]
- Dependency injection untuk testability
- Error handling dengan custom exceptions

# Business Rules
- [RULE_1]
- [RULE_2]
```

---

## Related Documents

- [API_CONTRACT.md](../API_CONTRACT.md) — API specifications
- [DATABASE.md](../DATABASE.md) — Database schema
- [CODING_RULES.md](../CODING_RULES.md) — Code standards
- [PROMPTS/UI_PROMPT.md](./UI_PROMPT.md) — Frontend prompts
