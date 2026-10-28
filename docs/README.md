# Dokumen — GymHub

Peta semua dokumen di repo. Kalau bingung harus baca apa, mulai dari sini.

## Aturan

1. **Satu fakta, satu tempat.** Kalau sebuah fakta harus muncul di dua berkas, tulis di satu
   tempat lalu tunjuk dari yang lain. Berkas yang mengulang isi berkas lain adalah utang.
2. **Keputusan ditulis sebagai ADR** di `decisions/`, satu berkas per keputusan, bernomor.
   ADR yang sudah ada **tidak diubah** — kalau keputusannya berganti, tulis ADR baru yang menunjuk
   ADR lama. Riwayat itu yang mencegah bug lama kembali.
3. **Fitur ditulis sebagai PRD** di `prd/`, satu berkas per fitur, bernomor.
4. **Yang belum jadi ditandai.** Data contoh wajib ditulis "contoh"; angka belum ada ditulis
   "belum ada", jangan dikarang.
5. **Arsip jangan dihapus, jangan dipercaya.** Ditandai jelas di tabel bawah.

## Dokumen Hidup

| Berkas | Isi |
| --- | --- |
| [`../README.md`](../README.md) | Pintu masuk untuk manusia: apa ini, cara jalan cepat, keadaan modul |
| [`../AGENTS.md`](../AGENTS.md) | Pintu masuk untuk AI coding agent: aturan kerja, perintah, larangan, keadaan terkini |
| [`../PRODUCT.md`](../PRODUCT.md) | Produk: pengguna, lingkup, keputusan terkunci, data yang belum ada |
| [`../DESIGN.md`](../DESIGN.md) | Visual: palet, tipografi, aturan permukaan, larangan gaya |
| [`workflow.md`](workflow.md) | Setup lokal, port, perintah harian, konvensi kode |
| [`api-contract.md`](api-contract.md) | Konvensi respons + **endpoint yang sudah ada** dan yang masih rencana |
| [`db-schema.md`](db-schema.md) | Ringkasan skema; sumber aslinya `backend/database/migrations/` |
| [`prd/001-admin-manajemen-member.md`](prd/001-admin-manajemen-member.md) | Fitur aktif: panel petugas mengelola anggota |
| [`decisions/001-skema-drift-dan-sumber-kebenaran.md`](decisions/001-skema-drift-dan-sumber-kebenaran.md) | Migrasi adalah sumber kebenaran skema; jangan tambah kolom lewat phpMyAdmin |
| [`decisions/002-zona-waktu-dan-status.md`](decisions/002-zona-waktu-dan-status.md) | Aplikasi memakai `Asia/Jakarta`, bukan UTC |
| [`decisions/003-status-tiga.md`](decisions/003-status-tiga.md) | Status anggota tiga, bukan empat |

## Arsip

Catatan proses yang sudah selesai dikerjakan. Berguna untuk tahu kenapa sesuatu dulu diputuskan,
**bukan** rujukan keadaan sekarang. Kalau isinya bentrok dengan dokumen hidup, dokumen hidup menang.

| Berkas | Isi |
| --- | --- |
| [`handoff-2026-10-28-lanjut-langkah-3.md`](handoff-2026-10-28-lanjut-langkah-3.md) | Serah-terima pengerjaan panel petugas (kode `BFG-` dan empat status — keduanya sudah berubah) |
| [`landing/rencana-landing.md`](landing/rencana-landing.md) | Rencana halaman landing |
| [`landing/catatan-landing.md`](landing/catatan-landing.md) | Catatan pengerjaan landing |
| [`landing/arah-desain-landing.md`](landing/arah-desain-landing.md) | Arah desain landing |
| [`landing/pemolesan-landing.md`](landing/pemolesan-landing.md) | Daftar pemolesan landing |
| [`landing/prompt-aset.md`](landing/prompt-aset.md) | Prompt pembuatan aset |
| [`landing/kredit-aset.md`](landing/kredit-aset.md) | Sumber tiap aset — **masih berlaku** kalau asetnya dipakai |

## Urutan Membaca

**Orang baru (5 menit):** `../README.md` → `../PRODUCT.md` → `decisions/003-status-tiga.md`.

**Mau menulis kode:** `../AGENTS.md` → `workflow.md` → `api-contract.md` → `db-schema.md` →
`prd/` fitur aktif.

**Cuma ingin tahu aturan visual:** `../DESIGN.md`.

## Yang Sedang Dikerjakan

1. **Panel petugas** — selesai dan teruji (PRD-001). Sisa: ekspor data, dan membersihkan dua route
   contoh di backend.
2. **Landing publik** — menunggu data gym sebenarnya; lihat `../PRODUCT.md` bagian *Data yang belum ada*.
3. **Panel owner** — belum dimulai. Butuh PRD dengan angka dari `/docs/prd/`.
