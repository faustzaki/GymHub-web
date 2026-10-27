# landing-polish.md — dari 8 ke 9,5 (tanpa aset baru)

Dasar: penilaian pemilik 8/10 + kritik yang sudah diukur (`landing-notes.md`). Semua item di sini
pakai aset yang sudah ada. Aturan main tetap: `DESIGN.md`, `docs/landing-direction.md`,
`.agents/rules/*`, nol dependensi baru, build hijau, lint tidak menambah dari 14.

## 1. Satu bahasa permukaan

**Masalah:** kartu ber-border dan panel datar bercampur — ini yang paling kelihatan "template".

**Aturan yang ditetapkan (tulis di `DESIGN.md`):**
- Setiap blok punya satu latar: `bg-background` (#121212) atau `bg-card` (#1E1E1E), bergantian.
- Semua elemen berbingkai: `border border-border`, radius `rounded` (4px) untuk kontrol kecil,
  `rounded-none` untuk panel besar — satu pilihan per kelas elemen, tidak dicampur.
- Elemen di atas `bg-card` memakai `bg-background` sebagai kartu, dan sebaliknya.
- Bayangan **hanya** untuk elemen yang benar-benar melayang (dropdown, toast, sticky CTA).

**Terima jadi:** tidak ada lagi pasangan kartu berbingkai di sebelah panel tanpa bingkai dalam
satu blok yang sama.

## 2. Ritme tipografi

- Token skala di `index.css` (`@theme`): `--text-display` (`clamp(2.75rem, 7vw, 5.5rem)`),
  `--text-title` (`clamp(2rem, 4.2vw, 3.5rem)`), `--text-lead`, `--text-body`, `--text-label`.
  Semua heading seksi memakai token ini, bukan angka acak.
- Tracking berbeda per disiplin (sudah ada) — pastikan berlaku juga pada label, bukan cuma judul.
- Jarak antar blok memakai `--rhythm-1/2/3` (sudah ada) dan berselang-seling, bukan seragam.
- Perbaiki `Satu jembatan.Tiga ruang latihan.` → beri spasi agar pembaca layar tidak membacanya
  sebagai satu kata sambung.

## 3. Interaksi khas yang berasa (menggantikan slider)

`EquipmentSection`: pengisi plat yang bisa **diseret**.
- Seret horizontal (pointer events) dengan langkah 2,5 kg dan **snap** ke langkah terdekat.
- Angka total = bar 20 kg + plat; dibacakan lewat `aria-live="polite"`.
- Keyboard: `←/→` mengubah 2,5 kg, `Home/End` ke minimum/maksimum, fokus terlihat.
- Pelat bergeser dengan transform + bayangan menebal; saat berhenti, ada pantulan halus
  (spring-ish) maksimal 1 kali — tidak ada animasi `infinite`.
- Kopi: satu kalimat alasan ("Beban ini yang tercatat di akunmu setiap sesi.").

## 4. Pass HP (390px)

- **CTA lengket** muncul setelah hero lewat (IntersectionObserver): tinggi ≥48px, `pb-[env(safe-area-inset-bottom)]`,
  hilang saat bagian kontak terlihat, tidak menutupi konten (pakai padding bawah di footer).
- **Hemat data**: kalau `navigator.connection.saveData` atau `effectiveType` `slow-2g`/`2g`,
  hero menampilkan poster saja (tanpa elemen `<video>` sama sekali).
- Jadwal kelas: pada <640px jadi daftar kartu (bukan grid tabel) dengan waktu + nama + sisa kuota.
- Target sentuh ≥44px di semua kontrol, termasuk tombol hari dan saringan ruang.

## 5. Performa

- Bundle dipecah per rute: halaman dashboard/auth di-`React.lazy` + `Suspense` (landing tetap
  di chunk utama, harus < 250 KB gzip).
- `frontend/index.html`: `<link rel="preload" as="image" href="/assets/hero-iron.jpg">` + `fetchpriority="high"`.
- Seksi di bawah lipatan: `content-visibility: auto` + `contain-intrinsic-size` supaya tidak
  di-layout sebelum terlihat.
- Ukur dari render nyata: LCP, CLS, dan daftar chunk. Target: LCP < 2,5 s, CLS < 0,02, nol
  pergeseran karena media tanpa rasio.

## 6. Copy pass

- Buang sisa kalimat generik; setiap klaim harus spesifik dan bisa diperiksa.
- Angka yang belum ada sumbernya ditandai di komentar `// dummy` atau `[angka nyata]`; tidak ada
  rating bintang, tidak ada testimoni yang mengaku-aku terverifikasi.

## 7. Micro-detail

- `:focus-visible` seragam di seluruh halaman: `ring-2 ring-primary ring-offset-2 ring-offset-background`.
- Hover: satu pola (transform halus atau warna), bukan campur-campur.
- Halaman 404, login, dan register disamakan bahasanya dengan landing (tipografi + tombol + latar),
  supaya keluar dari landing tidak terasa pindah aplikasi.

## 8. Aksesibilitas lanjutan

- `aria-live="polite"` untuk: perubahan disiplin, total beban, dan hasil saring jadwal.
- Hormati `prefers-contrast: more`: teks muted naik ke `text-foreground`, bingkai jadi `border-foreground/40`.
- `prefers-reduced-motion` tetap seperti sekarang (poster, tanpa parallax, tanpa reveal).

## Verifikasi (wajib, dengan angka)

1. `npm run build` hijau; `npm run lint` ≤14 error; `impeccable detect` ≤1 temuan (font brand).
2. Kontras: 0 gagal (≥4,5:1 teks kecil; ≥3:1 teks besar) di 390/768/1440.
3. LCP/CLS terukur + daftar chunk (landing < 250 KB gzip).
4. HP: CTA lengket muncul & hilang benar; target sentuh ≥44px; nol scroll horizontal.
5. Keyboard: pemilih ruang, pengisi plat, saringan hari, dan CTA bisa dicapai Tab, fokus terlihat.
6. Reduced-motion: nol `<video>`, nol animasi infinite.
7. Screenshot 390/768/1440 × 3 disiplin ke `docs/shots/`.

## 3b. Affordance pengisi plat — temuan verifikasi (WAJIB diperbaiki)

Diperiksa dari render nyata (screenshot `#alat` 1440), bukan dari kode. Fungsinya sudah ada
(seret + panah keyboard + `aria-live`), tapi **tidak terbaca sebagai kontrol**:

- Tidak ada jalur/track, tidak ada kenop, tidak ada tombol. Yang terlihat cuma garis merah statis.
- Teks `← ubah 2,5 kg · Home/End ke ujung` adalah instruksi, bukan antarmuka. Pembaca mouse/sentuh
  tidak bisa memakainya.
- Tidak ada keadaan hover, aktif, atau fokus yang membedakan.
- Angka total (80 kg) tidak terhubung secara visual ke apa pun yang bisa digerakkan.
- Jarak antar plat nol — terbaca sebagai satu blok merah, bukan tumpukan.

**Perbaikan yang diminta:**
- Track yang terlihat (1px garis + isian), kenop yang jelas, dan tombol `−` / `+` ≥44px di sisinya.
- Seret di track juga jalan (pointer + sentuh), bukan cuma panah keyboard.
- Keadaan hover/aktif/`focus-visible` beda dan terlihat; angka naik-turun mengikuti.
- Instruksi keyboard pindah ke `sr-only` atau tooltip judul, jangan jadi teks antarmuka.
- Plat diberi jarak 4–6px agar terbaca sebagai tumpukan; total beban tetap ikut berubah.
- Teks bantu (`Bar 20 kg + 24 pelat`, caption) dinaikkan sampai kontras ≥4,5:1 — sekarang tenggelam.

## 3c. Temuan lain dari pemeriksaan mata

- Foto kedua di blok `#alat` terpotong tanpa alasan yang terlihat — perbaiki rasio atau posisinya.
- Spasi hilang setelah titik/koma pada judul: `Latihan sendiri,pulang punya nama yang dikenal.`
  dan `Siap mulai.Datang, atau tanya dulu.` — perbaiki (termasuk pembaca layar). **SELESAI**

## 9. Cacat yang ketemu saat verifikasi Run B (WAJIB)

1. **CTA lengket tidak hilang di bagian kontak.** Diukur di 390 px: setelah hero dia muncul benar
   (61 px, teks "Mulai Latihanmu"), tapi saat halaman di-scroll ke bawah — bagian `#contact`
   terlihat — dia **masih tampil**. Harus hilang di sana supaya tidak menutupi form kontak.
2. **Scrim hero di HP kurang.** Scrim horizontal (`linear-gradient to_right`) masih `md:block`,
   jadi di 390 px teks hanya duduk di atas scrim vertikal. Teks kontrasnya lolos tapi pas-pasan;
   naikkan dengan membuat scrim horizontal berlaku di semua lebar (opasitas lebih ringan di HP).
3. **`docs/DESIGN.md` duplikat.** Isi aturan permukaan ditulis ke berkas baru padahal `DESIGN.md`
   di akar repo sudah ada dan dipakai `AGENTS.md`. Gabungkan ke `DESIGN.md` akar, lalu hapus
   `docs/DESIGN.md`. Satu aturan, satu tempat.

## 10. Status terukur (dari render nyata)

| Perkara | Baseline (dist lama) | Sekarang |
|---|---|---|
| Chunk utama | 931,83 kB / gzip 281,96 kB | **247,71 kB / gzip 75,01 kB** |
| LCP (dev, 3 viewport) | 972 / 464 / 428 ms | **520 / 460 / 412 ms** |
| Main thread terblokir | 201 ms / 3 tugas | **60 ms / 2 tugas** |
| CLS | 0,0015–0,0037 | **0,0015–0,0020** |
| Kontras gagal | 12 elemen (sebelum tambalan kontras) | **0 dari 279–280 elemen** × 3 viewport |
| `aria-live` | 1 | 4 |
| `content-visibility` | 0 elemen | 9 elemen |
| Hemat data (`saveData`) | tetap 3 `<video>` | **0 `<video>`**, poster tetap |
| Fokus keyboard pemilih ruang | `1px none` | `2px solid` |
| Target sentuh < 44 px | ada | **0** |
| CTA lengket HP | tidak ada | ada; hilang saat kontak terlihat |
| Grid foto di 390 px | 453 px, 2 kartu terpotong | **342 px, 4/4 kartu utuh** |
| Judul halaman | `frontend` | `Bifrost Gym` |
| Lint | 14 error | 14 error (nol tambahan) |
| Build | hijau | hijau |

Catatan pengukuran (biar tidak salah lagi di lain waktu):

- **`content-visibility: auto` membuat screenshot full-page palsu** — Chromium tidak merender seksi
  yang belum terlihat, jadi potongan bawah jadi gambar kosong 11 KB. Skrip `shoot_full.py`
  menetralkan properti itu dan menggulir bertahap sebelum memotret. Alat screenshot pihak ketiga
  (dan crawler) akan melihat hal yang sama.
- **Elemen `fixed` yang digeser keluar layar tetap punya rect** — cek "CTA masih tampil?" harus
  menuntut irisan dengan viewport (`r.bottom > 8 && r.top < vh - 8`), bukan sekadar ada elemen `fixed`.
- **Di dasar dokumen, `#contact` sudah lewat di atas viewport**, jadi pertanyaan "hilang saat kontak
  terlihat?" wajib diukur dengan menggulir ke posisi kontak, bukan ke dasar halaman.
- **`"grid-cols-1" in cls` salah** — `grid-cols-12` memuat substring itu; pakai
  `grid-cols-1(?![0-9])`.
- **`subprocess.run(..., shell=True)` di Windows memakai cmd.exe** — baris gaya bash (`export PATH=...`)
  gagal dengan `'export' is not recognized`. Panggil `bash -lc` eksplisit.


