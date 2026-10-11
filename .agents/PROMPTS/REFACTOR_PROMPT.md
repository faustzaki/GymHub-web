# 🔄 REFACTOR_PROMPT.md — Reusable Prompts for Code Refactoring

> **Purpose:** Kumpulan prompt template yang siap pakai untuk meminta AI agent melakukan refactoring kode.

---

## How to Use

1. Pilih prompt template yang sesuai
2. Ganti bagian `[PLACEHOLDER]` dengan detail spesifik
3. Copy-paste ke AI agent sebagai instruksi

---

## Prompt Templates

### 1. General Refactor

```
# Task
Refactor [FILE/MODULE/COMPONENT] untuk meningkatkan [code quality / readability / performance].

# Context
- Baca: ARCHITECTURE.md, CODING_RULES.md
- File target: [PATH_FILE]

# Goals
- [GOAL_1: e.g., Reduce duplication]
- [GOAL_2: e.g., Improve naming]
- [GOAL_3: e.g., Extract reusable logic]

# Constraints
- JANGAN mengubah behavior/fungsionalitas yang ada
- JANGAN mengubah API/interface publik tanpa konfirmasi
- Pastikan semua existing tests tetap pass
- Ikuti pattern di CODING_RULES.md
```

---

### 2. Extract Component/Service

```
# Task
Extract [LOGIC/UI] dari [FILE_ASAL] menjadi [TIPE_BARU] terpisah.

# What to Extract
- [DESKRIPSI_APA_YANG_DI-EXTRACT]
- Lokasi di file asal: [LINE_RANGE atau FUNCTION_NAME]

# Context
- Baca: ARCHITECTURE.md untuk pattern yang benar
- Baca: CODING_RULES.md untuk naming convention

# Output
- File baru: [PATH_FILE_BARU]
- Update import di file asal
- Pastikan tidak ada breaking changes
```

---

### 3. Performance Optimization

```
# Task
Optimasi performa [HALAMAN/ENDPOINT/QUERY].

# Current Issue
- [DESKRIPSI_MASALAH_PERFORMA]
- Metric saat ini: [ANGKA_JIKA_ADA]

# Context
- File terkait: [PATH_FILES]
- Baca: ARCHITECTURE.md, STACK.md

# Optimization Targets
- [TARGET_1: e.g., Reduce API calls]
- [TARGET_2: e.g., Add caching]
- [TARGET_3: e.g., Lazy loading]

# Constraints
- JANGAN break existing functionality
- Measure sebelum dan sesudah optimization
```

---

### 4. Code Cleanup

```
# Task
Cleanup codebase: hapus dead code, fix inconsistencies, improve structure.

# Scope
- Directory/files: [SCOPE_TARGET]

# Checklist
- [ ] Hapus unused imports
- [ ] Hapus commented-out code
- [ ] Hapus unused variables/functions
- [ ] Fix inconsistent naming (sesuai CODING_RULES.md)
- [ ] Tambahkan missing TypeScript types
- [ ] Fix linting errors

# Constraints
- JANGAN ubah logic/behavior
- Commit per kategori cleanup untuk easy review
```

---

### 5. Migrate/Upgrade

```
# Task
Migrate/upgrade [LIBRARY/FRAMEWORK] dari v[OLD] ke v[NEW].

# Context
- Baca: STACK.md untuk current dependencies
- Breaking changes: [LINK_CHANGELOG]

# Steps
1. Update dependency version
2. Fix breaking changes
3. Update deprecated API usage
4. Run tests
5. Update STACK.md

# Constraints
- Buat branch terpisah untuk migration
- Test thoroughly sebelum merge
```

---

## Refactoring Checklist (Pre-flight)

Sebelum memulai refactoring, pastikan:

- [ ] Ada test coverage yang cukup untuk area yang akan di-refactor
- [ ] Sudah membaca CODING_RULES.md dan ARCHITECTURE.md
- [ ] Sudah backup / commit state saat ini
- [ ] Scope refactoring sudah jelas dan terbatas
- [ ] Tidak ada deadline mendesak yang bisa terganggu

---

## Related Documents

- [ARCHITECTURE.md](../ARCHITECTURE.md) — System architecture patterns
- [CODING_RULES.md](../CODING_RULES.md) — Code standards to follow
- [PROMPTS/UI_PROMPT.md](./UI_PROMPT.md) — UI-specific prompts
- [PROMPTS/BACKEND_PROMPT.md](./BACKEND_PROMPT.md) — Backend-specific prompts
