<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Peran `owner` ditambahkan ke `users.role`.
 *
 * Keputusan josjis 2026-10-28 (P1): pemilik gym boleh **semua** yang bisa dilakukan petugas --
 * di gym seperti ini pemiliknya ikut jaga meja. Jadi perannya bertingkat, owner > admin, bukan dua
 * kotak terpisah. Tanpa nilai ini, middleware `role:owner` tidak akan pernah cocok.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Indeks `users_role_index` sudah dibuat oleh migrasi 100001 -- mendeklarasikannya
        // lagi di sini bikin migrate gagal: "Duplicate key name 'users_role_index'".
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['member', 'coach', 'admin', 'owner'])->default('member')->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['member', 'coach', 'admin'])->default('member')->change();
        });
    }
};
