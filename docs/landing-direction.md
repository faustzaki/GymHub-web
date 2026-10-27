# landing-direction.md — arah visual & tata letak landing Bifrost Gym

Dokumen ini adalah **perintah kerja**, bukan catatan. Diambil dari brief pemilik + `PRODUCT.md` +
`DESIGN.md`, lalu diterjemahkan jadi keputusan visual yang bisa dieksekusi. Yang tidak diatur di
sini bebas (layout, ornamen, cara membangun seksi) selama tidak melanggar `DESIGN.md`.

## 1. Mode & standar

- **Mode**: Persuade. Tujuan tiap blok = satu langkah pengunjung menuju "datang mencoba".
- **Standar**: kelihatan gym di 100px, tetap gym kalau semua foto dihapus, ada satu ide besar yang
  tidak bisa dipindah ke brand lain, ada interaksi yang berasa fisik, copy tidak bisa ditempel kompetitor.

## 2. Dunia: "Satu Jembatan, Tiga Ruang"

Satu kerangka, tiga suara. Yang berubah saat disiplin berpindah **bukan warnanya**, tapi:
grade foto, tempo animasi, ritme tipografi label, dan isi jadwal.

| | IRON | YOGA | MUAYTHAI |
|---|---|---|---|
| Grade foto | kontras tinggi, grain tebal | kontras lembut, grain halus | kontras sedang, vignette kuat |
| Tempo animasi | 220ms (tegas) | 600ms (mengalir) | 320ms (kenyal) |
| Label | `TENAGA` | `NAPAS` | `TEMPO` |
| Angka khas | total beban diangkat | durasi tahan | ronde × waktu |
| Aksen merah | pada plat/rim | pada garis lantai | pada tali/rantai |

Warna tetap: `#121212` + `#1E1E1E` + `#DC2626` + netral. Tiga ruang **tidak** menambah warna.

Aturan grade: grade termasuk **CSS filter** pada foto/video (`contrast()`, `saturate()`,
`sepia()+hue-rotate()` bila perlu) — bukan tiga set foto baru. Semua foto asli tetap dipakai apa adanya.

## 3. Token

Sudah ada di `frontend/src/index.css` (`.dark`): `--background #121212`, `--card #1E1E1E`,
`--primary #DC2626`, `--muted-foreground #a3a3a3`, `--border #262626`.
Landing **memakai token semantik** (`bg-background`, `text-foreground`, `text-muted-foreground`,
`bg-card`, `border-border`, `bg-primary`), bukan hex mentah di className.

Tambahan yang boleh dibuat di `@theme` (bukan warna baru):
`--rhythm-1..3` (jarak antar seksi), `--span-width` (tebal garis jembatan 1px / 2px),

`--dur-iron 220ms` / `--dur-yoga 600ms` / `--dur-muaythai 320ms`,
`--ease-out-quint: cubic-bezier(.22,1,.36,1)`.

Wajib dicek dulu: pastikan kelas `dark` benar-benar terpasang di landing (`PublicLayout`).

## 4. Elemen buatan sendiri (kode, bukan aset baru)

Dibuat dengan CSS/SVG di komponen, satu tempat khusus `src/components/brand/`:

1. `BridgeSpan.tsx` — motif utama. Satu `path` SVG tipis (1px merah, `currentColor`) berbentuk
   kurva jembatan, dipakai **maksimal 2 tempat** di seluruh halaman (batas Hero→Alat dan sebelum
   footer). Jangan jadi divider di tiap seksi.
2. `.bg-forge` — lapisan latar: `radial-gradient` merah `#DC2626` transparan sangat rendah di tepi
   atas + `radial-gradient` gelap di bawah + `texture-grain.png` (`opacity .06`,
   `background-repeat: repeat`). Satu elemen per seksi, bukan per blok.
3. `ChalkField.tsx` — `texture-chalk.jpg` sebagai latar dengan `mix-blend-mode: screen`,
   `opacity .5`, hanya di 2 seksi (Hero & Komunitas).
4. Pola garis halus: SVG `<pattern>` (bukan `repeating-linear-gradient` — detector impeccable
   menandainya slop).
5. Grain: `texture-grain.png` + opsional `feTurbulence` untuk noise CSS murni. Pilih satu, bukan dua.
6. Mask SVG untuk tepi foto yang tidak rata (potongan diagonal mengikuti garis jembatan).

## 5. Sepuluh blok

| # | Berkas | Tujuan pengunjung | Komposisi | Aset | Satu hal khas |
|---|---|---|---|---|---|
| 01 | `Hero.tsx` | "ini gym yang mana, buat siapa" | video penuh layar, judul rata kiri, pemilih disiplin di bawah judul, baris fakta (jam, lokasi, 3 disiplin) | `hero-{iron,yoga,muaythai}.mp4` + poster | pemilih disiplin mengubah video + label, bukan sekadar tab |
| 02 | `DisciplineSwitch.tsx` | "bisa pindah ruang, nggak perlu pindah tempat" | rail horizontal 3 pilihan, penanda bergeser seperti collar barbell mengunci | — | transisi 3 suara (§2) |
| 03 | `EquipmentSection.tsx` | "alatnya nyata dan lengkap" | grid asimetris 4 foto alat + daftar alat penting dalam teks | `equip-plates/rack/bag/yoga.jpg` | tumpukan piringan: hover = berat bergeser (transform + shadow), 1 interaksi fisik |
| 04 | `FeaturesSection.tsx` | "kenapa di sini, bukan gym lain" | 4 alasan, nomor besar `01–04`, tanpa ikon generik | — | angka besar + garis jembatan tipis |
| 05 | `DisciplineSection.tsx` | "tiga ruang itu nyata" | tiga panel vertikal berjajar, masing-masing foto + label + jadwal ringkas | `discipline-iron/yoga/muaythai.jpg` | ritme tipografi & tempo beda per panel |
| 06 | `CoachesSection.tsx` | "yang melatih siapa" | daftar jadwal/kelas + coach dari store yang ada | foto coach dari `/assets` bila ada | jadwal tab per hari, bukan tabel panjang |
| 07 | `PTProfessionalsSection.tsx` | "kalau butuh 1-on-1" | 3 potret besar + hasil yang dijanjikan (kata kerja), tombol WhatsApp | `pt-1/2/3.jpg` | potret gelap, satu kalimat hasil per coach |
| 08 | `MembershipSection.tsx` | "berapa biayanya" | 3 kartu (harian/bulanan/tahunan) + daftar fasilitas; **tanpa** kalkulator BMI | — | label harga jelas, tanpa bintang-bintang |
| 09 | `TestimonialsSection.tsx` | "orang lain sudah membuktikan" | 3 kutipan pendek, nama + disiplin, **tanpa rating bintang** | — | kutipan disusun seperti catatan latihan |
| 10 | `CommunitySection.tsx` | "saya akan punya teman" | foto komunitas lebar + 3 kegiatan nyata + CTA gabung | `community.jpg` | foto dari belakang (tanpa wajah), satu baris ajakan |

`BMICalculator` dipisah ke `src/components/tools/BMICalculator.tsx` dan **tidak** dipasang di landing
(biarkan tetap bisa dipakai dashboard); `HomePage.tsx` merangkai 10 blok di atas.
`ContactSection.tsx` tetap di akhir setelah blok 10.

## 6. Gerak

- Reveal: `IntersectionObserver` `once: true`, geser 16px + fade, durasi per disiplin (§2).
- Parallax: hanya media hero, `requestAnimationFrame`, maksimum 40px, dihentikan saat scroll berhenti.
- Transisi disiplin: crossfade video `opacity` + grade filter, tanpa remount video.
- **Dilarang**: animasi `infinite`, marquee, teks berputar, lebih dari 3 elemen bergerak sekaligus.
- `prefers-reduced-motion: reduce` → tanpa parallax/reveal, video diganti poster, hanya warna/opacity.

## 7. Isi & kejujuran data

- Copy bahasa Indonesia nyata. Dilarang: "seamless", "revolutionary", "solusi terbaik", "Get Started", "Learn More".
- Angka yang belum ada di backend ditulis dengan penanda: `[angka nyata]` di komentar dan teks
  tetap masuk akal (mis. `45+ alat`).
- Testimoni & coach: boleh dummy, **wajib** komentar `// dummy` di file-nya, **tanpa** rating bintang.
- Nama coach bebas asal relevan. Foto PT yang dipakai: `pt-1.jpg` (pria 30-an), `pt-2.jpg`
  (perempuan, balutan tinju), `pt-3.jpg` (pria 40-an).

## 8. Terima jadi (acceptance)

1. `npm run build` (tsc + vite) hijau; `npm run lint` **tidak menambah** dari 14 error bawaan.
2. `impeccable detect` (dari root repo): 0 error. Warning yang disengaja dicatat alasannya di
   `docs/landing-notes.md`.
3. Kontras: setiap elemen teks ≥4.5:1 (≥3:1 bila ≥24px/19px bold), diukur dari halaman jadi.
4. A11y: urutan heading tanpa lompat level, tiap gambar punya `alt` bermakna, `:focus-visible`
   terlihat, target sentuh ≥44px, tab bisa sampai CTA utama.
5. Screenshot 390/768/1440 × IRON/YOGA/MUAYTHAI tersimpan di `docs/shots/`.
6. `prefers-reduced-motion` → video berhenti di poster; audit screenshot kedua.
7. Nol dependensi baru di `package.json`.
