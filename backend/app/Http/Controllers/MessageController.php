<?php

namespace App\Http\Controllers;

use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * Pesan dari form kontak landing, dan notifikasi header panel.
 *
 * Keputusan josjis 2026-10-29: lonceng di header petugas & owner mengambil pesan dari form kontak
 * di landing, dan kliknya membuka halaman daftar pesan berisi detail.
 *
 * Tiga permukaan:
 * - `POST /api/messages`            -- publik. Pengunjung landing mengirim pesan. Tanpa login.
 * - `GET  /api/admin/messages`      -- petugas & owner. Daftar + hitungan belum dibaca.
 * - `PATCH /api/admin/messages/{id}`-- petugas & owner. Tandai dibaca/dibalas.
 *
 * Kunci anti-spam tanpa captcha: satu email + satu isi yang sama tidak bisa dikirim dua kali
 * dalam 10 menit. Captcha di form kontak gym kecil lebih banyak menolak orang sungguhan
 * daripada bot, dan pesan ganda paling sering memang tombol yang ditekan dua kali.
 */
class MessageController extends Controller
{
    private const JEDA_MENIT = 10;

    /** Publik: kirim pesan dari landing. */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'min:2', 'max:80'],
            'email' => ['required', 'email', 'max:120'],
            'message' => ['required', 'string', 'min:5', 'max:2000'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Periksa kembali nama, email, dan pesanmu.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $email = strtolower(trim($request->string('email')->toString()));
        $isi = trim($request->string('message')->toString());

        $kembar = Message::query()
            ->where('email', $email)
            ->where('message', $isi)
            ->where('created_at', '>=', now()->subMinutes(self::JEDA_MENIT))
            ->exists();

        if ($kembar) {
            return response()->json([
                'status' => 'success',
                'message' => 'Pesanmu sudah masuk. Kami membalas ke email yang kamu tulis.',
            ], 200);
        }

        $pesan = Message::create([
            'name' => trim($request->string('name')->toString()),
            'email' => $email,
            'message' => $isi,
            'status' => Message::BARU,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Pesanmu terkirim. Kami akan membalas ke email yang kamu tulis.',
            'data' => ['id' => $pesan->id],
        ], 201);
    }

    /** Panel: daftar pesan, terbaru dulu. `?status=baru` untuk yang belum dibaca saja. */
    public function index(Request $request): JsonResponse
    {
        $status = (string) $request->query('status', '');
        if ($status !== '' && ! in_array($status, [Message::BARU, Message::DIBACA, Message::DIBALAS], true)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Status tidak dikenal. Pilih: baru, dibaca, atau dibalas.',
            ], 422);
        }

        $query = Message::query()->with('handledBy');
        if ($status !== '') {
            $query->where('status', $status);
        }

        $perPage = min(max((int) $request->query('per_page', 20), 1), 100);
        $halaman = $query->orderByDesc('created_at')->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => [
                'items' => collect($halaman->items())->map(fn (Message $m) => $this->present($m))->all(),
                'meta' => [
                    'current_page' => $halaman->currentPage(),
                    'last_page' => $halaman->lastPage(),
                    'per_page' => $halaman->perPage(),
                    'total' => $halaman->total(),
                ],
                // Angka lonceng: selalu jumlah yang belum dibuka, tidak terpengaruh filter.
                'belum_dibaca' => Message::query()->where('status', Message::BARU)->count(),
            ],
        ]);
    }

    /** Tandai dibaca / dibalas. `dibalas` tidak bisa dibalik jadi `baru`. */
    public function update(Request $request, Message $message): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'status' => ['required', 'in:baru,dibaca,dibalas'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Status tidak dikenal.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $baru = $request->string('status')->toString();

        $message->status = $baru;
        if ($baru === Message::BARU) {
            $message->read_at = null;
        } elseif (! $message->read_at) {
            $message->read_at = now();
        }
        if ($baru === Message::DIBALAS) {
            $message->handled_by_user_id = $request->user()?->id;
        }
        $message->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Status pesan diperbarui.',
            'data' => $this->present($message->fresh('handledBy')),
        ]);
    }

    /**
     * Lonceng header: cukup angka + tiga pesan terbaru. Endpoint terpisah supaya header tidak
     * ikut menarik seluruh daftar pesan setiap kali halaman berpindah.
     */
    public function unread(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => [
                'belum_dibaca' => Message::query()->where('status', Message::BARU)->count(),
                'terbaru' => Message::query()
                    ->where('status', Message::BARU)
                    ->orderByDesc('created_at')
                    ->limit(3)
                    ->get()
                    ->map(fn (Message $m) => [
                        'id' => $m->id,
                        'nama' => $m->name,
                        'ringkas' => mb_strimwidth($m->message, 0, 80, '…'),
                        'kapan' => $m->created_at?->locale('id')->diffForHumans(),
                    ]),
            ],
        ]);
    }

    private function present(Message $message): array
    {
        return [
            'id' => $message->id,
            'name' => $message->name,
            'email' => $message->email,
            'message' => $message->message,
            'status' => $message->status,
            'read_at' => $message->read_at?->toIso8601String(),
            'handled_by' => $message->handledBy?->name,
            'created_at' => $message->created_at?->toIso8601String(),
            'kapan' => $message->created_at?->locale('id')->diffForHumans(),
        ];
    }
}
