<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Kolom masa aktif member (PRD-001 §7).
 *
 * - `member_code` dibuat otomatis oleh aplikasi (GH-0001) untuk rujukan admin, tidak ditanyakan
 *   ke member (keputusan K6). Nullable supaya baris lama tidak gagal; baris baru selalu diisi.
 * - `membership_started_at` + `plan_months` adalah dasar perhitungan. Tidak ada tabel paket dan
 *   tidak ada harga: MVP hanya member bulanan, dan status "sudah bayar" dianggap otomatis saat
 *   admin mendaftarkan (keputusan josjis 2026-10-28).
 * - `membership_expires_at` sudah ada sejak migrasi awal dan tetap jadi sumber status.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('members', function (Blueprint $table) {
            if (! Schema::hasColumn('members', 'member_code')) {
                $table->string('member_code', 12)->nullable()->unique();
            }
            if (! Schema::hasColumn('members', 'membership_started_at')) {
                $table->date('membership_started_at')->nullable();
            }
            if (! Schema::hasColumn('members', 'plan_months')) {
                $table->unsignedSmallInteger('plan_months')->nullable()->default(1);
            }
        });

        // Kolom lama `subscription_plan` dan `subscription_status` (enum trial/basic/pro/elite)
        // ada di database dev tapi TIDAK dipakai -- MVP ini hanya member bulanan, status bayar
        // otomatis saat pendaftaran (keputusan josjis 2026-10-28). Dibiarkan supaya tidak ada
        // data yang dibuang diam-diam; masuk daftar bersih-bersih.
    }

    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->dropColumn(['member_code', 'membership_started_at', 'plan_months']);
        });
    }
};
