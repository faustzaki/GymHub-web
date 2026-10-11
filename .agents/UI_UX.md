# 🎨 UI_UX.md — Design System & UI Guidelines

> **Purpose:** Dokumen ini mendefinisikan design system proyek. AI agent membaca file ini saat membuat atau memodifikasi komponen UI.

---

## 1. Design Principles

- **Consistency** — Gunakan token & komponen yang sama di seluruh aplikasi
- **Accessibility** — Semua elemen harus accessible (keyboard nav, screen reader, contrast)
- **Responsive** — Mobile-first approach, semua halaman harus responsive
- **Performance** — Minimize re-renders, lazy load assets, optimize images

---

## 2. Color Palette

[TODO: Definisikan color palette proyek. Contoh format:]

### Brand Colors

- **Primary:** [TODO: contoh: `#6366F1` — digunakan untuk button, link, accent]
- **Primary Hover:** [TODO: contoh: `#4F46E5`]
- **Secondary:** [TODO: contoh: `#8B5CF6` — secondary elements]
- **Accent:** [TODO: contoh: `#F59E0B` — highlights, badges]

### Neutral Colors

- **Background:** [TODO: contoh: `#FFFFFF` (light) / `#0F172A` (dark)]
- **Surface:** [TODO: contoh: `#F8FAFC` — card, modal background]
- **Border:** [TODO: contoh: `#E2E8F0`]
- **Text:** [TODO: contoh: `#1E293B`]
- **Text Muted:** [TODO: contoh: `#94A3B8`]

### Semantic Colors

- **Success:** [TODO: contoh: `#22C55E`]
- **Warning:** [TODO: contoh: `#F59E0B`]
- **Error:** [TODO: contoh: `#EF4444`]
- **Info:** [TODO: contoh: `#3B82F6`]

---

## 3. Typography

[TODO: Definisikan font yang digunakan.]

- **Heading Font:** [TODO: contoh: 'Inter', sans-serif — weight 600-700]
- **Body Font:** [TODO: contoh: 'Inter', sans-serif — weight 400]
- **Mono Font:** [TODO: contoh: 'JetBrains Mono' — untuk code blocks]

### Type Scale

| Level | Size | Line Height | Penggunaan |
|---|---|---|---|
| `h1` | [TODO: contoh: 2.25rem] | 1.2 | Page title |
| `h2` | [TODO: contoh: 1.875rem] | 1.3 | Section title |
| `h3` | [TODO: contoh: 1.5rem] | 1.4 | Sub-section |
| `body` | [TODO: contoh: 1rem] | 1.6 | Body text |
| `small` | [TODO: contoh: 0.875rem] | 1.5 | Caption, helper |

---

## 4. Spacing System

[TODO: Definisikan spacing scale. Contoh:]

- **xs:** [TODO: contoh: 4px — tight gaps]
- **sm:** [TODO: contoh: 8px — small gaps]
- **md:** [TODO: contoh: 16px — default padding]
- **lg:** [TODO: contoh: 24px — section padding]
- **xl:** [TODO: contoh: 32px — large gaps]
- **2xl:** [TODO: contoh: 48px — page sections]

---

## 5. Responsive Breakpoints

- **Mobile:** 0px+ (default)
- **Tablet:** [TODO: contoh: 768px+]
- **Desktop:** [TODO: contoh: 1024px+]
- **Wide:** [TODO: contoh: 1280px+]

---

## 6. Component Library

[TODO: Daftar komponen UI yang tersedia/dibutuhkan. Update status saat komponen selesai.]

| Component | Status | Variants |
|---|---|---|
| Button | [TODO: Done/WIP/Planned] | primary, secondary, outline, ghost, danger |
| Input | [TODO] | text, password, email, search |
| Select | [TODO] | single, multi, searchable |
| Modal/Dialog | [TODO] | default, confirmation, form |
| Toast | [TODO] | success, error, warning, info |
| Table | [TODO] | sortable, filterable, paginated |
| Card | [TODO] | default, clickable, with-image |
| Badge | [TODO] | status colors |
| Sidebar | [TODO] | collapsible, with icons |
| Navbar | [TODO] | sticky, responsive |

---

## 7. Animation & Transitions

[TODO: Definisikan standard animasi.]

- **Hover effects:** [TODO: contoh: 150ms ease-in-out]
- **Modal open/close:** [TODO: contoh: 200ms ease-out]
- **Page transitions:** [TODO: contoh: 300ms ease-in-out]
- **Loading skeleton:** [TODO: contoh: 1.5s linear pulse]

---

## 8. Accessibility (a11y) Checklist

- [ ] Semua interactive elements memiliki focus state yang visible
- [ ] Color contrast ratio minimum 4.5:1 (text) / 3:1 (large text)
- [ ] Semua images memiliki alt text
- [ ] Form inputs memiliki label yang associated
- [ ] Keyboard navigation berfungsi di semua halaman
- [ ] ARIA attributes digunakan dengan benar

---

## Related Documents

- [STACK.md](./STACK.md) — UI framework & library details
- [CODING_RULES.md](./CODING_RULES.md) — Component coding standards
- [FEATURES/](./FEATURES/) — Feature-specific UI requirements
