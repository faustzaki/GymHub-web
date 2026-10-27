# lucide-icons.md — Aturan ikon

- Ikon generik (panah, cek, menu, kalender): boleh `lucide-react` (sudah terpasang).
- **Ikon brand dilarang**: logo Instagram, WhatsApp, TikTok, X, Facebook, Google, dan merek lain.
  Lucide sudah menghapusnya, dan memaksakannya lewat SVG pihak ketiga melanggar aturan repo ini.
- Ikon brand kalau memang dibutuhkan: gambar SVG sendiri di `src/assets/icons/` (bentuk sederhana,
  satu warna `currentColor`), lalu dipakai sebagai komponen React.
- Ukuran ikon konsisten: 16 / 20 / 24 px. Ikon dekoratif diberi `aria-hidden="true"`;
  ikon yang jadi satu-satunya isi tombol wajib punya `aria-label`.
