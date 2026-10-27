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
     * Kode rujukan admin, mis. BFG-0012. Berurutan dari id supaya tidak bentrok dan tetap
     * enak dibacakan lewat telepon.
     */
    public static function nextMemberCode(): string
    {
        $urut = (int) static::max('id') + 1;

        return 'BFG-'.str_pad((string) $urut, 4, '0', STR_PAD_LEFT);
    }

    /** aktif / akan_berakhir / kadaluarsa / nonaktif — PRD-001 §7. */
    public function status(): string
    {
        if ($this->user?->trashed()) {
            return 'nonaktif';
        }

        if (! $this->membership_expires_at) {
            return 'kadaluarsa';
        }

        return match (true) {
            $this->daysLeft() < 0 => 'kadaluarsa',
            $this->daysLeft() <= self::SOON_DAYS => 'akan_berakhir',
            default => 'aktif',
        };
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
