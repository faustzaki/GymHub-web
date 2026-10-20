# Database Schema — Bifrost Gym

## Tabel yang SUDAH ADA (migrasi sudah ada)

### users
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | bigint PK | |
| name | varchar(255) | |
| email | varchar(255) UNIQUE | |
| email_verified_at | timestamp nullable | |
| password | varchar(255) hashed | |
| remember_token | varchar(100) nullable | |
| created_at / updated_at | timestamps | |

> **Gap kritis**: Kolom `role` belum ada. Harus ditambah via migration baru.

### members
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | bigint PK | |
| user_id | bigint FK → users.id CASCADE | |
| height | decimal(5,2) nullable | cm |
| weight | decimal(5,2) nullable | kg |
| goal | varchar nullable | |
| membership_expires_at | timestamp nullable | |
| created_at / updated_at | timestamps | |

---

## Tabel yang HARUS DIBUAT (belum ada migration)

Buat migration terpisah untuk setiap tabel di bawah. Urutan migration mengikuti dependensi FK.

### (1) Tambah kolom role ke users — migration terpisah
```php
// Migration: add_role_to_users_table
$table->enum('role', ['member', 'coach', 'admin'])->default('member')->after('email');
```

### (2) coaches
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | bigint PK | |
| user_id | bigint FK → users.id CASCADE | Akun login coach |
| nama | varchar(255) | Nama lengkap |
| tanggal_lahir | date nullable | |
| jenis_kelamin | enum('Laki-laki','Perempuan') nullable | |
| no_hp | varchar(20) nullable | |
| spesialisasi | json | Array string spesialisasi |
| bio | text nullable | |
| foto_url | varchar nullable | Laravel Storage path |
| status | enum('Aktif','Nonaktif') default 'Aktif' | |
| created_at / updated_at | timestamps | |

### (3) coach_certifications
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | bigint PK | |
| coach_id | bigint FK → coaches.id CASCADE | |
| name | varchar(255) | Nama sertifikasi |
| file_path | varchar | Laravel Storage path |
| created_at / updated_at | timestamps | |

### (4) coach_social_media
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | bigint PK | |
| coach_id | bigint FK → coaches.id CASCADE | |
| platform | enum('instagram','youtube','tiktok') | |
| url | varchar(500) | |
| created_at / updated_at | timestamps | |

### (5) schedules (jadwal latihan)
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | bigint PK | |
| member_id | bigint FK → members.id CASCADE | |
| coach_id | bigint FK → coaches.id nullable | null = jadwal mandiri |
| title | varchar(255) | Nama sesi/latihan |
| scheduled_at | datetime | |
| duration_minutes | integer nullable | |
| status | enum('scheduled','done','cancelled') default 'scheduled' | |
| notes | text nullable | |
| created_at / updated_at | timestamps | |

### (6) progress_logs (progres harian)
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | bigint PK | |
| member_id | bigint FK → members.id CASCADE | |
| logged_at | date | |
| weight_kg | decimal(5,2) nullable | |
| body_fat_pct | decimal(4,1) nullable | |
| notes | text nullable | |
| created_at / updated_at | timestamps | |

### (7) todos
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | bigint PK | |
| member_id | bigint FK → members.id CASCADE | |
| title | varchar(255) | |
| is_done | boolean default false | |
| due_date | date nullable | |
| created_at / updated_at | timestamps | |

### (8) materials (materi/modul)
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | bigint PK | |
| coach_id | bigint FK → coaches.id CASCADE | Upload oleh coach |
| title | varchar(255) | |
| description | text nullable | |
| file_path | varchar nullable | Laravel Storage |
| type | enum('video','pdf','article') | |
| is_published | boolean default false | |
| created_at / updated_at | timestamps | |

### (9) member_materials (akses member ke materi)
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | bigint PK | |
| member_id | bigint FK → members.id CASCADE | |
| material_id | bigint FK → materials.id CASCADE | |
| viewed_at | timestamp nullable | |
| created_at / updated_at | timestamps | |

### (10) transactions (keuangan)
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | bigint PK | |
| member_id | bigint FK → members.id nullable | |
| type | enum('membership','course','other') | |
| amount | decimal(12,2) | |
| status | enum('pending','paid','failed') default 'pending' | |
| paid_at | timestamp nullable | |
| notes | text nullable | |
| created_at / updated_at | timestamps | |

## Relasi Utama
- User hasOne Member (role=member)
- User hasOne Coach (role=coach)
- Member hasMany Schedule
- Member hasMany ProgressLog
- Member hasMany Todo
- Coach hasMany Material
- Coach hasMany Schedule
- Member belongsToMany Material via member_materials
