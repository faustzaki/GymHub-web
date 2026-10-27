<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\Member;

use App\Http\Controllers\AdminMemberController;
use App\Http\Controllers\AuthController;

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

// Manajemen member oleh admin -- PRD-001 (docs/prd/001-admin-manajemen-member.md).
// Butuh auth:sanctum + role:admin. Diuji: tanpa token 401, token member biasa 403.
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/members', [AdminMemberController::class, 'index']);
    Route::post('/members', [AdminMemberController::class, 'store']);
    Route::get('/members/{member}', [AdminMemberController::class, 'show']);
    Route::patch('/members/{member}', [AdminMemberController::class, 'update']);
    Route::post('/members/{member}/renew', [AdminMemberController::class, 'renew']);
    Route::post('/members/{member}/deactivate', [AdminMemberController::class, 'deactivate']);
    Route::post('/members/{member}/reactivate', [AdminMemberController::class, 'reactivate']);
});

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
