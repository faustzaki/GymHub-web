# Sumber aset hero (klip gerak)

Tiga klip hero di `frontend/public/assets/hero-*.mp4` berasal dari **Mixkit** — stok video gratis
dengan **lisensi Mixkit Free**: boleh dipakai untuk komersial, **tanpa wajib atribusi**, tapi
dilarang **dijual ulang sebagai stok** (tidak boleh diunggah ke layanan stok lain).

Atribusi tetap dicatat di sini supaya jejak aset jelas kalau nanti ada yang menanyakan izinnya.

| Berkas | Klip sumber | Isi | Durasi potongan |
|---|---|---|---|
| `hero-iron.mp4` | Mixkit #752 — `https://mixkit.co/free-stock-video/wall-ball-with-red-medicine-ball-752/` | wall ball dengan bola merah, gudang gelap | 8,0 s (mulai 1,0 s) |
| `hero-yoga.mp4` | Mixkit #43724 — `https://mixkit.co/free-stock-video/small-group-of-people-doing-yoga-43724/` | studio terang, gerakan downward dog | 8,0 s (mulai 0,5 s) |
| `hero-muaythai.mp4` | Mixkit #40265 — `https://mixkit.co/free-stock-video/boxer-training-with-a-punching-bag-at-the-gym-40265/` | pukul heavy bag di gym | 6,8 s (mulai 0,2 s) |

## Cara berkas dibuat

Tiap klip diunduh dalam versi **1080p** asli, lalu diproses `ffmpeg`:

- potong bagian dengan gerakan paling jelas (angka di tabel)
- **buang audio** (hero selalu `muted`)
- crop ke **16:9 1920×1080** (`force_original_aspect_ratio=increase` lalu `crop`)
- `libx264 -preset slow -crf 23`, `yuv420p`
- `-movflags +faststart` supaya video mulai diputar sebelum berkas selesai diunduh
- poster (`.jpg`) diambil dari bingkai ~45% durasi klip

Ukuran akhir: **iron 1,5 MB · yoga 2,6 MB · muaythai 3,8 MB**, poster 85–138 KB.

Grade warna **tidak** dipanggang ke berkas — masih diterapkan lewat CSS per disiplin
(`DISCIPLINES[id].grade`), supaya bisa diubah tanpa encode ulang.

## Kandidat yang ditolak

Pemilihan berdasarkan lembar kontak bernomor (isi diperiksa mata, bukan dari nama berkas). Ditolak:
beberapa klip angkat beban bernuansa biru neon (melanggar palet: hanya netral + satu aksen merah),
klip yoga potret 1080×1920 (tidak bisa jadi latar melebar), dan klip dengan teks/watermark.
