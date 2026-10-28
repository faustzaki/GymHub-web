<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * Catatan perbaikan: berkas ini sebelumnya RUSAK. Ada sisa baris (`last_login_at`, `password`, dst)
 * setelah kurung tutup kelas, sehingga `php -l` gagal dan SELURUH aplikasi Laravel tidak bisa boot —
 * setiap endpoint yang menyentuh model ini pasti error 500. Ditulis ulang bersih, sekalian dengan
 * kolom baru dari PRD-001 (role, phone, credential_issued_at, created_by_user_id, soft delete).
 *
 * `email` dan `password` nullable: member walk-in hanya didaftarkan dengan nama + nomor telepon.
 * `credential_issued_at` null berarti member belum punya akses login (bukan kekurangan, memang begitu).
 */
#[Fillable(['name', 'email', 'phone', 'password', 'role', 'credential_issued_at', 'created_by_user_id'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    public const ROLE_MEMBER = 'member';

    public const ROLE_COACH = 'coach';

    public const ROLE_ADMIN = 'admin';

    /** Pemilik gym. Bertingkat: boleh semua yang boleh admin (keputusan josjis 2026-10-28, P1). */
    public const ROLE_OWNER = 'owner';

    public function member(): HasOne
    {
        return $this->hasOne(Member::class);
    }

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function isOwner(): bool
    {
        return $this->role === self::ROLE_OWNER;
    }

    /** Petugas di meja atau pemilik -- dua-duanya boleh mengurus anggota. */
    public function isStaff(): bool
    {
        return $this->isAdmin() || $this->isOwner();
    }

    /**
     * Punya akses login atau belum. Login memakai nomor telepon, jadi nomor kosong = belum bisa login.
     */
    public function canLogin(): bool
    {
        return $this->password !== null
            && $this->credential_issued_at !== null
            && $this->phone !== null;
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'credential_issued_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
