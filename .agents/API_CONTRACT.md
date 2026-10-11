# 🔌 API_CONTRACT.md — API Specification

> **Purpose:** Dokumen ini mendefinisikan kontrak API proyek Website Gym. AI agent membaca file ini saat membuat endpoint backend atau service frontend.

---

## 1. API Configuration

- **Base URL (Dev):** `http://localhost:8000/api`
- **API Version:** `/api/v1`
- **Auth Method:** Laravel Sanctum (Stateful Cookie / Bearer Token)
- **Content-Type:** `application/json`

---

## 2. Standard Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { }
}
```

### Success with Pagination

```json
{
  "success": true,
  "message": "Data retrieved",
  "data": [ ],
  "meta": {
    "current_page": 1,
    "per_page": 10,
    "total": 50,
    "last_page": 5
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["The email field is required."]
  }
}
```

---

## 3. Authentication Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register member baru | ❌ |
| `POST` | `/api/auth/login` | Login & dapatkan token Sanctum | ❌ |
| `POST` | `/api/auth/logout` | Logout & revoke token | ✅ |
| `GET` | `/api/auth/me` | Ambil data profile user yang sedang login | ✅ |

---

## 4. Admin Management Endpoints

### 4.1 User / Member Management (`/api/admin/users`)

| Method | Endpoint | Description | Auth | Role |
|---|---|---|---|---|
| `GET` | `/api/admin/users` | List user (support search, role & status filter, pagination) | ✅ | Admin |
| `POST` | `/api/admin/users` | Buat user baru | ✅ | Admin |
| `GET` | `/api/admin/users/{id}` | Detail user berdasarkan ID | ✅ | Admin |
| `PUT` | `/api/admin/users/{id}` | Update data user | ✅ | Admin |
| `DELETE` | `/api/admin/users/{id}` | Hapus user | ✅ | Admin |
| `GET` | `/api/admin/users/export` | Download file Excel (`.xlsx`) data user | ✅ | Admin |

### 4.2 Coach Management (`/api/admin/coaches`)

| Method | Endpoint | Description | Auth | Role |
|---|---|---|---|---|
| `GET` | `/api/admin/coaches` | List coach (support search, spesialisasi, status filter) | ✅ | Admin |
| `POST` | `/api/admin/coaches` | Tambah coach baru + spesialisasi & availability | ✅ | Admin |
| `GET` | `/api/admin/coaches/{id}` | Detail profil coach | ✅ | Admin |
| `PUT` | `/api/admin/coaches/{id}` | Edit profil & tarif coach | ✅ | Admin |
| `PATCH` | `/api/admin/coaches/{id}/status` | Toggle status aktif/non-aktif coach | ✅ | Admin |
| `DELETE` | `/api/admin/coaches/{id}` | Hapus data coach | ✅ | Admin |

---

## Related Documents

- [ARCHITECTURE.md](./ARCHITECTURE.md) — System architecture
- [DATABASE.md](./DATABASE.md) — Database schema
- [CODING_RULES.md](./CODING_RULES.md) — Code standards

