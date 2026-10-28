<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * Penjaga peran (rencana lama di docs/api-contract.md, baru sekarang benar-benar ada).
 *
 * Kenapa perlu: `users.role` sebelumnya tidak ada sama sekali, jadi dashboard admin mustahil
 * diamankan — dan memang `/admin` di frontend sekarang bisa dibuka tanpa login.
 *
 * Balasannya JSON, bukan redirect, karena ini API. Pesannya berbahasa manusia supaya kalau
 * muncul di UI tetap bisa dimengerti admin.
 *
 * [DEV-SAJA] Selama pengembangan penjagaan peran dimatikan (keputusan josjis 2026-10-28: "jangan
 * ada keamanan dulu ya ini"). Dua pengaman: syaratnya `APP_ENV=local` DAN saklar `DEV_BYPASS_AUTH`
 * hidup -- di server keduanya tidak pernah ada, jadi penjagaan aslinya tetap penuh di produksi.
 */
class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Belum masuk. Silakan login dulu.',
            ], 401);
        }

        if (app()->environment('local') && config('app.dev_bypass_auth')) {
            Log::warning('Penjagaan peran dilewati (DEV_BYPASS_AUTH hidup). Jangan dipakai di server.', [
                'rute' => $request->path(),
                'peran_diminta' => $roles,
                'peran_akun' => $user->role,
            ]);

            return $next($request);
        }

        if (! in_array($user->role, $roles, true)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses ditolak. Halaman ini hanya untuk '.implode(' / ', $roles).'.',
            ], 403);
        }

        return $next($request);
    }
}
