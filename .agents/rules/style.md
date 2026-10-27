# style.md — Visual (ringkas; `DESIGN.md` yang mengikat)

Palet: dark `#121212`, surface `#1E1E1E`, aksen merah `#DC2626`, teks putih, muted `#a3a3a3`,
mode terang `#FFFFFF` / `#0a0a0a`. Tidak ada warna lain kecuali semantic.

**Merah = material & sinyal, bukan warna teks.** Rasio terukur:
- `#DC2626` di `#121212` = 3,88:1 -> hanya teks besar / garis / badge / ikon
- putih di tombol merah = 4,83:1 -> label tombol pakai **putih**, bukan hitam
- body text: putih atau `#a3a3a3` (7,43:1)

Tipografi: Plus Jakarta Sans. H1 `font-extrabold text-5xl–7xl uppercase tracking-tight`;
H2 `font-extrabold text-4xl–6xl uppercase`; body `font-light text-base–lg`; label `font-bold text-xs uppercase tracking-widest`.

Motif identitas: heading uppercase tebal + baris italic light di bawahnya.
Ornamen pengulang: satu garis span (jembatan) merah tipis, maksimal 1 per seksi.

Wajib: ritme antar seksi berbeda (RHYTHM 2). Radius: tombol `rounded` (4px), card `rounded-xl`,
input `rounded-md`; jangan semua pill. Shadow hanya untuk elemen elevated; glow merah maksimal
1 elemen per seksi. Glassmorphism maksimal 2 slot per layar.

Dilarang: emoji di UI, gradient ungu, card bertumpuk, teks merah untuk paragraf, CTA generik
("Get Started", "Learn More"), buzzword ("seamless", "revolutionary"), nama brand lain (GymPro, GymHub).
