# Product

## Platform

Web. Dipakai di komputer meja gym dan di ponsel petugas.

## Tumpukan

React 19 + Vite 8 + TypeScript, Tailwind CSS v4 (`@tailwindcss/vite`), shadcn/ui (Radix),
Zustand 5, react-router-dom 7, sonner. Backend Laravel 13 + Sanctum, MySQL (Laragon lokal).
Font Plus Jakarta Sans. Repo: `GymHub-web`.

## Masalah yang Dipecahkan

Pencatatan anggota gym masih di buku dan Excel: masa aktif habis tanpa ada yang sadar, anggota
yang sudah berhenti tetap tercatat aktif, dan tidak ada satu orang pun yang tahu berapa anggota
aktif hari ini. Petugas harus mengingat sendiri siapa yang harus ditagih.

## Pengguna

- **Petugas (peran `admin`)** — orang yang duduk di meja gym. Mendaftarkan anggota baru,
  memperpanjang, dan menonaktifkan. Ini pengguna utama dan satu-satunya yang panelnya sudah jadi.
- **Owner** — pemilik gym. Butuh ringkasan: berapa anggota aktif, berapa yang akan habis, siapa
  yang paling perlu ditagih. Panelnya belum dibangun.
- **Anggota** — belum punya akun dan belum butuh. Pendaftaran **hanya oleh petugas di gym**; tidak
  ada pendaftaran daring.

Peran `coach` ada di skema database (enum `users.role`) tapi belum dipakai di fitur mana pun.

## Lingkup Fase Sekarang

Satu fitur: **manajemen anggota** (PRD-001). Petugas bisa melihat daftar anggota, mencari,
menyaring per status, mendaftarkan anggota baru, memperpanjang masa aktif, dan menonaktifkan yang
sudah berhenti. Selesai berarti buku catatan manual tidak perlu lagi dibuka untuk pertanyaan
"berapa lama lagi masa aktif anggota ini?".

Di luar lingkup sekarang — **jangan dikerjakan dulu**: dashboard anggota (jadwal, progres, materi),
dashboard coach, keuangan/pembayaran, pendaftaran daring.

## Keputusan yang Sudah Dikunci

- Nomor HP adalah identitas anggota. Daftar = otomatis sudah bayar; **tidak ada tabel pembayaran**.
- Status anggota tiga: aktif · akan berakhir (≤7 hari) · nonaktif (habis masa aktif atau dimatikan).
- Perpanjangan menyambung dari tanggal berakhir lama; sisa hari tidak hangus.
- Data lama (buku/Excel) **tidak diimpor** — mulai dari nol.

## Data yang Belum Ada

Halaman landing **wajib memakai angka nyata**, dan angka itu belum dikirim pemilik gym. Yang masih
contoh di kode: biaya pendaftaran, iuran bulanan, harga paket, daftar alat, daftar PT beserta tarif,
alamat, jam buka, dan nomor WhatsApp. Selama belum ada, biarkan ditandai `// dummy` — jangan
ditunggu, jangan dikarang, jangan dihapus tanpa diganti.

Yang juga belum diverifikasi: klaim "tiga disiplin" (angkat beban, yoga, muaythai), foto ruangan
sebenarnya, dan angka operasional. Kalau pemilik gym ternyata tidak punya tiga disiplin itu,
landing-nya yang menyesuaikan — bukan sebaliknya.

## Prinsip Produk

1. **Bukti di atas klaim.** Angka, tanggal, harga — bukan kata sifat.
2. **Petugas mengetik sesedikit mungkin.** Satu anggota baru = nama + nomor HP + durasi.
3. **Kalau belum ada datanya, tandai** — jangan dikarang.
4. **Kejelasan dulu, ekspresi kemudian.** Ekspresi tidak boleh mengorbankan kontras, fokus,
   atau kecepatan.
5. **Sistem harus selalu bisa dipakai.** Setiap perubahan ditinggalkan dalam keadaan jalan —
   tidak ada langkah setengah jadi di `main`.

## Aksesibilitas

Kontras teks ≥ 4,5:1 (≥ 3:1 untuk teks besar; merah hanya untuk elemen atau teks besar);
`:focus-visible` terlihat; navigasi keyboard penuh sampai tombol aksi; HTML semantik tanpa lompat
level heading; `alt` deskriptif; target sentuh ≥ 44 px; teks membesar sampai 200% tanpa kehilangan
konten; animasi berhenti saat `prefers-reduced-motion`.

---

_Ringkasan fakta di berkas ini berasal dari keputusan tertulis, bukan dari wawancara pemilik gym
yang belum pernah dijalankan._
