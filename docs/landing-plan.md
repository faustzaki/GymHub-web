# Rencana Landing Page — GymHub

Status: **rencana (sesi diskusi)**. Belum ada kode yang diubah. Dokumen ini yang jadi acuan
saat eksekusi dibuka.

Ruangan kerja: `frontend/src/pages/public/home/`. Backend tidak disentuh.
Brand & warna mengikuti `DESIGN.md` (revisi terbaru: aturan warna terukur, motif
" Satu Jembatan, Tiga Ruang", kebijakan konten dummy, pipeline aset).

---

## 1. Masalah yang sedang diperbaiki

Landing yang ada sekarang: 5 seksi, ~1.320 baris (`Hero` 116, `FeaturesSection` 99,
`ClassesTrainersSection` 279, `PricingBMISection` 491, `ContactSection` 302).

- `FeaturesSection` terlalu tipis untuk jadi "keunggulan".
- `PricingBMISection` 491 baris mencampur kalkulator BMI dengan harga → fokus pecah.
- Tidak ada: alat gym, komunitas, testimoni.
- Yoga + Muaythai hanya muncul sebagai baris di daftar kelas, tanpa identitas.
- `.agents/rules/*` yang dijanjikan `AGENTS.md` **foldernya kosong**, jadi aturan visual
  tidak pernah kebaca agent → hasilnya lembek.

## 2. Struktur halaman (10 blok)

| # | Seksi | Isi | Menjawab brief |
|---|---|---|---|
| 01 | Hero | **video latar** (satu klip per disiplin, poster sebagai fallback) + H1 motif (uppercase extrabold + baris italic light), jam buka hari ini, CTA "Mulai Latihanmu" | branding |
| 02 | Tiga Ruang | pemilih disiplin **IRON / YOGA / MUAYTHAI** — set foto, ritme, dan jadwal ikut berubah | yoga + muaythai |
| 03 | Alat yang Ada | tabel spesifikasi nyata (rack, bar oly 20 kg, plat bumper, dumbbell 2,5–50 kg, bag muaythai, matras) + diagram tata letak lantai SVG buatan sendiri | alat-alat gym |
| 04 | Keunggulan | dibangun ulang tebal: rasio coach, jumlah alat, akses 3 ruang, jam operasional | keunggulan |
| 05 | Coach & PT | profil + sertifikasi + paket sesi PT (harga per sesi, cara booking) | PT profesional |
| 06 | Membership | 3 tier: isi, jam akses, akses 3 ruang, tanpa biaya tersembunyi. Kalkulator BMI **dipindah ke dashboard member** | membership |
| 07 | Jadwal | tabel kelas hari ini; ikut berubah sesuai disiplin yang dipilih di blok 02 | operasional |
| 08 | Komunitas | bukti konkret: open mat, kelas gratis member, lomba internal, sesi lari bareng | komunitas solid |
| 09 | Kata Member | 3 testimoni: nama, disiplin, durasi. Dummy diberi komentar `// dummy` | testimoni |
| 10 | Datang | lokasi, jam buka, kontak, footer | penutup |

Ritme antar seksi wajib beda-beda (dial RHYTHM 2) — bukan semua "judul tengah + grid kartu".

## 3. Signature: pemilih disiplin

Perilaku:

- Tiga tab: **IRON / YOGA / MUAYTHAI**, state tersimpan (Zustand, pola yang sudah dipakai repo).
- Mengubah: foto hero, grade foto, ritme tipografi (tracking/lebar/spacing), isi tabel jadwal,
  dan daftar kelas terkait. **Tidak** menambah warna — palet tetap 2 netral + 1 aksen.
- Transisi halus (fade + pergeseran kecil), tidak ada animasi dekoratif tanpa state.
- Alasan UX ditulis di komentar kode (aturan repo: setiap animasi punya tujuan tertulis).

Karakter per disiplin:

```
IRON     : kontras tinggi, extrabold rapat, ruang padat, tempo cepat
YOGA     : grade lembut, tracking lebar, ruang lega, tempo lambat
MUAYTHAI : grade keras + grain, garis miring, ritme agresif
```

## 4. Keputusan yang sudah diambil

| Topik | Keputusan |
|---|---|
| Testimoni | **dummy diperbolehkan** (larangan lama di `DESIGN.md` dicabut), tanpa rating bintang, ditandai `// dummy` |
| Nama coach | bebas, relevan, hindari nama Barat generik |
| Signature | pemilih disiplin — **disetujui** |
| Kalkulator BMI | dikeluarkan dari landing, pindah ke dashboard member |
| Aset gambar/video | di-generate manual oleh pemilik; agen menyiapkan prompt satu per aset |
| Warna merah | material/sinyal; tidak untuk body text (rasio terukur ada di `DESIGN.md`) |

## 5. Peta file (rencana)

Baru:

```
components/DisciplineSwitch.tsx     tab disiplin + state
components/EquipmentSection.tsx     tabel alat + diagram lantai
components/PTProfessionalsSection.tsx
components/MembershipSection.tsx    (menggantikan peran harga di PricingBMI)
components/TestimonialsSection.tsx
components/CommunitySection.tsx
assets/brand/span-motif.svg         ornamen jembatan
assets/brand/floorplan.svg          diagram tata letak alat
assets/brand/badge-{iron,yoga,muaythai}.svg
```

Diubah:

```
Hero.tsx            motif H1 + foto per disiplin + jam buka + CTA
FeaturesSection.tsx dirombak jadi blok 04 Keunggulan
ClassesTrainersSection.tsx  dipecah: kelas+jadwal (07) vs coach/PT (05)
PricingBMISection.tsx       harga keluar → MembershipSection; kalkulator BMI pindah
HomePage.tsx        urutan 10 blok
Navbar.tsx / Footer.tsx     penyesuaian anchor + motif
```

## 6. Kebebasan layout & pilihan library

**Layout bebas.** Struktur 10 blok itu urutan cerita, bukan cetak biru tata letak. Tata letak
lama tidak dipertahankan hanya karena sudah ada; setiap blok boleh dikomposisi ulang asal ritme
antar seksi berbeda (dial RHYTHM 2).

**Library: pakai yang sudah ada, tambah hanya kalau perlu.**

| Kebutuhan | Pakai | Alasan |
|---|---|---|
| Pemilih disiplin | **Radix Tabs** (`@radix-ui/react-tabs`, sudah terpasang lewat shadcn) | konsisten dengan `ClassesTrainersSection` yang sudah pakai Tabs |
| Animasi masuk / transisi | **tailwindcss-animate** (`animate-in fade-in …`) + CSS keyframes | sudah terpasang; tidak perlu framer-motion |
| Parallax & gerak ikut kursor | `requestAnimationFrame` + transform CSS | cukup, dan tidak menambah bobot |
| Ikon | `lucide-react` (sudah ada), **kecuali ikon brand** (aturan repo) | hemat, sesuai aturan |
| State disiplin | **Zustand** (sudah ada) | sudah jadi pola repo |
| Notifikasi | `sonner` (sudah ada) | form kontak / pendaftaran |
| Library baru | hanya kalau ada alasan tertulis (mis. carousel kalau memang butuh) | hindari nambah dependensi tanpa perlu |

**Background kreatif = dibuat sendiri di kode, bukan aset.** Ini yang dimaksud "elemen buatan
sendiri": gradient radial/conic merah di atas near-black, mask SVG, motif span jembatan sebagai
path SVG, pola garis lewat SVG `pattern` (bukan `repeating-linear-gradient` — detector impeccable
menandainya sebagai slop), grain dari `feTurbulence`. Aset tekstur yang di-generate
(`texture-chalk.png`, `texture-grain.png`) hanya dipakai untuk blend, bukan sebagai gambar utama.

## 7. Aset yang perlu di-generate

Daftar lengkap + prompt siap-tempel: **`docs/asset-prompts.md`**.

Ringkas: 3 video hero (`hero-iron/yoga/muaythai.mp4`, 8 detik, tanpa audio, loop mulus) +
3 poster frame + 3 foto disiplin + 4 foto alat + 1 foto komunitas + 3 potret coach + 2 tekstur.

Semua foto satu grade rumah: duotone `#121212` + tint merah, grain halus, crop ketat.
Dilarang: orang senyum menghadap kamera, treadmill berjajar, stok "gym" generik, teks di dalam gambar.

### Status aset (sudah masuk `frontend/public/assets/`)

| File | Ukuran | Catatan |
|---|---|---|
| `hero-iron.mp4` / `hero-yoga.mp4` / `hero-muaythai.mp4` | 1,6–3,2 MB | 1280x720 (bukan 1080), 10 detik, 24 fps, audio sudah dibuang, tanpa watermark |
| `hero-iron.jpg` / `hero-yoga.jpg` / `hero-muaythai.jpg` | 29–48 KB | poster, frame detik 4 |
| `discipline-iron.jpg` | 148 KB | loaded barbell, 1600x1067 |
| `discipline-yoga.jpg` | 133 KB | **paling lemah** — isinya peti plyo + matras, bukan studio yoga. Kandidat ganti |
| `discipline-muaythai.jpg` | 116 KB | heavy bag berderet |
| `equip-plates/rack/bag/yoga.jpg` | 96–189 KB | 1400x1050 |
| `community.jpg` | 201 KB | 1920x1080, dari belakang, tanpa muka |
| `pt-1/2/3.jpg` | 92–106 KB | 1000x1333, latar hitam, tanpa senyum |
| `texture-chalk.jpg` | 378 KB | kepulan chalk, untuk `mix-blend-mode: screen` |
| `texture-grain.png` | 200 KB | dibuat sendiri dari noise (tileable), bukan hasil generate |

Aset yang tidak dipakai (masih di `Downloads`, tidak dihapus): 9 potret latar kamar/cermin dan
1 ilustrasi vektor yang tidak berhubungan dengan brief.

## 8. Verifikasi sebelum dibilang selesai

1. `npm run build` lulus (tsc + vite) + `npm run lint` **tidak menambah** dari baseline 14 error bawaan.
2. Aturan diperiksa dari `.agents/rules/*` (10 file) + `DESIGN.md` + `docs/landing-direction.md`.
3. Detector `impeccable detect` — error 0; warning/advisory dijelaskan alasannya.
4. Audit kontras: setiap pasangan teks/latar dilaporkan angkanya (target >=4.5:1 body; >=3:1 teks besar).
5. Screenshot 390 / 768 / 1440 untuk tiap disiplin (3 × 3 = 9 gambar) + laporan apa yang belum.
6. Tidak menyentuh backend, tidak mengubah dokumen API/DB.

### Status kerja (27 Okt 2026)

- **Gerbang build dibuka.** 12 error tsc bawaan dibereskan (11 unused + 1 type error nyata di
  `useCoachManagement.ts`: narrowing tidak bertahan di dalam callback filter), dan
  `ignoreDeprecations: "6.0"` dipasang di `frontend/tsconfig.app.json` (TS 6 menolak opsi `baseUrl`).
  Hasil terukur: `tsc -b` exit 0 · `npm run build` hijau (`✓ built in 2.88s`) · lint 26 → **14 error**
  (batas baru = 14, itu bawaan yang tersisa: unused var & `any` di file dashboard).
  Dua alert galat di form login/register sekarang benar-benar dirender (sebelumnya state-nya
  di-set tapi tidak pernah tampil).
- **`.agents/rules/*` ditulis**: 10 file (sebelumnya foldernya kosong, padahal `AGENTS.md` merujuknya).
  Catatan: `antislop.md` + `skills/antislop-*` yang disebut blok `<!-- antislop -->` di `AGENTS.md`
  **tidak ada di repo** — belum dibuat; penggantinya sementara `DESIGN.md` + detector impeccable.
- **`PRODUCT.md`** dibuat (asumsi dilabeli; interview `init` tidak dijalankan atas permintaan pemilik).
- **`docs/landing-direction.md`** dibuat: dunia visual "Satu Jembatan, Tiga Ruang", token, elemen
  buatan sendiri (BridgeSpan, bg-forge, ChalkField, pola SVG, grain), 10 blok, aturan gerak, terima jadi.
- **Eksekusi**: omp (`ninerouter/ds41`) membangun 10 blok + komponen brand + store disiplin.
  **Verifikasi**: `cache/scratch/gym_verify.py` — kontras per elemen, a11y, layout 3 viewport,
  reduced-motion, video/poster, `impeccable detect`, plus 9 screenshot ke `docs/shots/`.
