# 🖼️ GALLERY.md — Gallery/Media Feature

> **Purpose:** Spesifikasi fitur Gallery/Media Management.

---

## 1. Overview

- **Status:** [TODO: pilih: Planned / In Progress / Done]
- **Priority:** [TODO: pilih: High / Medium / Low]
- **Storage:** [TODO: contoh: Local disk / S3 / Cloudinary]
- **Max File Size:** [TODO: contoh: 5MB]
- **Allowed Formats:** [TODO: contoh: jpg, png, webp, mp4]

---

## 2. User Stories

- [ ] Sebagai **user**, saya dapat **melihat galeri** foto/video
- [ ] Sebagai **admin**, saya dapat **upload** media baru
- [ ] Sebagai **admin**, saya dapat **menghapus** media
- [ ] Sebagai **admin**, saya dapat **mengatur urutan/kategori** media

---

## 3. Acceptance Criteria

- [ ] Image di-resize/optimize saat upload
- [ ] Thumbnail auto-generated
- [ ] Lazy loading untuk performa
- [ ] Lightbox/modal view untuk preview

---

## 4. API Endpoints

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| `GET` | `/gallery` | ❌ | Public |
| `POST` | `/gallery` | ✅ | Admin |
| `DELETE` | `/gallery/{id}` | ✅ | Admin |
| `PUT` | `/gallery/{id}` | ✅ | Admin |

---

## 5. Database Tables

- `galleries` / `media` — Data media files
- [TODO: tambahkan tabel terkait]

---

## Related Documents

- [UI_UX.md](../UI_UX.md) — Design guidelines
- [API_CONTRACT.md](../API_CONTRACT.md) — Full API spec
