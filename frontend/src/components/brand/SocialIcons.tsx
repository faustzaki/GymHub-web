/**
 * Ikon merek sosial, digambar sendiri.
 *
 * lucide-react 1.8 sudah menghapus ikon merek (`Instagram`, `Facebook`, `Youtube` tidak ada di
 * `.d.ts`). Menambah paket ikon merek untuk empat glyph tidak sepadan, jadi digambar di sini:
 * satu warna `currentColor`, ukuran mengikuti `size` kelas induk.
 *
 * Dipakai DUA tempat dengan ukuran berbeda -- footer landing (16px) dan seksi kontak (18px) --
 * karena josjis minta keduanya memakai ikon, bukan huruf.
 */
type Props = { className?: string };

const dasar = (className?: string) => ({
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  className,
  "aria-hidden": true as const,
});

export const IconInstagram = ({ className = "" }: Props) => (
  <svg {...dasar(className)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

export const IconTiktok = ({ className = "" }: Props) => (
  <svg {...dasar(className)} fill="currentColor">
    <path d="M16.6 2h-3v13.2a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.6a5.7 5.7 0 0 0-.8-.1 5.7 5.7 0 1 0 5.7 5.7V7.9a6.6 6.6 0 0 0 3.9 1.3V6.1a3.8 3.8 0 0 1-3.9-3.8V2Z" />
  </svg>
);

export const IconFacebook = ({ className = "" }: Props) => (
  <svg {...dasar(className)} fill="currentColor">
    <path d="M14.5 21v-8h2.7l.4-3.1h-3.1V7.8c0-.9.3-1.5 1.6-1.5h1.6V3.5A22 22 0 0 0 15.4 3c-2.4 0-4 1.5-4 4.2v2.7H8.7V13h2.7v8h3.1Z" />
  </svg>
);

export const IconYoutube = ({ className = "" }: Props) => (
  <svg {...dasar(className)} fill="currentColor">
    <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4a2.5 2.5 0 0 0-1.8 1.8A26 26 0 0 0 2 12c0 1.7.1 3.4.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.3-1.4.4-3.1.4-4.8s-.1-3.4-.4-4.8ZM10 15.2V8.8l5.2 3.2-5.2 3.2Z" />
  </svg>
);
