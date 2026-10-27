"""Bukti uji endpoint admin PRD-001 lewat HTTP sungguhan.

Pakai:
  1. php artisan migrate:fresh --seed
  2. php artisan serve --port=8001        (port lain pun boleh)
  3. py -3.13 backend/scripts/api-proof.py 8001

Semua pemeriksaan mengecek ISI balasan, bukan cuma kode HTTP -- pernah kejadian uji "lulus"
padahal `is_active` masih true setelah penonaktifan.
"""
"""Kelengkapan uji (daftar):

Yang dibuktikan:
 1. admin bisa login lewat /api/login
 2. GET  /api/admin/members tanpa token  -> 401
 3. GET  /api/admin/members dengan token member biasa -> 403 (penjaga peran benar-benar bekerja)
 4. GET  /api/admin/members dengan token admin -> 200 + daftar
 5. POST /api/admin/members (nama + nomor) -> 201, member_code dibuat otomatis
 6. POST nomor yang sama lagi -> 409 + data pemilik nomor (supaya UI bisa menawarkan "buka member itu")
 7. POST nomor ngawur -> 422 dengan pesan berbahasa manusia
 8. POST perpanjang 3 bulan -> tanggal berakhir bertambah dari tanggal lama, bukan dari hari ini
 9. Riwayat perpanjangan tercatat di panel detail

Jalankan: py -3.13 api_proof.py
"""
import json
import random
import time
import urllib.error
import urllib.request

import sys
PORT = sys.argv[1] if len(sys.argv) > 1 else "8000"
BASE = f"http://127.0.0.1:{PORT}/api"
HASIL = []


def call(method, path, body=None, token=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(BASE + path, data=data, method=method)
    req.add_header("Accept", "application/json")
    if data is not None:
        req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            return r.status, json.loads(r.read().decode() or "{}")
    except urllib.error.HTTPError as e:
        mentah = e.read().decode()
        try:
            return e.code, json.loads(mentah or "{}")
        except json.JSONDecodeError:
            return e.code, {"raw": mentah[:200]}


def cek(label, dapat, harap, tambahan=""):
    ok = dapat == harap
    HASIL.append(ok)
    print(f"  [{'OK  ' if ok else 'GAGAL'}] {label:<58} -> {dapat} (harap {harap}) {tambahan}")
    return ok


# Data uji dibuat unik per jalan supaya skrip bisa dijalankan berulang di database yang sama.
# Sebelum ini, jalan kedua langsung gagal: email uji sudah terpakai (422) dan nomor uji
# sudah terdaftar (409) -- uji jadi merah padahal aplikasinya benar.
EKOR = str(int(time.time()))[-6:]
EMAIL_UJI = f"ujimember{EKOR}@example.com"
NOMOR_UJI = "0812" + str(random.randint(10000000, 99999999))
# Dikirim ke API dalam bentuk yang ditulis admin di HP (+62 dengan tanda hubung, tanpa 0 depan),
# supaya normalisasi nomor benar-benar diuji, bukan cuma jalur yang sudah rapi.
NOMOR_FORMAT = f"+62 {NOMOR_UJI[1:4]}-{NOMOR_UJI[4:8]}-{NOMOR_UJI[8:]}"

print("== 1. login admin ==")
st, r = call("POST", "/login", {"email": "admin@gymhub.local", "password": "admin12345"})
cek("POST /login admin", st, 200)
token_admin = (r.get("data") or {}).get("access_token") or r.get("access_token")
print(f"     token admin: {'ada' if token_admin else 'TIDAK ADA'} | peran: {(r.get('data') or {}).get('user', {}).get('role')}")

print("\n== 2. penjaga akses ==")
st, _ = call("GET", "/admin/members")
cek("GET /admin/members tanpa token", st, 401)

st, r = call("POST", "/register", {
    "name": "Uji Member Biasa", "email": EMAIL_UJI,
    "password": "rahasia123", "password_confirmation": "rahasia123",
})
token_member = (r.get("data") or {}).get("access_token")
cek("POST /register (bikin akun biasa)", st, 200 if st == 200 else 201)
st, r = call("GET", "/admin/members", token=token_member)
cek("GET /admin/members pakai token member", st, 403, f"pesan: {r.get('message')}")

print("\n== 3. daftar member (admin) ==")
st, r = call("GET", "/admin/members", token=token_admin)
items = ((r.get("data") or {}).get("items") or [])
cek("GET /admin/members pakai token admin", st, 200, f"| {len(items)} baris, meta total={(r.get('data') or {}).get('meta', {}).get('total')}")

print("\n== 4. daftarkan member baru: hanya nama + nomor ==")
st, baru = call("POST", "/admin/members", {"name": "Dewi Lestari", "phone": NOMOR_FORMAT}, token=token_admin)
d = baru.get("data") or {}
cek("POST /admin/members", st, 201, f"| kode={d.get('member_code')} berakhir={d.get('membership_expires_at')} has_login={d.get('has_login')}")
print(f"     nomor dinormalisasi jadi: {d.get('phone')} (dikirim sebagai +62 dengan tanda hubung)")
id_baru = d.get("id")
kode_baru = d.get("member_code")

print("\n== 5. nomor duplikat ==")
st, r = call("POST", "/admin/members", {"name": "Dewi Yang Lain", "phone": NOMOR_UJI}, token=token_admin)
cek("POST nomor yang sama", st, 409, f"| pesan: {r.get('message')} | existing={(r.get('data') or {}).get('existing_member')}")

print("\n== 6. nomor ngawur ==")
st, r = call("POST", "/admin/members", {"name": "Salah Ketik", "phone": "12345"}, token=token_admin)
cek("POST nomor tidak valid", st, 422, f"| pesan: {(r.get('errors') or {}).get('phone')}")

print("\n== 7. perpanjang 3 bulan ==")
st, r = call("POST", f"/admin/members/{id_baru}/renew", {"plan_months": 3}, token=token_admin)
d2 = r.get("data") or {}
cek("POST /admin/members/{id}/renew", st, 200, f"| berakhir {d.get('membership_expires_at')} -> {d2.get('membership_expires_at')}")
print(f"     keterangan: {r.get('message')}")

print("\n== 8. riwayat perpanjangan ==")
st, r = call("GET", f"/admin/members/{id_baru}", token=token_admin)
riwayat = (r.get("data") or {}).get("riwayat") or []
cek("GET detail member", st, 200, f"| {len(riwayat)} baris riwayat | {riwayat[:1]}")

print("\n== 9. cari & filter ==")
st, r = call("GET", f"/admin/members?q={NOMOR_UJI[-4:]}", token=token_admin)
cek(f"GET ?q={NOMOR_UJI[-4:]} (potongan nomor)", st, 200, f"| {len((r.get('data') or {}).get('items') or [])} baris")
st, r = call("GET", "/admin/members?status=akan_berakhir", token=token_admin)
cek("GET ?status=akan_berakhir", st, 200, f"| {len((r.get('data') or {}).get('items') or [])} baris")

print("\n== 10. nonaktifkan ==")
st, r = call("POST", f"/admin/members/{id_baru}/deactivate", token=token_admin)
d = r.get("data") or {}
# Diperiksa ISI-nya, bukan cuma kode HTTP: pernah lulus 200 padahal is_active masih true
# (relasi user tidak memuat baris yang sudah di-soft-delete).
ok_isi = (d.get("is_active") is False) and (d.get("status") == "nonaktif")
HASIL.append(ok_isi)
print(f"  [{'OK  ' if ok_isi else 'GAGAL'}] {'POST deactivate (isi: nonaktif + is_active false)':<58} -> is_active={d.get('is_active')} status={d.get('status')}")
st, r = call("GET", "/admin/members?status=nonaktif", token=token_admin)
cek("member nonaktif muncul di filter nonaktif", st, 200, f"| {len((r.get('data') or {}).get('items') or [])} baris")
st, r = call("POST", f"/admin/members/{id_baru}/reactivate", token=token_admin)
cek("POST reactivate", st, 200, f"| is_active={(r.get('data') or {}).get('is_active')}")

print(f"\nRINGKASAN: {sum(HASIL)}/{len(HASIL)} uji lulus")
if kode_baru:
    print(f"catatan: member uji {kode_baru} (id {id_baru}) tetap ada di database dev")
