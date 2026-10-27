# Product

## Platform
web

## Stack
React 19 + Vite 8 + TypeScript, Tailwind CSS v4 (`@tailwindcss/vite`), shadcn/ui (Radix),
Zustand 5, react-router-dom 7, sonner. Backend Laravel 13 + Sanctum, MySQL (Laragon lokal).
Font Plus Jakarta Sans. Repo: `website-gym`.

## Users
- **Calon member (pengunjung landing)**: pekerja kantoran 25–40 di Jakarta Selatan yang ingin kuat,
  bukan sekadar kurus. Datang dari Instagram/WhatsApp, sering buka di HP, sedikit waktu.
- **Member aktif**: sudah bergabung, memakai dashboard untuk jadwal, progres, materi.
- **Coach**: mengelola kelas yang diampu dan peserta.
- **Admin**: mengelola user, coach, operasional, keuangan.

## Product Purpose
Platform manajemen gym digital-first untuk komunitas lokal: jadwal latihan, progres harian, dan
materi pelatihan dapat dipantau online. Landing page publik adalah pintu masuknya — ia harus
meyakinkan calon member untuk datang mencoba, lalu mengantarnya ke pendaftaran.

## Positioning
Gym lokal yang serius soal hasil tapi tidak mengintimidasi — **satu atap, tiga ruang**: angkat
beban (Iron), yoga, dan muaythai, dengan komunitas yang aktif dan coach bersertifikat.
Pembeda mekanisnya: seluruh pengalaman latihan (jadwal, progres, materi) tercatat digital, dan
tiga disiplin itu dikelola dalam satu sistem yang sama, bukan tiga tempat terpisah.

## Operating Context
- Lokasi: Jakarta Selatan. Buka 05.00–23.00.
- Kelas berkelompok dengan kuota kecil; jadwal harian menjadi acuan utama member.
- Calon member butuh kepastian biaya dan jadwal sebelum datang; pertanyaan berulang lewat WhatsApp.
- Repo ini memuat frontend (landing + dashboard) dan backend Laravel yang belum semua endpointnya siap
  (sebagian data masih mock).

## Capabilities and Constraints
- Landing page publik (surface utama yang sedang dikerjakan): alat yang tersedia, keunggulan,
  membership, coach & PT profesional, jadwal, komunitas, testimoni, kontak.
- Dashboard 3 peran: member, coach, admin.
- Data yang belum ada di backend **ditandai** (komentar `// dummy`, `[angka nyata]`), tidak boleh
  menyamar sebagai fakta produksi.
- Palet dibatasi: dark `#121212`, surface `#1E1E1E`, satu aksen merah `#DC2626`, netral putih/`#a3a3a3`.
  Merah tidak dipakai sebagai warna body text (rasio 3,88:1 — di bawah AA untuk teks kecil).
- Tanpa dependensi baru kecuali ada alasan tertulis.
- Motor: `prefers-reduced-motion` wajib dihormati; video hero punya poster sebagai fallback.

## Brand Commitments
- Nama resmi **GymHub** (bukan GymHub / GymPro). GymHub = pintu masuk kebugaran.
- Motif identitas: heading uppercase tebal + baris italic ringan di bawahnya.
- Motif "Satu Jembatan, Tiga Ruang": tiga disiplin sebagai tiga suara dari satu sistem.
- Nada copy: langsung, motivasional, bahasa Indonesia nyata. Tanpa buzzword ("seamless",
  "revolutionary"), tanpa emoji di UI, tanpa CTA generik ("Get Started", "Learn More").
- Tidak mengintimidasi, tidak elitis, tidak bergaya militer.

## Evidence on Hand
- Aset di `frontend/public/assets/`: 3 video hero 1920x1080 (Iron/Yoga/Muaythai, 7-8 detik, tanpa audio,
  sumber Mixkit — lihat `docs/asset-credits.md`) + 3 poster, 3 foto disiplin, 4 foto alat,
  1 foto komunitas, 3 potret coach, 2 tekstur (chalk, grain).
  Semua satu grade: near-black + rim merah. Tanpa watermark.
- `DESIGN.md` (aturan brand lengkap), `docs/landing-plan.md` (rencana landing),
  `docs/asset-prompts.md` (prompt aset), `docs/db-schema.md`, `docs/api-contract.md`.
- Belum ada: foto ruangan nyata per-disiplin yang sempurna (foto yoga paling lemah), angka
  operasional final, testimoni asli.

## Product Principles
1. Bukti di atas klaim: angka, jadwal, harga, sertifikasi — bukan kata sifat.
2. Satu sistem, tiga ruang: apa pun yang dibuat harus bekerja untuk Iron, Yoga, dan Muaythai
   tanpa menambah warna atau bahasa desain baru.
3. Kalau belum ada datanya, tandai — jangan dikarang.
4. Kejelasan dulu, ekspresi kemudian; ekspresi tidak boleh mengorbankan kontras, fokus, atau kecepatan.

## Accessibility & Inclusion
- Kontras teks >=4.5:1 (>=3:1 untuk teks besar); merah hanya untuk elemen/teks besar.
- `:focus-visible` terlihat, navigasi keyboard penuh sampai CTA.
- HTML semantik tanpa lompat level heading, `alt` deskriptif, target sentuh >=44px.
- Teks dapat membesar sampai 200% tanpa kehilangan konten; animasi dihentikan saat
  `prefers-reduced-motion`.

---

_Asumsi: ditulis dari brief pemilik (chat) + dokumen repo, karena interview init tidak dijalankan
atas permintaan eksplisit "lanjutkan semuanya". Fakta produk yang belum ada ditandai di
`## Evidence on Hand`, bukan dikarang._
