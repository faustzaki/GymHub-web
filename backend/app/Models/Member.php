<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Profil gym milik user ber-role member (PRD-001 §5 dan §7).
 *
 * Aturan penting: STATUS TIDAK DISIMPAN. Status dihitung dari `membership_expires_at` dan
 * `deleted_at` user-nya, karena kolom status yang bisa ditulis akan selalu basi — waktu terus
 * berjalan tanpa ada yang memperbarui barisnya.
 */
#[Table('members')]
#[Fillable([
    'user_id',
    'member_code',
    'height',
    'weight',
    'goal',
    'membership_started_at',
    'plan_months',
    'membership_expires_at',
])]
class Member extends Model
{
    /** Ambang "akan berakhir" dalam hari — menentukan label di UI. */
    public const SOON_DAYS = 7;

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function renewals(): HasMany
    {
        return $this->hasMany(MembershipRenewal::class)->latest('id');
    }

    /**
     * Kode rujukan admin, mis. GH-0012. Berurutan dan enak dibacakan lewat telepon.
     *
     * Dihitung dari kode tertinggi yang sudah ada, BUKAN dari id baris: kalau memakai id, satu kali
     * hapus data akan melompatkan penomoran (GH-0001 lalu GH-0022) karena id tidak pernah mundur.
     */
    public static function nextMemberCode(): string
    {
        $tertinggi = static::query()
            ->pluck('member_code')
            ->map(fn (?string $kode): int => (int) preg_replace('/\D/', '', (string) $kode))
            ->max() ?? 0;

        return 'GH-'.str_pad((string) ($tertinggi + 1), 4, '0', STR_PAD_LEFT);
    }

    /**
     * aktif / akan_berakhir / nonaktif (keputusan josjis 2026-10-28).
     *
     * "Kadaluarsa" dilebur ke "nonaktif" -- dari sisi petugas, anggota yang masa aktifnya habis
     * dan anggota yang dimatikan petugas sama-sama tidak boleh masuk. Tenggat "akan berakhir"
     * dihitung SOON_DAYS hari sebelum tanggal berakhir, dan hari berakhirnya sendiri masih
     * terhitung "akan berakhir" (anggota masih boleh masuk di hari terakhirnya).
     */
    public function status(): string
    {
        if ($this->nonaktif() || ! $this->membership_expires_at) {
            return 'nonaktif';
        }

        $sisa = $this->daysLeft();

        if ($sisa < 0) {
            return 'nonaktif';
        }

        return $sisa <= self::SOON_DAYS ? 'akan_berakhir' : 'aktif';
    }

    /**
     * Anggota nonaktif = akun user-nya dihapus (soft delete).
     *
     * Sengaja tidak hanya membaca relasi `user`: relasi itu secara bawaan MENYARING baris yang
     * dihapus, jadi kalau pemanggilnya lupa memuat `withTrashed`, status anggota nonaktif diam-diam
     * terbaca "aktif". Status yang berbohong lebih berbahaya daripada satu query tambahan.
     */
    private function nonaktif(): bool
    {
        if ($this->relationLoaded('user')) {
            return (bool) $this->user?->trashed();
        }

        return User::withTrashed()->whereKey($this->user_id)->whereNotNull('deleted_at')->exists();
    }

    /** Sisa hari; negatif berarti sudah lewat. */
    public function daysLeft(): int
    {
        if (! $this->membership_expires_at) {
            return 0;
        }

        return (int) now()->startOfDay()->diffInDays($this->membership_expires_at->startOfDay(), false);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'membership_started_at' => 'date',
            'membership_expires_at' => 'datetime',
            'height' => 'decimal:2',
            'weight' => 'decimal:2',
        ];
    }
}
