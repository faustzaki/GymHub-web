# ADR-003 — Status anggota: tiga, bukan empat

**Status:** diterapkan · 2026-10-28
**Konteks:** PRD-001 semula menyebut empat status (`aktif` / `akan_berakhir` / `kadaluarsa` / `nonaktif`)

## Keputusan

Status anggota **hanya tiga**:

| Status | Kapan |
| --- | --- |
| `aktif` | Sisa lebih dari 7 hari |
| `akan_berakhir` | Sisa 0 sampai 7 hari (termasuk **hari berakhirnya sendiri**) |
| `nonaktif` | Sisa negatif (masa aktif lewat) **atau** akunnya dimatikan petugas |

`kadaluarsa` dihapus dan dilebur ke `nonaktif`.

## Alasan

- Dari sisi petugas di meja gym, anggota yang masa aktifnya habis dan anggota yang dimatikan
  petugas sama-sama **tidak boleh masuk**. Bedanya satu urusan catatan, bukan urusan pintu.
- Empat status berarti empat warna badge dan empat pilihan filter untuk keperluan yang hanya butuh
  tiga. Setiap tambahan di daftar harian dibayar oleh kecepatan petugas membaca layar.

## Yang tidak hilang

Perbedaan antara "habis masa aktif" dan "dimatikan petugas" tetap terbaca:

- tanggal berakhirnya masih tertulis apa adanya di tabel dan panel detail;
- tombol di panel detail berubah jadi **Aktifkan kembali** kalau akunnya memang dimatikan;
- filter `nonaktif` menampilkan kedua sebab, dan urutannya berdasarkan tanggal berakhir.

## Akibat teknis

- `Member::status()` mengembalikan tiga nilai.
- Filter `?status=` hanya menerima `aktif`, `akan_berakhir`, `nonaktif`. Nilai lain **ditolak 422**,
  bukan diabaikan — kalau diabaikan, salah ketik seperti `kadaluarsa` diam-diam menampilkan seluruh
  anggota dan angkanya terlihat wajar.
- Filter `nonaktif` wajib melepas scope soft delete; tanpa itu, anggota yang dimatikan justru hilang
  dari daftar tepat saat dicari.
- Perbandingan tanggal memakai `whereDate()` supaya jam yang tersimpan tidak ikut menentukan.
