# 🛠️ STACK.md — Technology Stack

> **Purpose:** Dokumen ini mendefinisikan seluruh teknologi yang digunakan dalam proyek Website Gym. AI agent membaca file ini untuk mengetahui framework, library, dan tools yang boleh digunakan.

---

## 1. Stack Overview

- **Frontend:** React 19 + Vite 8 + TypeScript 6.0
- **Backend:** Laravel 13 REST API + PHP 8.3
- **Database:** MySQL 8.0 (Laragon Local Server Environment)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`) + shadcn/ui
- **State Management:** Zustand 5
- **Auth:** Laravel Sanctum 4.3 + Axios Interceptors

---

## 2. Frontend Stack

| Package | Version | Fungsi |
|---|---|---|
| `react` / `react-dom` | `^19.2.4` | Core UI Library |
| `vite` | `^8.0.4` | Frontend Build Tool & Dev Server |
| `typescript` | `~6.0.2` | Type Safety |
| `tailwindcss` | `^4.2.2` | CSS Framework (v4) |
| `@tailwindcss/vite` | `^4.2.2` | Vite plugin untuk Tailwind v4 |
| `zustand` | `^5.0.12` | Lightweight State Management |
| `axios` | `^1.15.1` | HTTP Client for REST API |
| `react-router-dom` | `^7.14.1` | Client-side Routing |
| `lucide-react` | `^1.8.0` | Icon Library (tanpa brand icons) |
| `sonner` | `^2.0.7` | Toast Notification Library |
| `xlsx` | `^0.18.5` | Export Data Excel |
| `@radix-ui/react-*` | `latest` | Primitives untuk shadcn/ui components |

---

## 3. Backend Stack

| Package | Version | Fungsi |
|---|---|---|
| `laravel/framework` | `^13.0` | Web Application Framework |
| `laravel/sanctum` | `^4.3` | SPA & Token API Authentication |
| `maatwebsite/excel` | `^3.1` | Excel Export/Import Engine |
| `phpunit/phpunit` | `^12.5` | Testing Framework |

---

## 4. Database & Storage

- **Primary DB:** MySQL 8.0 (utf8mb4)
- **Cache & Session:** Laravel Cache (Database/Array)
- **File Storage:** Local Disk via Laravel Storage (`storage/app/public`)

---

## 5. Environment & Tooling

- **Local Server Environment:** Laragon (Windows)
- **Package Manager:** npm (Frontend), Composer (Backend)
- **Linting & Code Quality:** ESLint 9 + TypeScript-ESLint + Laravel Pint

---

## 6. Environment Variables

```env
# Backend (.env)
APP_NAME="Website Gym"
APP_ENV=local
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=website_gym
DB_USERNAME=root
DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost:5173
```

---

## Related Documents

- [ARCHITECTURE.md](./ARCHITECTURE.md) — System architecture
- [CODING_RULES.md](./CODING_RULES.md) — Code standards
- [DATABASE.md](./DATABASE.md) — Database schema

