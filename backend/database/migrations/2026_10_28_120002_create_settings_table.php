<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `settings` -- pengaturan web & kebijakan yang bisa diubah pemilik tanpa menyentuh kode.
 *
 * Bentuknya kunci-nilai, bukan satu baris dengan banyak kolom, karena isinya campur: harga (angka),
 * alamat (teks), jam buka (teks). Kolom per pengaturan berarti migrasi baru setiap kali ada
 * pengaturan baru -- dan itu yang paling sering terjadi setelah dipakai.
 *
 * `updated_by_user_id` disimpan karena harga itu uang: perubahan harga harus bisa ditelusuri ke
 * orangnya. Harga yang benar-benar dibayar pada tiap transaksi tetap tersimpan di `payments.amount`.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->string('key', 64)->primary();
            $table->text('value')->nullable();
            $table->foreignId('updated_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
