# rules.md — Aturan komponen & kode

- **shadcn/ui dulu, bikin sendiri belakangan.** Komponen primitif baru hanya kalau shadcn tidak punya padanannya.
- Tailwind lewat token `@theme` (`src/index.css`). Jangan hardcode hex di className; jangan inline `style` kecuali nilainya dinamis (posisi, progress).
- Nama file komponen PascalCase; satu komponen utama per file; subkomponen modul menempel di `components/` modul itu.
- Setiap permintaan data punya tiga keadaan: loading (skeleton), kosong (pesan + aksi), error (pesan + coba lagi). Tidak ada `?.` yang menyembunyikan error.
- Semua teks UI berbahasa Indonesia (kecuali istilah teknis: set, rep, deadlift, cardio).
- Jangan tinggalkan `console.log`, kode mati, atau `any` baru. `any` yang sudah ada jangan ditambah.
- Aksesibilitas bukan opsional: `alt` bermakna, `aria-label` untuk tombol ikon, target sentuh >=44px, `:focus-visible` terlihat, urutan heading tanpa lompat level.
- Animasi harus punya tujuan; tulis alasannya di komentar. Wajib hormati `prefers-reduced-motion`.
