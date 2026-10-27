<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Satu baris = satu kali perpanjangan (PRD-001 §7).
 *
 * `members` hanya menyimpan keadaan terakhir. Tanpa tabel ini, pertanyaan "bulan ini dapat uang
 * dari siapa saja" mustahil dijawab dan tidak bisa dipulihkan tanpa mengubah skema di belakang.
 */
#[Table('membership_renewals')]
#[Fillable(['member_id', 'added_months', 'started_from', 'expires_at_after', 'created_by_user_id'])]
class MembershipRenewal extends Model
{
    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'started_from' => 'date',
            'expires_at_after' => 'date',
        ];
    }
}
