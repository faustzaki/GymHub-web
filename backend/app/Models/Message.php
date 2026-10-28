<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Pesan dari form kontak landing.
 *
 * `status` di sini DISIMPAN (beda dengan status anggota yang dihitung): pesan tidak punya
 * tanggal yang membuat keadaannya berubah sendiri -- "sudah dibalas" adalah tindakan orang,
 * bukan hasil waktu.
 */
#[Table('messages')]
#[Fillable(['name', 'email', 'message', 'status', 'read_at', 'handled_by_user_id'])]
class Message extends Model
{
    public const BARU = 'baru';

    public const DIBACA = 'dibaca';

    public const DIBALAS = 'dibalas';

    protected function casts(): array
    {
        return [
            'read_at' => 'datetime',
        ];
    }

    public function handledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'handled_by_user_id');
    }
}
