# landing-notes.md — catatan verifikasi landing GymHub

Semua angka di bawah berasal dari render nyata (`vite dev` di :5178 + Chromium headless),
bukan dari membaca kode. Skrip: `cache/scratch/gym_verify.py` (kontras, a11y, layout, gerak),
detector `impeccable detect --json <url>`.

## Hasil akhir yang diukur

| Ukuran | Sebelum | Sesudah |
|---|---|---|
| Kontras gagal (300+ elemen, 3 viewport) | 12 elemen @12px, min 3,45:1 | **0 gagal**, min 3,88:1 (teks besar, ambang 3:1) |
| `impeccable detect` | 51 temuan | **1 temuan** (lihat "Diterima") |
| Teks fungsional <11px | 18 | 0 |
| Kicker/eyebrow di atas heading | 9 | 0 |
| `npm run build` (tsc + vite) | gagal (TS5101 + 12 error) | hijau, ~1–16 s |
| `npm run lint` | 26 | 14 (bawaan dashboard, tidak ditambah) |
| `lang` halaman | `en` | `id` |
| Scroll horizontal 390/768/1440 | — | tidak ada |
| Error konsol | — | 0 |
| Heading: h1 tunggal, tanpa lompat level | — | ya (11 seksi, 48–50 elemen fokusable) |
| `prefers-reduced-motion` | — | 0 elemen `<video>`, poster statis, 0 animasi infinite |
| Video hero | — | 3 sumber, `poster` terpasang, autoplay + muted + loop + playsinline, crossfade `opacity` (tanpa remount) |
| Skip link | — | 1×1 px saat diam, **200×44 px saat fokus** (perilaku benar) |

## Yang diperbaiki, beserta sebabnya

1. **Aksen merah tidak lagi dipakai sebagai warna teks kecil.** `#DC2626` di `#1E1E1E` = 3,45:1
   (gagal AA). Ditambah token `--primary-text: #F05252` (5,38:1 di `#121212`, 4,79:1 di `#1E1E1E`)
   untuk label 10–12px. `#DC2626` tetap untuk bidang, garis, ikon, dan teks besar.
2. **Teks fungsional minimum 11px** (`text-[10px]` → `text-[11px]`) di 3 tempat.
3. **Kicker di atas heading dihapus** (detector: dilarang mutlak). Kata-katanya yang penting sudah
   ada di heading masing-masing; hero juga kehilangan chip "GymHub · Jakarta Selatan" karena
   informasinya sudah ada di navbar dan baris fakta.
4. **`text-wrap: pretty` pada body dan `balance` pada h1–h4** — menghapus baris terakhir yang
   menyisakan satu kata dan heading yang pecah tidak rata.
5. **Potret coach tidak muncul dua kali.** Tiga potret `pt-1..3` tampil penuh di blok PT; di blok
   jadwal coach kini tampil sebagai monogram dua huruf.
6. **`lang="id"`** pada `index.html` (sebelumnya `en` padahal seluruh isi berbahasa Indonesia).
7. **Form login & register benar-benar menampilkan pesan galat** — state `error` sudah ada sejak
   awal tapi tidak pernah dirender.

## Ditajamkan setelah pemeriksaan mata atas screenshot

1. **Hero dilegakan** — baris statistik di bawah hero dibuang; tinggal judul, pemilih disiplin,
   dua CTA, dan baris fakta (jam, lokasi, tiga ruang). Satu titik fokus.
2. **Baris italic pada heading dipakai di 3 seksi saja** (Alat, Ruang, hero), tidak lagi di 7.
   Motifnya tetap sesuai `DESIGN.md`, tapi tidak lagi terasa seperti formula. Karena baris italic
   dihapus di 5 seksi, judulnya ditulis utuh (`"Tiga cara untuk masuk"`, bukan lagi `"Tiga cara"`).
3. **Baris angka tanpa isi dibuang** ("3 / 7 hari / 1 kartu" di blok Ruang) — pengisi ruang.
4. **Saringan ruang dipendekkan** (Semua/Iron/Yoga/Muay) supaya baris hari + ruang tidak pecah dua.
5. **Simulasi beban diberi alasan**, bukan cuma cara: "…Beban ini yang tercatat di akunmu setiap sesi."
6. **Dua lapis scrim di hero** (vertikal + horizontal). Teks hero diukur dari **piksel** hasil render,
   bukan dari DOM: sebelum perbaikan latar terang di pita teks hanya menyisakan 2,65:1 untuk putih;
   sesudah, latar baris terburuk `#303030` → putih 13,21:1 · abu 5,24:1 · abu-terang 8,48:1.
   Teks abu di hero dinaikkan ke `text-foreground/80` (dan `/85` untuk baris info) supaya tidak
   abu-di-atas-abu. Fotonya tidak digelapkan lagi — pemeriksaan mata bilang gradasinya justru pas.
7. **Kartu disiplin tidak lagi diredupkan dengan `opacity-70`** — itu menurunkan kontras seluruh
   teks di dalamnya (terukur 3,8:1). Kini yang diredupkan hanya fotonya (`bg-background/45`),
   sedangkan teks tetap penuh. Panel pemilih disiplin juga dinaikkan `bg-card/60` → `bg-card/95`
   supaya label abu tidak "berenang" di atas video.

## Diterima apa adanya (dengan alasan)

- **`overused-font`** — Plus Jakarta Sans ditetapkan `DESIGN.md` sebagai font brand. Menggantinya
  keputusan pemilik, bukan keputusan agent.
- **Skip link 1×1 px** saat tidak fokus: sengaja (pola `sr-only`), terukur 200×44 px saat fokus.
- **Rasio terendah 3,88:1** hanya pada teks besar/aksen (ambang AA teks besar 3:1) — lulus.

## Belum beres / diketahui

- Dua sistem permukaan bercampur: kartu ber-border di beberapa blok vs panel datar di blok lain.
  Belum diseragamkan (perubahan lebar, perlu keputusan pemilik).
- `discipline-yoga.jpg` paling lemah dari 3 foto disiplin (peti plyo + matras, bukan studio).
- Video hero 1280×720 (bukan 1920×1080), 10 detik.
- `antislop.md` + `skills/antislop-*` yang dirujuk `AGENTS.md` tidak ada di repo (belum dibuat).
- **Sudah di-commit** (2 commit: `fix(build)` + `feat(landing)`), **belum di-push** — atas permintaan pemilik.

## Berkas yang tidak di-commit

`docs/shots/` (9 PNG, 24 MB) masuk `.gitignore` — artefak verifikasi, bisa dibuat ulang
kapan saja lewat skrip yang sama. Kalau pemilik mau gambar-gambarnya ada di repo, tinggal
hapus baris `/docs/shots/` dari `.gitignore`.
