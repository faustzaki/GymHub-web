<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Penjaga peran (rencana lama di docs/api-contract.md, baru sekarang benar-benar ada).
 *
 * Kenapa perlu: `users.role` sebelumnya tidak ada sama sekali, jadi dashboard admin mustahil
 * diamankan — dan memang `/admin` di frontend sekarang bisa dibuka tanpa login.
 *
 * Balasannya JSON, bukan redirect, karena ini API. Pesannya berbahasa manusia supaya kalau
 * muncul di UI tetap bisa dimengerti admin.
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

        if (! in_array($user->role, $roles, true)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses ditolak. Halaman ini hanya untuk '.implode(' / ', $roles).'.',
            ], 403);
        }

        return $next($request);
    }
}
