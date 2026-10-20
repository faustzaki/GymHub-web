# AGENTS.md — Bifrost Gym

Entry file untuk semua AI coding agent yang bekerja di repo ini.

**Proyek**: Bifrost Gym — platform manajemen gym digital-first (jadwal, progres, materi, 3-tier role: Member / Coach / Admin).

Aturan berikut tersebar di `.agents/rules/`. Baca file yang relevan sebelum mulai bekerja:

| File | Trigger | Deskripsi singkat |
|------|---------|-------------------|
| `.agents/rules/role.md` | always_on | Persona agent: Senior Full-Stack Dev + UX |
| `.agents/rules/tech-stack.md` | always_on | React/Vite/Tailwind/shadcn + Laravel Sanctum + MySQL |
| `.agents/rules/system-context.md` | always_on | Laragon local env, Laravel terbaru |
| `.agents/rules/project-context.md` | always_on | Fitur utama, status per modul |
| `.agents/rules/dashboard-structure.md` | always_on | 3-tier role: Member / Coach / Admin |
| `.agents/rules/style.md` | always_on | Visual: merah-hitam-putih, Plus Jakarta Sans |
| `.agents/rules/rules.md` | always_on | Aturan komponen, Tailwind, shadcn, fallback |
| `.agents/rules/general-instructions.md` | always_on | Bahasa Indonesia, klarifikasi dulu |
| `.agents/rules/pendekatan.md` | always_on | Diskusi dulu, proaktif, best practice |
| `.agents/rules/lucide-icons.md` | always_on | Larangan icon brand, pakai SVG manual |
| `DESIGN.md` | always_on | Design direction: brand Bifrost Gym |
| `docs/api-contract.md` | kontekstual | Skeleton endpoint REST + konvensi response |
| `docs/db-schema.md` | kontekstual | Skema DB lengkap + diagram |
| `docs/workflow.md` | kontekstual | Workflow dev, setup lokal, konvensi kode |

## Catatan Kritis

- Jika memodifikasi kode frontend, selalu rujuk `DESIGN.md`.
- Jika memodifikasi backend, rujuk `docs/api-contract.md` dan `docs/db-schema.md`.
- Jangan pernah hardcode nama "GymPro" atau "GymHub"; nama brand resmi adalah **Bifrost Gym**.

<!-- antislop:start -->
## antislop
For UI, copy, people, mobile layout, or code comments work, read `antislop.md` (core) and then the skill for the task:
- UI / visual: `skills/antislop-ui/SKILL.md`
- Copy & text: `skills/antislop-copywriting/SKILL.md`
- People: `skills/antislop-human/SKILL.md`
- Mobile / responsive: `skills/antislop-layoutmobile/SKILL.md`
- Code comments: `skills/antislop-code/SKILL.md`
Before starting, follow the core's "Two Usage Modes" section in strict order: explicit session instruction first, then global preference, then ask.
<!-- antislop:end -->
