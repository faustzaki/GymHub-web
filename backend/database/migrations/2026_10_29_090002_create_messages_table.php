<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `messages` -- pesan dari form kontak di landing.
 *
 * Keputusan josjis 2026-10-29: notifikasi di header panel (petugas & owner) mengambil pesan dari
 * form kontak landing. Sebelum ini formnya `// dummy` -- pesan menguap setelah "terkirim", jadi
 * pengunjung mengira sudah menghubungi gym padahal tidak ada yang menerima apa pun.
 *
 * `status` disimpan (beda dengan status anggota yang dihitung): pesan tidak punya tanggal yang
 * membuat keadaannya berubah sendiri. Hanya petugas yang menandai sudah dibalas.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->string('name', 80);
            $table->string('email', 120);
            $table->string('message', 2000);
            $table->enum('status', ['baru', 'dibaca', 'dibalas'])->default('baru');
            $table->timestamp('read_at')->nullable();
            $table->foreignId('handled_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
