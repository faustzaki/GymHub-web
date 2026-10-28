import { useState } from "react";
import { Link } from "react-router-dom";
import { useScrollNavbar } from "@/hooks/useScrollNavbar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logoImg from "@/assets/logo-gymhub.png";

/**
 * Urutan tautan mengikuti urutan seksi di DOM pada HomePage, supaya mengikuti menu
 * berarti berjalan turun melewati halaman.
 * `#alat` mencakup Fasilitas + seksi "Kenapa di sini" yang bertetangga (#kenapa).
 */
const NAV_LINKS = [
  { label: "Fasilitas", href: "#alat" },
  { label: "Latihan", href: "#ruang" },
  { label: "Jadwal", href: "#jadwal" },
  { label: "Coach", href: "#pt" },
  { label: "Biaya", href: "#membership" },
  { label: "Kontak", href: "#contact" },
] as const;

/**
 * Navbar publik.
 *
 * - Transparan di atas hero, solid + blur saat scroll (slot glass ke-2 dari 2).
 * - Selalu terlihat: posisinya menetap di atas halaman, tidak ikut menghilang saat scroll.
 * - Mobile: panel dropdown; fokus keyboard tetap terlihat di setiap target.
 */
export default function Navbar() {
  const { isScrolled } = useScrollNavbar(50);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav
      className={cn(
        "fixed inset-x-0 top-0 z-[100] transition-[background-color,box-shadow] duration-300 ease-in-out",
        isScrolled
          ? "bg-background/90 shadow-lg shadow-black/30 backdrop-blur-md"
          : isMobileMenuOpen
            ? "bg-background shadow-lg shadow-black/30 lg:bg-transparent lg:shadow-none"
            : "bg-transparent"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-nav items-center justify-between lg:h-nav-lg">
          <a href="#home" className="flex h-11 shrink-0 items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <img src={logoImg} alt="" className="h-8 w-auto object-contain lg:h-9" />
            <span className="text-xl font-extrabold tracking-tight text-foreground">
              Gym<span className="text-primary">Hub</span>
            </span>
          </a>

          <ul className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="group relative block px-4 py-3 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {link.label}
                  {/* Garis merah tumbuh dari tengah: penanda hover, durasi = tempo ruang. */}
                  <span className="absolute bottom-1 left-1/2 h-px w-0 -translate-x-1/2 bg-primary transition-[width] duration-300 ease-out group-hover:w-3/5" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <Button
              asChild
              className="hidden h-11 rounded bg-primary px-5 text-xs font-bold uppercase tracking-widest text-primary-foreground hover:bg-primary/90 sm:inline-flex"
            >
              <Link to="/login">Masuk Member</Link>
            </Button>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="relative flex size-11 items-center justify-center rounded hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
              aria-label={isMobileMenuOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="menu-publik"
            >
              <span className="flex h-4 w-5 flex-col justify-between" aria-hidden="true">
                <span className={cn("block h-0.5 w-full origin-center rounded-full bg-foreground transition-transform duration-300", isMobileMenuOpen && "translate-y-[7px] rotate-45")} />
                <span className={cn("block h-0.5 w-full rounded-full bg-foreground transition-opacity duration-300", isMobileMenuOpen && "opacity-0")} />
                <span className={cn("block h-0.5 w-full origin-center rounded-full bg-foreground transition-transform duration-300", isMobileMenuOpen && "-translate-y-[7px] -rotate-45")} />
              </span>
            </button>
          </div>
        </div>
      </div>

      <div
        id="menu-publik"
        className={cn(
          "overflow-hidden bg-background transition-[max-height,opacity] duration-300 ease-in-out lg:hidden",
          isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="space-y-1 border-t border-border px-4 pb-6 pt-2">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={closeMobileMenu}
              className="block min-h-11 rounded px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {link.label}
            </a>
          ))}
          <Button
            asChild
            className="mt-3 h-12 w-full rounded bg-primary text-xs font-bold uppercase tracking-widest text-primary-foreground hover:bg-primary/90"
          >
            <Link to="/login" onClick={closeMobileMenu}>
              Masuk Member
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
