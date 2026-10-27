<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Kolom yang dibutuhkan PRD-001 (manajemen member oleh admin).
 *
 * Catatan penting:
 * - `email` dan `password` dibuat NULLABLE karena member walk-in hanya didaftarkan dengan
 *   nama + nomor telepon (keputusan K2/K3 di docs/prd/001-admin-manajemen-member.md).
 *   `password` null = belum punya akses login; penanda eksplisitnya `credential_issued_at`.
 * - `phone` nullable di level DB tapi WAJIB di level validasi API. Unique nullable aman di MySQL:
 *   baris lama (tanpa nomor) boleh banyak NULL, tapi dua member tidak bisa berbagi nomor.
 * - `role` index karena dipakai middleware EnsureRole di setiap request admin.
 * - Soft delete memakai kolom `deleted_at` bawaan Laravel, bukan `is_deleted` bikinan sendiri
 *   seperti di mock lama (lihat PRD §7).
 */
return new class extends Migration
{
    public function up(): void
    {
        // Dijaga `hasColumn` karena database dev ternyata SUDAH punya kolom role/phone/deleted_at
        // yang tidak pernah ditulis di migrasi mana pun (drift -- lihat docs/decisions/001).
        // Tanpa penjaga ini, `php artisan migrate` gagal: "Duplicate column name 'role'".
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'role')) {
                $table->enum('role', ['member', 'coach', 'admin'])->default('member')->index();
            }
            if (! Schema::hasColumn('users', 'phone')) {
                $table->string('phone', 20)->nullable()->unique();
            }
            if (! Schema::hasColumn('users', 'credential_issued_at')) {
                $table->timestamp('credential_issued_at')->nullable();
            }
            if (! Schema::hasColumn('users', 'created_by_user_id')) {
                $table->foreignId('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            }
            if (! Schema::hasColumn('users', 'deleted_at')) {
                $table->softDeletes();
            }
        });

        // Diubah terpisah supaya jelas: member walk-in tidak punya email & kata sandi.
        Schema::table('users', function (Blueprint $table) {
            $table->string('email')->nullable()->change();
            $table->string('password')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['created_by_user_id']);
            $table->dropColumn([
                'role',
                'phone',
                'credential_issued_at',
                'created_by_user_id',
                'deleted_at',
            ]);
        });
    }
};
