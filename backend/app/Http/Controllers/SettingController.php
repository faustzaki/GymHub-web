<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Pengaturan web: harga + identitas gym (rencana dashboard owner, tahap 1).
 *
 * Tiga permukaan:
 * - `GET /api/settings/public`   -- untuk landing, TANPA login, hanya kunci publik.
 * - `GET /api/owner/settings`    -- semua kunci + siapa/kapan terakhir mengubah (role:owner).
 * - `PATCH /api/owner/settings`  -- menulis (role:owner). Harga = keputusan pemilik.
 *
 * Aturan nilai (keputusan P3/P5): harga harus angka >= 0; teks maksimal 200; mengirim kosong
 * berarti "belum diisi" (disimpan NULL, BUKAN 0) -- 0 adalah harga gratis, beda artinya.
 */
class SettingController extends Controller
{
    /** @var list<string> */
    private const KUNCI_HARGA = [
        Setting::PRICE_REGISTRATION,
        Setting::PRICE_MONTHLY,
        // Literal, bukan array_values(Setting::PRICE_PER_DURATION): konstanta kelas tidak
        // boleh memanggil fungsi. Sama seperti literal di Setting::PUBLIC_KEYS.
        'price.months_3',
        'price.months_6',
        'price.months_12',
    ];

    /** @var list<string> */
    private const KUNCI_TEKS = [
        Setting::GYM_NAME,
        Setting::GYM_ADDRESS,
        Setting::GYM_HOURS,
        Setting::GYM_WHATSAPP,
    ];

    public function publicPayload(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'message' => 'Pengaturan publik.',
            'data' => Setting::publicPayload(),
        ]);
    }

    public function index(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => ['items' => $this->daftar()],
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $errors = [];
        $bersih = [];

        foreach ((array) $request->all() as $key => $value) {
            if (in_array($key, self::KUNCI_HARGA, true)) {
                // Kosong = belum diisi (NULL), bukan 0 -- 0 berarti gratis dan itu klaim lain.
                if ($value === null || $value === '') {
                    $bersih[$key] = null;
                } elseif (! is_numeric($value) || (float) $value < 0) {
                    $errors[$key] = ['Harga harus angka dan tidak boleh minus.'];
                } else {
                    $bersih[$key] = trim((string) $value);
                }
            } elseif (in_array($key, self::KUNCI_TEKS, true)) {
                if ($value === null || $value === '') {
                    $bersih[$key] = null;
                } elseif (! is_string($value) || mb_strlen($value) > 200) {
                    $errors[$key] = ['Maksimal 200 huruf.'];
                } else {
                    $bersih[$key] = $value;
                }
            } else {
                // Kunci asing ditolak, bukan diam-diam disimpan: table ini akan dibaca landing.
                $errors[$key] = ['Kunci pengaturan ini tidak dikenal.'];
            }
        }

        if ($errors !== []) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $errors,
            ], 422);
        }

        if ($bersih !== []) {
            Setting::putMany($bersih, $request->user()?->id);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Pengaturan tersimpan.',
            'data' => ['items' => $this->daftar()],
        ]);
    }

    /**
     * Semua baris pengaturan + nama pengguna yang terakhir mengubahnya. Harga itu uang:
     * perubahan harus bisa ditelusuri ke orangnya dan waktunya.
     * @return list<array<string, mixed>>
     */
    private function daftar(): array
    {
        $baris = Setting::query()->orderBy('key')->get();
        $penulis = User::withTrashed()
            ->whereIn('id', $baris->pluck('updated_by_user_id')->filter())
            ->pluck('name', 'id');

        return $baris->map(fn (Setting $s) => [
            'key' => $s->key,
            'value' => $s->value, // null = belum diisi; kosongkan lewat PATCH, bukan 0.
            'updated_by' => $penulis[$s->updated_by_user_id] ?? null,
            'updated_at' => $s->updated_at?->toDateTimeString(),
        ])->all();
    }
}
