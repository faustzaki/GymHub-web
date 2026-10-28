<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Satu kunjungan anggota.
 *
 * Tidak ada kolom "keluar": yang dicatat hanya kedatangan, karena itu yang dipakai menjawab
 * "dia sudah masuk hari ini atau belum". Menambah jam keluar berarti meminta petugas menekan
 * tombol kedua di pintu yang ramai -- tidak akan dikerjakan, jadi datanya akan bohong.
 */
#[Table('attendances')]
#[Fillable(['member_id', 'method', 'checked_in_at', 'recorded_by_user_id'])]
class Attendance extends Model
{
    protected function casts(): array
    {
        return [
            'checked_in_at' => 'datetime',
        ];
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by_user_id');
    }
}
