<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\Member;
use App\Http\Controllers\AdminMemberController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\OwnerController;
use App\Http\Controllers\SettingController;

// Auth Routes (Public)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});

// Manajemen member oleh petugas -- PRD-001 + keputusan P1 (owner bertingkat: boleh semua yang
// boleh admin, karena pemiliknya ikut jaga meja). Diuji: tanpa token 401, token member 403,
// token admin & owner 200.
Route::middleware(['auth:sanctum', 'role:admin,owner'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminMemberController::class, 'dashboard']);
    Route::get('/members', [AdminMemberController::class, 'index']);
    Route::post('/members', [AdminMemberController::class, 'store']);
    Route::get('/members/{member}', [AdminMemberController::class, 'show']);
    Route::patch('/members/{member}', [AdminMemberController::class, 'update']);
    Route::post('/members/{member}/renew', [AdminMemberController::class, 'renew']);
    Route::post('/members/{member}/deactivate', [AdminMemberController::class, 'deactivate']);
    Route::post('/members/{member}/reactivate', [AdminMemberController::class, 'reactivate']);

    // Absen masuk lewat kamera HP petugas (keputusan josjis 2026-10-29).
    Route::post('/attendances', [AttendanceController::class, 'store']);
    Route::get('/attendances', [AttendanceController::class, 'index']);

    // Pesan dari form kontak landing + notifikasi lonceng header.
    Route::get('/messages', [MessageController::class, 'index']);
    Route::get('/messages/unread', [MessageController::class, 'unread']);
    Route::patch('/messages/{message}', [MessageController::class, 'update']);
});

// Panel owner: angka & keputusan (rencana dashboard owner, tahap 1-2). Semuanya baca KECUALI
// pengaturan. Sengaja TANPA endpoint tulis untuk anggota -- itu pekerjaan panel petugas; ada di
// dua tempat berarti dua aplikasi untuk pekerjaan yang sama.
Route::middleware(['auth:sanctum', 'role:owner'])->prefix('owner')->group(function () {
    Route::get('/summary', [OwnerController::class, 'summary']);
    // Satu permintaan untuk seluruh layar Ringkasan: server dev melayani satu permintaan sekaligus,
    // jadi empat permintaan berarti kartu di layar menunggu antrean (lihat OwnerController::dashboard).
    Route::get('/dashboard', [OwnerController::class, 'dashboard']);
    Route::get('/revenue', [OwnerController::class, 'revenue']);
    // Rincian satu periode: dipakai saat baris tabel Uang Masuk diklik.
    Route::get('/revenue/detail', [OwnerController::class, 'revenueDetail']);
    Route::get('/growth', [OwnerController::class, 'growth']);
    Route::get('/priorities', [OwnerController::class, 'priorities']);
    Route::get('/settings', [SettingController::class, 'index']);
    Route::patch('/settings', [SettingController::class, 'update']);
});

// Pengaturan publik untuk landing -- TANPA login. Setelah ini landing berhenti memakai angka
// yang ditanam di kode.
Route::get('/settings/public', [SettingController::class, 'publicPayload']);

// Form kontak landing -- publik, tanpa login. Notifikasi header panel membaca baris yang sama.
Route::post('/messages', [MessageController::class, 'store']);

// Endpoint untuk Integration Test -- hanya di lingkungan lokal.
// Sebelumnya endpoint ini hidup juga di produksi dan membocorkan versi PHP + versi Laravel.
if (app()->environment('local')) {
    Route::get('/test-integration', function () {
    try {
        // Cek total member di database
        $count = Member::count();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Integrasi Backend Laravel 13 Berhasil!',
            'data' => [
                'members_count' => $count,
                'php_version' => PHP_VERSION,
                'laravel_version' => app()->version(),
                'server_time' => now()->toDateTimeString(),
            ]
        ], 200);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Gagal terhubung ke Database: ' . $e->getMessage()
        ], 500);
    }
});
}
