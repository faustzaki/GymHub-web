<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Satu baris uang masuk.
 *
 * Sengaja **tanpa status**: keputusan josjis 2026-10-28 (P2) -- yang dicatat adalah cara bayarnya
 * (cash / qris), bukan Lunas/Belum. Begitu baris ini ada, uangnya sudah diterima.
 *
 * `amount` adalah nominal yang benar-benar diterima, disimpan apa adanya. Jangan pernah menghitung
 * ulang dari harga di `settings`: harga bisa berubah, riwayat tidak boleh ikut berubah.
 */
class Payment extends Model
{
    public const KINDA_PENDAFTARAN = 'pendaftaran';

    public const KINDA_PERPANJANGAN = 'perpanjangan';

    public const METODE = ['cash', 'qris'];

    protected $fillable = [
        'member_id',
        'kind',
        'method',
        'amount',
        'months',
        'paid_at',
        'recorded_by_user_id',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'paid_at' => 'date',
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
