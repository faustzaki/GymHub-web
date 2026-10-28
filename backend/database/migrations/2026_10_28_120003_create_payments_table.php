<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `payments` -- catatan uang masuk.
 *
 * Keputusan josjis 2026-10-28 (P2): uang dicatat **saat pendaftaran dan saat perpanjangan**, dan
 * yang disimpan adalah **cara bayarnya** (cash / qris) -- bukan status Lunas/Belum. Petugas tidak
 * menandai piutang; begitu dicatat, uangnya sudah diterima. Keputusan lama tetap: daftar = otomatis
 * sudah dibayar, tidak ada tabel tagihan.
 *
 * `amount` disimpan saat transaksi terjadi, bukan dihitung ulang dari harga hari ini: kalau harga
 * naik bulan depan, riwayat lama tidak boleh ikut berubah. `months` ikut disimpan supaya nominal dan
 * lama perpanjangan bisa dicocokkan saat ada selisih (diskon, bayar sebagian).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained()->cascadeOnDelete();
            $table->enum('kind', ['pendaftaran', 'perpanjangan']);
            $table->enum('method', ['cash', 'qris'])->default('cash');
            $table->decimal('amount', 12, 2);
            $table->unsignedSmallInteger('months')->nullable();
            $table->date('paid_at');
            $table->foreignId('recorded_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('notes', 200)->nullable();
            $table->timestamps();

            // Laporan bulanan selalu menyaring per tanggal; ini yang menjaga halaman owner tetap
            // ringan saat pembayarannya sudah ribuan baris.
            $table->index('paid_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
