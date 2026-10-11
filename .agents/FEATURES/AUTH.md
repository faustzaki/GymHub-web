# 🔐 AUTH.md — Authentication & Authorization Feature

> **Purpose:** Spesifikasi fitur Authentication & Authorization.

---

## 1. Overview

- **Status:** [TODO: pilih: Planned / In Progress / Done]
- **Priority:** [TODO: pilih: High / Medium / Low]
- **Auth Method:** [TODO: contoh: JWT / Laravel Sanctum / Session]
- **RBAC:** [TODO: contoh: Role-based / Permission-based]

---

## 2. User Roles

[TODO: Definisikan role yang ada. Lihat juga GLOSSARY.md.]

- **Super Admin:** [TODO: deskripsi + permission yang dimiliki]
- **Admin:** [TODO: deskripsi + permission yang dimiliki]
- **User:** [TODO: deskripsi + permission yang dimiliki]

---

## 3. User Stories

[TODO: Centang saat selesai dikerjakan.]

- [ ] Sebagai **guest**, saya dapat **register** agar mendapatkan akun
- [ ] Sebagai **guest**, saya dapat **login** menggunakan email dan password
- [ ] Sebagai **user**, saya dapat **logout** dari sistem
- [ ] Sebagai **user**, saya dapat **reset password** jika lupa
- [ ] Sebagai **admin**, saya dapat **mengelola user** (CRUD)
- [ ] Sebagai **admin**, saya dapat **assign role** kepada user

---

## 4. Acceptance Criteria

- [ ] Login berhasil mengembalikan token yang valid
- [ ] Token memiliki expiry time yang sesuai
- [ ] Route yang dilindungi menolak akses tanpa token valid
- [ ] Role-based access control berfungsi sesuai permission matrix
- [ ] Password di-hash sebelum disimpan
- [ ] Rate limiting aktif pada endpoint login

---

## 5. API Endpoints

[TODO: Lihat juga API_CONTRACT.md untuk format response.]

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| `POST` | `/auth/register` | ❌ | — |
| `POST` | `/auth/login` | ❌ | — |
| `POST` | `/auth/logout` | ✅ | All |
| `GET` | `/auth/me` | ✅ | All |
| `POST` | `/auth/forgot-password` | ❌ | — |
| `POST` | `/auth/reset-password` | ❌ | — |

---

## 6. Database Tables

[TODO: Lihat DATABASE.md untuk schema detail.]

- `users` — Data pengguna
- `password_reset_tokens` — Token reset password
- [TODO: tambahkan tabel terkait auth lainnya]

---

## 7. UI Pages

[TODO: Centang saat selesai dikerjakan.]

- [ ] Login Page
- [ ] Register Page
- [ ] Forgot Password Page
- [ ] Reset Password Page
- [ ] Profile Page
- [ ] User Management Page (Admin)

---

## Related Documents

- [API_CONTRACT.md](../API_CONTRACT.md) — Full API spec
- [DATABASE.md](../DATABASE.md) — Database schema
- [FLOWS/USER_FLOW.md](../FLOWS/USER_FLOW.md) — User journey
