<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `attendances` -- catatan absen masuk anggota.
 *
 * Keputusan josjis 2026-10-29: petugas memindai kartu/tiket anggota (kode `GH-0001`) langsung
 * dari kamera HP di layar Anggota Gym. Tidak ada perangkat keras khusus, tidak ada aplikasi
 * tambahan -- kamera HP + halaman web yang sudah dibuka.
 *
 * Satu baris = satu kunjungan. `checked_in_at` disimpan sebagai datetime (bukan date) karena
 * dua kunjungan di hari yang sama tetap dua baris, dan jamnya yang dipakai saat menagih
 * "sudah absen belum hari ini".
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained()->cascadeOnDelete();
            // scan = dibaca kamera, manual = kode diketik petugas. Bedanya penting saat
            // memeriksa kenapa satu kunjungan tidak tercatat padahal anggotanya ada.
            $table->enum('method', ['scan', 'manual'])->default('scan');
            $table->timestamp('checked_in_at');
            $table->foreignId('recorded_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            // "Sudah absen hari ini?" dan daftar absen terakhir selalu menyaring per tanggal.
            $table->index('checked_in_at');
            $table->index(['member_id', 'checked_in_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
