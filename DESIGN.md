# DESIGN.md — Bifrost Gym

## Identity
- **Nama Brand**: Bifrost Gym
- **Tagline / Positioning**: Gym lokal digital-first — semua jadwal, progres, dan materi bisa dipantau online.
- **Persona pengguna**: Komunitas gym lokal, semua usia. Tidak mengintimidasi, tapi tetap serius soal hasil latihan.

## Personality & Tone
- **Karakter**: Energik tapi bisa diandalkan. Bukan "corporate fitness brand" — lebih ke komunitas yang hangat + profesional.
- **Tone copy**: Langsung, motivasional, bahasa Indonesia. Hindari buzzword Inggris yang generik ("seamless", "revolutionary"). Gunakan kalimat nyata: "Latihan hari ini sudah dijadwalkan. Cek sekarang."
- **Bukan**: intimidasi, elitisme, gaya militarisme.

## Visual Language

### Palet Warna
- **Primary (Aksen)**: Merah — `#DC2626` (dark mode) / `oklch(0.577 0.245 27.3)` (light mode approx `#e02222`)
- **Background utama dark**: `#121212`
- **Surface / Card dark**: `#1E1E1E`
- **Background utama light**: `#FFFFFF`
- **Foreground light**: `#0a0a0a`
- **Netral tambahan**: abu-abu (`#a3a3a3` untuk muted text)
- Palet aktif: 2 warna inti (hitam/putih tergantung mode) + 1 aksen merah. Tidak ada warna lain kecuali semantic (hijau sukses, dll.).

### Tipografi
- **Font**: Plus Jakarta Sans (variable, 300–800)
- **Hierarchy**:
  - H1 landing: `font-extrabold text-5xl–7xl uppercase tracking-tight`
  - H2 section: `font-extrabold text-4xl–6xl uppercase`
  - Body: `font-light text-base–lg leading-relaxed`
  - Label/UI kecil: `font-bold text-xs uppercase tracking-widest`
- **Alasan**: Plus Jakarta Sans punya lebar stroke yang seimbang — kuat saat bold, bersih saat light. Cocok untuk kontras "komunitas serius tapi bukan militer".

### Spacing & Layout
- Max container: `max-w-7xl mx-auto px-6 lg:px-8`
- Section vertical: `py-24 lg:py-32`
- **Variasi rhythm wajib** (RHYTHM 2): setiap section punya komposisi berbeda. Tidak semua centered-title + card-grid.

### Border Radius
- Tombol utama: `rounded` (4px) — tegas, bukan pill
- Card: `rounded-xl` (12px)
- Avatar: `rounded-full`
- Input: `rounded-md` (6px)
- Jangan semua elemen pill-shape.

### Shadow & Glow
- Shadow hanya untuk elemen elevated (modal, dropdown, floating card di hero) — `shadow-2xl` hanya pada 1-2 elemen per screen.
- Glow merah (`shadow-[0_0_Xpx_rgba(220,38,38,0.Y)]`) hanya pada 1 elemen paling penting per section.
- Tidak boleh glow di card + badge + button + border sekaligus.

### Glassmorphism
- Maksimum 1-2 elemen per screen: floating trainer card di hero (sudah ada) = dianggap satu slot glass.
- Navbar boleh pakai `backdrop-blur` saat scroll (sudah ada) = slot kedua. Tidak boleh ditambah lagi (card section, modal, sidebar sekaligus).

## Motion
- **Dial MOTION 3**: Parallax + efek dramatis (konfirmasi pemilik).
- Hero: parallax mouse-move ✓ (sudah ada, pertahankan)
- Section lain: scroll-reveal `animate-in fade-in` diizinkan
- Carousel auto-play (trainer): ✓
- Partikel interaktif PricingBMI: ✓
- **Larangan**: endless pulse/bounce pada elemen dekoratif tanpa state nyata.
- Setiap animasi wajib punya tujuan UX tertulis di komentar kode.

## Dials Antislop
```
ENERGY 2 / RHYTHM 2 / MOTION 3
```

## Identity Motif
Satu gesture berulang yang membuat design "milik Bifrost": teks uppercase berat (`font-extrabold uppercase tracking-tight`) dikontraskan dengan teks italic light di bawahnya (contoh: "DEFEAT YOUR LIMITS." diikuti "*REDEFINE YOURSELF.*"). Pattern ini muncul di hero H1 dan boleh diulang di section key lain — bukan di semua heading.

## Contoh CTA yang benar
- "Mulai Latihanmu" (bukan "Get Started")
- "Lihat Jadwal Hari Ini" (bukan "Explore")
- "Bergabung Sekarang" (bukan "Sign Up")
- "Cek Progres" (bukan "Learn More")

## Hal yang DILARANG di Bifrost Gym
- Nama brand lain: GymPro, GymHub — gunakan Bifrost Gym
- Emoji dekoratif di heading atau tombol UI
- Testimonial fiktif (nama karangan, rating palsu)
- Statistik tanpa sumber nyata ("10K+ Members", "99.9% Uptime")
- Nama Barat acak sebagai trainer (ALEX STANDALL, SARAH JENKINS) — gunakan nama Indonesia atau placeholder jelas `[Nama Coach]`
- CTA generik: "Get Started", "Learn More", "Try Now"
- Buzzword: "Seamless", "Revolutionary", "Next-Generation", "Powerful"
