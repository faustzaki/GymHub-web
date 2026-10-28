# API Contract — GymHub

## Konvensi Global

### Base URL

- Development: `http://127.0.0.1:8001/api`
- Frontend mengambil dari `VITE_API_BASE_URL` di `frontend/.env.local` — **jangan hardcode**.

### Bentuk Respons

**Sukses**
```json
{ "status": "success", "message": "Deskripsi singkat", "data": {} }
```

**Gagal validasi (422)**
```json
{ "status": "error", "message": "Validasi gagal", "errors": { "nama_field": ["Pesan galat"] } }
```

**Gagal lain (401 / 403 / 404 / 409 / 500)**
```json
{ "status": "error", "message": "Deskripsi galat" }
```

Semua pesan galat **berbahasa Indonesia dan menyebut apa yang harus dilakukan**, bukan kode.

### Autentikasi

- Route terproteksi memakai header `Authorization: Bearer <token>`.
- Token dari Sanctum (`createToken('auth_token')->plainTextToken`).
- Penjaga peran: middleware `role:admin` (alias didaftarkan di `bootstrap/app.php`). Balasannya JSON —
  **401** belum masuk, **403** peran salah. Bukan pengalihan ke halaman login.

### Pagination

```json
{
  "status": "success",
  "data": {
    "items": [],
    "meta": { "current_page": 1, "last_page": 5, "per_page": 15, "total": 73 }
  }
}
```

---

## Endpoint yang Sudah Ada

### Auth

| Method | Path | Keterangan |
| --- | --- | --- |
| POST | `/api/login` | `email`, `password` → `access_token` |
| POST | `/api/logout` | Hapus token yang sedang dipakai |
| GET | `/api/me` | Pengguna yang sedang masuk + relasinya |
| POST | `/api/register` | **Ada di backend, sengaja tidak dipakai FE.** Pendaftaran hanya oleh petugas (PRODUCT.md) |

### Admin — manajemen anggota (`role:admin`)

| Method | Path | Keterangan |
| --- | --- | --- |
| GET | `/api/admin/members` | Daftar. Parameter: `q` (nama / kode / nomor), `status`, `page`, `per_page` (maks 100) |
| POST | `/api/admin/members` | Daftarkan: `name`, `phone`, `plan_months` |
| GET | `/api/admin/members/{id}` | Detail + riwayat perpanjangan |
| PATCH | `/api/admin/members/{id}` | Koreksi `name` / `phone` |
| POST | `/api/admin/members/{id}/renew` | Perpanjang: `plan_months` |
| POST | `/api/admin/members/{id}/deactivate` | Nonaktifkan (soft delete akun) |
| POST | `/api/admin/members/{id}/reactivate` | Aktifkan kembali |

Aturan yang menempel di endpoint ini:

- **`status`** hanya menerima `aktif`, `akan_berakhir`, `nonaktif`. Nilai lain dibalas **422** —
  bukan diabaikan, supaya salah ketik tidak diam-diam menampilkan seluruh anggota (ADR-003).
- **`plan_months`** 1–24. Pilihan cepat di UI 1/3/6/12; di luar itu petugas menyusun sendiri.
- **Nomor HP duplikat → 409** + `data.existing_member`, supaya UI bisa menawarkan "buka anggota itu".
- Status anggota **dihitung** (`Member::status()`), bukan kolom. Rincian perilaku: PRD-001.

Aturan uang yang menempel di `POST /members` dan `POST /members/{id}/renew` (keputusan josjis 2026-10-28):

- Menerima tambahan opsional `payment_method` (`cash` / `qris`, bawaan `cash`) dan `amount_paid`
  (angka, min 0). Kalau `amount_paid` dikirim, itu yang dipakai — untuk diskon atau bayar sebagian.
- Nominal diambil dari pengaturan harga. Kalau tidak bisa dihitung (harga belum diisi dan petugas
  tidak mengirim nominal), **tidak ada baris `payments` yang ditulis**: balasan berisi
  `payment_recorded: false` + alasan. Baris bernilai Rp 0 itu bukan pembayaran, itu data sampah.
- `GET /members/{id}` mengembalikan `pembayaran` (daftar pembayaran anggota itu) + `harga_saran`.

### Owner (`role:owner`)

Semua baca-saja. Owner **tidak** punya endpoint tulis untuk anggota — pekerjaan itu ada di
`/api/admin/*`, dan owner boleh memakainya karena perannya bertingkat (P1).

| Method | Path | Keterangan |
| --- | --- | --- |
| GET | `/api/owner/summary` | Jumlah aktif / akan berakhir / nonaktif · anggota baru & berhenti bulan ini · uang masuk bulan ini · `harga_terisi` |
| GET | `/api/owner/revenue?months=6` | Uang masuk per bulan: total, jumlah transaksi, pecahan cash/qris |
| GET | `/api/owner/growth?months=6` | Anggota baru per bulan |
| GET | `/api/owner/priorities` | 10 anggota teratas untuk ditagih: yang habis ≤14 hari dulu, baru yang lewat ≤30 hari, berikut nilai paketnya |
| GET | `/api/owner/settings` | Semua pengaturan + siapa dan kapan terakhir mengubah |
| PATCH | `/api/owner/settings` | Ubah harga & info gym. Kosong berarti "belum diisi", bukan 0 |

### Publik

| Method | Path | Keterangan |
| --- | --- | --- |
| GET | `/api/settings/public` | Harga & info gym yang **sudah** diisi, untuk landing. Tanpa login. Yang belum diisi dikirim `null` |

### Sisa yang harus dibersihkan

| Method | Path | Kenapa |
| --- | --- | --- |
| GET | `/api/test-integration` | Route contoh dari awal proyek |
| GET | `/api/user` | Bawaan Sanctum, tidak dipakai |

Dua-duanya **hapus sebelum produksi**.

---

## Masih Rencana — Belum Ada di Kode

Jangan membangun layar yang memanggil endpoint di bawah ini sebelum endpoint-nya ada. Daftar ini
rencana, bukan janji: yang dibangun berikutnya ditentukan PRD.

| Kelompok | Rencana |
| --- | --- |
| Panel owner | Ringkasan: jumlah aktif / akan berakhir / nonaktif, daftar yang paling perlu ditagih |
| Ekspor | Unduh daftar anggota (CSV/Excel) — `xlsx` sudah terpasang, belum dipakai |
| Anggota | Profil, jadwal, progres, materi (dashboard member) |
| Coach | Profil, materi, anggota yang ditangani |
| Landing | Data gym sebenarnya (harga, alat, PT, jadwal, kontak) |

Grup middleware yang direncanakan:

```php
Route::middleware(['auth:sanctum', 'role:member'])->prefix('member')->group(...);
Route::middleware(['auth:sanctum', 'role:coach'])->prefix('coach')->group(...);
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(...);
```
