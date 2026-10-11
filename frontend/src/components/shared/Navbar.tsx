import { useState } from "react";
import { Link } from "react-router-dom";
import { useScrollNavbar } from "@/hooks/useScrollNavbar";
import { Button } from "@/components/ui/button";
import logoImg from "@/assets/Gemini_Generated_Image_kmomnfkmomnfkmom-removebg-preview.png";

/** Daftar menu navigasi utama */
const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
] as const;

/**
 * Komponen Navbar utama.
 *
 * Fitur:
 * - Transparan di atas halaman, solid saat scroll
 * - Menghilang saat scroll ke bawah, muncul saat scroll ke atas
 * - Responsive: hamburger menu untuk layar kecil (mobile)
 * - Animasi hover garis bawah putih pada menu item
 */
export default function Navbar() {
  const { isScrolled, isVisible } = useScrollNavbar(50);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav
      className={`
        fixed top-0 left-0 w-full z-[100]
        transition-all duration-300 ease-in-out
        ${isVisible ? "translate-y-0" : "-translate-y-full"}
        ${
          isScrolled
            ? "bg-[#121212]/95 backdrop-blur-md shadow-lg shadow-black/20"
            : isMobileMenuOpen
            ? "bg-[#121212] lg:bg-transparent shadow-lg lg:shadow-none shadow-black/20"
            : "bg-transparent"
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* ====== LOGO (Kiri) ====== */}
          <a href="#home" className="flex items-center gap-3 shrink-0">
            <img src={logoImg} alt="Gym Logo" className="h-12 w-auto object-contain" />
            <span className="text-white text-xl font-bold tracking-tight">
              Gym<span className="text-primary">Hub</span>
            </span>
          </a>

          {/* ====== MENU TENGAH (Desktop) ====== */}
          <ul className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="
                    relative px-4 py-2 text-sm font-normal text-white/80
                    transition-colors duration-200 hover:text-white
                    group
                  "
                >
                  {link.label}
                  {/* Garis bawah putih saat hover — animasi scale dari tengah */}
                  <span
                    className="
                      absolute bottom-0 left-1/2 -translate-x-1/2
                      h-[2px] w-0 bg-white rounded-full
                      transition-all duration-300 ease-out
                      group-hover:w-3/5
                    "
                  />
                </a>
              </li>
            ))}
          </ul>

          {/* ====== TOMBOL JOIN NOW + HAMBURGER (Kanan) ====== */}
          <div className="flex items-center gap-3">
            <Button
              asChild
              className="hidden sm:inline-flex bg-red-600 text-[#121212] font-semibold hover:bg-red-500 hover:shadow-lg hover:shadow-red-600/25 active:scale-95 transition-all duration-200 h-10 px-6 rounded-lg"
            >
              <Link to="/login">Join Now</Link>
            </Button>

            {/* Hamburger Button (Mobile) */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              {/* 
                Tiga garis hamburger yang ber-animasi menjadi "X" saat menu dibuka.
                Menggunakan transform CSS (rotate + translate) untuk transisi halus.
              */}
              <div className="w-5 h-4 flex flex-col justify-between">
                <span
                  className={`block h-[2px] w-full bg-white rounded-full transition-all duration-300 origin-center
                    ${isMobileMenuOpen ? "rotate-45 translate-y-[7px]" : ""}
                  `}
                />
                <span
                  className={`block h-[2px] w-full bg-white rounded-full transition-all duration-300
                    ${isMobileMenuOpen ? "opacity-0 scale-x-0" : ""}
                  `}
                />
                <span
                  className={`block h-[2px] w-full bg-white rounded-full transition-all duration-300 origin-center
                    ${isMobileMenuOpen ? "-rotate-45 -translate-y-[7px]" : ""}
                  `}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ====== MOBILE MENU DROPDOWN ====== */}
      <div
        className={`
          lg:hidden overflow-hidden
          transition-all duration-300 ease-in-out
          ${isMobileMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"}
          bg-[#121212] shadow-xl shadow-black/30
        `}
      >
        <div className="px-4 pt-2 pb-6 space-y-1 border-t border-white/10">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={closeMobileMenu}
              className="
                block px-4 py-3 rounded-lg text-sm font-normal text-white/80
                transition-colors duration-200
                hover:text-white hover:bg-white/5
              "
            >
              {link.label}
            </a>
          ))}

          {/* Tombol Join Now di mobile menu */}
          <Button
            asChild
            className="w-full mt-3 bg-red-600 text-[#121212] font-semibold hover:bg-red-500 active:scale-95 transition-all duration-200 h-auto py-3 rounded-lg"
          >
            <Link to="/login" onClick={closeMobileMenu}>
              Join Now
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
