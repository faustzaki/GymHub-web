<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Riwayat perpanjangan masa aktif (PRD-001 §7).
 *
 * Kenapa tabel terpisah: `members` hanya menyimpan keadaan terakhir. Kalau member memperpanjang
 * tiga kali, yang tersisa cuma tanggal akhir terakhir -- dan itu tidak cukup untuk menjawab
 * "bulan ini dapat uang dari siapa saja". Tanpa ini, pertanyaan seperti itu mustahil dijawab
 * tanpa mengubah skema di belakang.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('membership_renewals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('added_months');
            $table->date('started_from');
            $table->date('expires_at_after');
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['member_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('membership_renewals');
    }
};
