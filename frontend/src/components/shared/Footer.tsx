import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowUpRight, Mail } from "lucide-react";
import logoImg from "@/assets/logo-gymhub.png";

/**
 * Ikon brand digambar sendiri (lucide sudah menghapus ikon merek):
 * satu warna `currentColor`, ukuran 16px, dekoratif.
 */
const IconInstagram = ({ className = "" }: { className?: string }) => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

const IconX = ({ className = "" }: { className?: string }) => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// Urutan sama dengan Navbar dan urutan seksi di DOM halaman beranda.
const FOOTER_NAV = [
  { label: "Fasilitas", href: "#alat" },
  { label: "Latihan", href: "#ruang" },
  { label: "Jadwal", href: "#jadwal" },
  { label: "Coach", href: "#pt" },
  { label: "Biaya", href: "#membership" },
  { label: "Kontak", href: "#contact" },
] as const;

// dummy — tautan sosial contoh sampai akun resmi tersedia.
const SOCIAL_LINKS = [
  { icon: IconInstagram, label: "Instagram", href: "https://instagram.com" },
  { icon: IconX, label: "X", href: "https://x.com" },
] as const;

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-24 sm:px-8 sm:pb-8 lg:px-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="space-y-6 lg:col-span-5">
            <a href="#home" className="inline-flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <img src={logoImg} alt="" className="h-9 w-auto object-contain" />
              <span className="text-2xl font-extrabold tracking-tight">
                Gym<span className="text-primary">Hub</span>
              </span>
            </a>
            <p className="max-w-sm text-sm font-light leading-relaxed text-muted-foreground">
              Satu atap, tiga ruang: angkat beban, yoga, dan muaythai. Jadwal, progres, dan materi latihan member
              tercatat di satu sistem.
            </p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Buka setiap hari 05.00–23.00 · Jakarta Selatan
            </p>
          </div>

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:col-span-7">
            <div>
              <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Navigasi</h2>
              <nav className="flex flex-col">
                {FOOTER_NAV.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="group flex min-h-11 items-center justify-between rounded px-2 text-sm text-muted-foreground transition-colors hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {link.label}
                    <ArrowUpRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                  </a>
                ))}
              </nav>
            </div>

            <div>
              <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Ada pertanyaan?</h2>
              <p className="mb-4 text-sm font-light leading-relaxed text-muted-foreground">
                Tulis ke email kami; dibalas pada jam kerja.
              </p>
              <Button
                asChild
                variant="outline"
                className="h-11 rounded border-border bg-transparent text-foreground hover:bg-card hover:text-foreground"
              >
                <a href="mailto:hello@bifrostgym.id">
                  <Mail aria-hidden="true" />
                  hello@bifrostgym.id
                </a>
              </Button>

              <div className="mt-6 flex items-center gap-2">
                {SOCIAL_LINKS.map((social) => (
                  <Button
                    key={social.label}
                    asChild
                    variant="ghost"
                    size="icon"
                    className="size-11 rounded border border-border text-muted-foreground hover:border-primary/50 hover:bg-card hover:text-foreground"
                  >
                    <a href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label}>
                      <social.icon />
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <p className="text-xs text-muted-foreground">&copy; {currentYear} GymHub. Seluruh hak cipta dilindungi.</p>
      </div>
    </footer>
  );
}
