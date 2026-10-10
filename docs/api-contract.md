# API Contract — Bifrost Gym

## Konvensi Global

### Base URL
- Development: `http://localhost:8000/api`
- Frontend mengambil dari env var `VITE_API_BASE_URL` (bukan hardcode)

### Format Response Standar

**Sukses:**
```json
{
  "status": "success",
  "message": "Deskripsi singkat",
  "data": {}
}
```

**Error validasi (422):**
```json
{
  "status": "error",
  "message": "Validasi gagal",
  "errors": {
    "field": ["Pesan error"]
  }
}
```

**Error umum (401/403/404/500):**
```json
{
  "status": "error",
  "message": "Deskripsi error"
}
```

### Autentikasi
- Semua route protected: header `Authorization: Bearer {token}`
- Token dari Laravel Sanctum (`createToken('auth_token')->plainTextToken`)

### Pagination
Semua list endpoint yang bisa besar menggunakan:
```json
{
  "status": "success",
  "data": {
    "items": [],
    "meta": {
      "current_page": 1,
      "last_page": 5,
      "per_page": 15,
      "total": 73
    }
  }
}
```

---

## Endpoint Skeleton

### Auth (Public)
| Method | Path | Controller | Keterangan |
|--------|------|------------|------------|
| POST | `/api/register` | AuthController@register | Buat user + member record |
| POST | `/api/login` | AuthController@login | Kembalikan token Sanctum |

### Auth (Protected — semua role)
| Method | Path | Controller | Keterangan |
|--------|------|------------|------------|
| GET | `/api/me` | AuthController@me | Data user + relasi (member/coach) |
| POST | `/api/logout` | AuthController@logout | Hapus semua token |

### Member (role=member)
| Method | Path | Controller | Keterangan |
|--------|------|------------|------------|
| GET | `/api/member/profile` | MemberController@profile | Data profil + membership |
| PUT | `/api/member/profile` | MemberController@update | Update height/weight/goal |
| GET | `/api/member/schedules` | ScheduleController@index | Jadwal milik member |
| POST | `/api/member/schedules` | ScheduleController@store | Buat jadwal mandiri |
| PUT | `/api/member/schedules/{id}` | ScheduleController@update | Update status/jadwal |
| DELETE | `/api/member/schedules/{id}` | ScheduleController@destroy | Hapus jadwal |
| GET | `/api/member/progress` | ProgressController@index | Log progres (paginated) |
| POST | `/api/member/progress` | ProgressController@store | Catat log baru |
| GET | `/api/member/todos` | TodoController@index | Daftar to-do |
| POST | `/api/member/todos` | TodoController@store | Buat to-do |
| PUT | `/api/member/todos/{id}` | TodoController@update | Toggle done / update |
| DELETE | `/api/member/todos/{id}` | TodoController@destroy | Hapus to-do |
| GET | `/api/member/materials` | MaterialController@index | Materi yang bisa diakses |

### Coach (role=coach)
| Method | Path | Controller | Keterangan |
|--------|------|------------|------------|
| GET | `/api/coach/profile` | CoachController@profile | Profil coach |
| PUT | `/api/coach/profile` | CoachController@update | Update bio/foto/sosmed |
| GET | `/api/coach/members` | CoachController@members | Member yang ditangani |
| GET | `/api/coach/schedules` | ScheduleController@coachIndex | Jadwal semua member coach ini |
| GET | `/api/coach/materials` | MaterialController@coachIndex | Materi milik coach |
| POST | `/api/coach/materials` | MaterialController@store | Upload materi (multipart) |
| PUT | `/api/coach/materials/{id}` | MaterialController@update | Update materi |
| DELETE | `/api/coach/materials/{id}` | MaterialController@destroy | Hapus materi |

### Admin (role=admin)
| Method | Path | Controller | Keterangan |
|--------|------|------------|------------|
| GET | `/api/admin/users` | AdminUserController@index | List user (paginated, filter) |
| POST | `/api/admin/users` | AdminUserController@store | Buat user manual |
| PUT | `/api/admin/users/{id}` | AdminUserController@update | Update role/status |
| DELETE | `/api/admin/users/{id}` | AdminUserController@destroy | Soft delete (is_deleted) |
| GET | `/api/admin/coaches` | AdminCoachController@index | List coach (paginated, filter) |
| POST | `/api/admin/coaches` | AdminCoachController@store | Buat akun coach |
| PUT | `/api/admin/coaches/{id}` | AdminCoachController@update | Update data coach |
| DELETE | `/api/admin/coaches/{id}` | AdminCoachController@destroy | Nonaktifkan coach |
| GET | `/api/admin/transactions` | TransactionController@index | Laporan keuangan |
| GET | `/api/admin/stats` | AdminStatsController@index | Ringkasan dashboard admin |

### Public
| Method | Path | Controller | Keterangan |
|--------|------|------------|------------|
| GET | `/api/trainers` | TrainerController@index | Data trainer untuk landing page |
| POST | `/api/contact` | ContactController@store | Kirim pesan kontak (email) |

---

## Middleware yang Harus Ada
```php
// app/Http/Middleware/EnsureRole.php
// Dipakai di routes: ->middleware('role:admin') atau ->middleware('role:coach')
// Cek: $request->user()->role === $requiredRole, else abort(403)
```

Route grouping di `api.php`:
```php
Route::middleware(['auth:sanctum', 'role:member'])->prefix('member')->group(...);
Route::middleware(['auth:sanctum', 'role:coach'])->prefix('coach')->group(...);
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(...);
```
