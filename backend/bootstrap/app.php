<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Penjaga peran untuk endpoint admin/coach (PRD-001 §10). Dipakai di routes/api.php
        // sebagai ->middleware('role:admin').
        $middleware->alias([
            'role' => \App\Http\Middleware\EnsureRole::class,
        ]);

        // Aplikasi ini API-only: TIDAK ada route bernama 'login'. Tanpa baris ini, permintaan
        // tanpa header `Accept: application/json` dilempar ke route('login') yang tidak ada ->
        // 500 "Route [login] not defined", padahal seharusnya 401. null = jangan redirect,
        // serahkan ke handler exceptions yang sudah dibikin selalu JSON untuk api/*.
        $middleware->redirectGuestsTo(fn () => null);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Balasan API selalu JSON, termasuk 401 dari auth:sanctum. Tanpa ini, permintaan tanpa
        // header `Accept: application/json` dilempar ke route bernama 'login' yang tidak ada di
        // aplikasi API-only ini -> 500 "Route [login] not defined" (ketemu di storage/logs).
        $exceptions->shouldRenderJsonWhen(
            fn ($request) => $request->is('api/*') || $request->expectsJson()
        );
    })->create();
