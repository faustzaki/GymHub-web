# 📏 CODING_RULES.md — Coding Standards & Conventions

> **Purpose:** Dokumen ini mendefinisikan standar penulisan kode. AI agent **WAJIB** mengikuti aturan ini saat menghasilkan kode.

---

## 1. General Principles

- **DRY** (Don't Repeat Yourself) — Hindari duplikasi kode
- **KISS** (Keep It Simple, Stupid) — Pilih solusi paling sederhana
- **SOLID** — Terapkan prinsip SOLID untuk OOP
- **Clean Code** — Kode harus self-documenting, nama variabel deskriptif
- **Single Responsibility** — Satu file/fungsi = satu tanggung jawab

---

## 2. Naming Conventions

### Files & Folders

[TODO: Sesuaikan convention dengan framework yang dipakai.]

- **Components:** [TODO: contoh: PascalCase → `UserProfile.tsx`]
- **Pages/Views:** [TODO: contoh: PascalCase → `DashboardPage.tsx`]
- **Hooks:** [TODO: contoh: camelCase + `use` prefix → `useAuth.ts`]
- **Services:** [TODO: contoh: camelCase → `authService.ts`]
- **Utils/Helpers:** [TODO: contoh: camelCase → `formatDate.ts`]
- **Types/Interfaces:** [TODO: contoh: PascalCase → `UserType.ts`]
- **Controllers:** [TODO: contoh: PascalCase + suffix → `UserController.php`]
- **Models:** [TODO: contoh: PascalCase singular → `User.php`]
- **Migrations:** [TODO: contoh: snake_case + date → `2024_01_01_create_users_table.php`]

### Variables & Functions

- **Variables:** [TODO: contoh: camelCase → `userName`]
- **Constants:** [TODO: contoh: UPPER_SNAKE_CASE → `MAX_RETRY_COUNT`]
- **Functions:** [TODO: contoh: camelCase → `getUserById()`]
- **Classes:** [TODO: contoh: PascalCase → `UserService`]
- **Boolean:** [TODO: contoh: `is`/`has`/`can` prefix → `isActive`, `hasPermission`]
- **Event handlers:** [TODO: contoh: `handle`/`on` prefix → `handleSubmit()`]

### Database

- **Tables:** snake_case, plural → `user_profiles`
- **Columns:** snake_case → `first_name`
- **Foreign Keys:** `{table}_id` → `user_id`
- **Pivot Tables:** alphabetical singular → `role_user`

---

## 3. Code Style

### Frontend

[TODO: Definisikan aturan code style untuk frontend.]

- **Indentation:** [TODO: contoh: 2 spaces]
- **Quotes:** [TODO: contoh: single quotes]
- **Semicolons:** [TODO: contoh: tidak pakai (jika Prettier)]
- **Max line length:** [TODO: contoh: 100 karakter]
- **Import order:** [TODO: contoh: external → internal → types → styles]

### Backend

[TODO: Definisikan aturan code style untuk backend.]

- **Indentation:** [TODO: contoh: 4 spaces]
- **Standard:** [TODO: contoh: PSR-12]
- **Return type:** [TODO: contoh: wajib untuk semua method]
- **Docblock:** [TODO: contoh: wajib untuk public method]

---

## 4. Component Structure Pattern

[TODO: Sesuaikan dengan framework. Contoh untuk React:]

```
// 1. Imports (external → internal → types → styles)
// 2. Type/Interface definitions
// 3. Component declaration
// 4. Hooks (state, effects, custom hooks)
// 5. Handlers / Helper functions
// 6. Render / Return JSX
// 7. Export
```

---

## 5. Error Handling

- **Frontend:** [TODO: contoh: try-catch + toast notification + error boundary]
- **Backend:** [TODO: contoh: Custom exception classes + global handler]
- **API Response:** Gunakan format standar di API_CONTRACT.md
- **Validation:** [TODO: contoh: Form-level (frontend) + Server-level (backend)]

### Standard Error Response Format

```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": {
    "field_name": ["Validation error 1"]
  },
  "code": "ERROR_CODE"
}
```

---

## 6. Git Workflow

### Branch Naming

[TODO: Definisikan branch naming convention.]

- **Feature:** [TODO: contoh: `feature/user-auth`]
- **Bugfix:** [TODO: contoh: `fix/login-redirect`]
- **Hotfix:** [TODO: contoh: `hotfix/payment-error`]

### Commit Message Convention

[TODO: Pilih convention. Rekomendasi: Conventional Commits]

```
<type>(<scope>): <description>
```

- `feat` — Fitur baru
- `fix` — Bug fix
- `docs` — Dokumentasi
- `style` — Formatting (tanpa logic change)
- `refactor` — Refactoring kode
- `test` — Menambah/memperbaiki test
- `chore` — Maintenance tasks

---

## 7. Testing Standards

[TODO: Definisikan standar testing.]

- **Unit Test Coverage:** [TODO: contoh: >= 80%]
- **Unit Test Tool:** [TODO: contoh: Vitest (FE) / PHPUnit (BE)]
- **E2E Test:** [TODO: contoh: Cypress / Playwright — happy paths saja]

---

## Related Documents

- [STACK.md](./STACK.md) — Technology stack
- [ARCHITECTURE.md](./ARCHITECTURE.md) — System architecture
- [PATTERNS/](./PATTERNS/) — Implementation blueprints
