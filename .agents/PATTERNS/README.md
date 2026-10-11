# PATTERNS/ — Implementation Patterns

> **Purpose:** Folder ini menyimpan *blueprint* implementasi yang harus diikuti AI agent saat menulis kode. Setiap pattern mendefinisikan **bagaimana** kode harus terstruktur — bukan hanya **aturan** naming/style.

---

## How to Use

1. Copy `_TEMPLATE.md` → rename jadi `{PATTERN_NAME}_PATTERN.md`
2. Isi dengan contoh implementasi dari proyek Anda
3. AI agent akan mengikuti pattern ini saat membuat kode baru

## Perbedaan dengan CODING_RULES.md

| CODING_RULES.md | PATTERNS/ |
|---|---|
| *Apa* yang harus dilakukan | *Bagaimana* melakukannya |
| "Gunakan camelCase" | "Begini struktur Service class" |
| Rules & conventions | Blueprint & examples |

---

## Index

<!-- TODO: Update index ini setiap kali pattern baru ditambahkan -->

| Pattern | Applies To | Deskripsi |
|---|---|---|
| — | — | Belum ada pattern yang tercatat |

> **Instruksi:** Setiap kali menambah file pattern baru, tambahkan juga entry di tabel index di atas.

---

## Suggested Patterns

Berikut pattern yang umumnya dibutuhkan (buat sesuai kebutuhan):

| Pattern | File | Kapan Dibutuhkan |
|---|---|---|
| Service Layer | `SERVICE_PATTERN.md` | Saat ada business logic |
| Repository | `REPOSITORY_PATTERN.md` | Saat perlu abstraksi data access |
| API Response | `API_RESPONSE_PATTERN.md` | Saat membuat API endpoint |
| Form Validation | `FORM_VALIDATION_PATTERN.md` | Saat membuat form |
| Component | `COMPONENT_PATTERN.md` | Saat membuat UI component |
| Error Handling | `ERROR_HANDLING_PATTERN.md` | Saat handle errors |
| Authentication | `AUTH_PATTERN.md` | Saat implementasi auth flow |

---

## Related Documents

- [_TEMPLATE.md](./_TEMPLATE.md) — Template untuk pattern baru
- [CODING_RULES.md](../CODING_RULES.md) — Code rules & conventions
- [ARCHITECTURE.md](../ARCHITECTURE.md) — System architecture
- [DECISIONS/](../DECISIONS/) — Why decisions were made
