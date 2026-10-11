import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowUpRight, Mail } from "lucide-react";
import logoImg from "@/assets/Gemini_Generated_Image_kmomnfkmomnfkmom-removebg-preview.png";

/**
 * Komponen SVG ikon brand sosial media.
 *
 * Kenapa dibuat manual?
 * lucide-react versi terbaru menghapus semua ikon brand (Instagram, X, YouTube)
 * karena ikon brand adalah trademark perusahaan masing-masing dan tidak cocok
 * dengan lisensi open-source ISC milik Lucide.
 *
 * Solusinya: membuat komponen SVG ringan sendiri.
 * Props "size" dan "className" diteruskan agar styling tetap fleksibel.
 */
const IconInstagram = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

const IconX = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const IconYoutube = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" />
  </svg>
);

/**
 * Data navigasi footer — dipisahkan dari UI agar mudah diubah/ditambah.
 */
const FOOTER_NAV = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
] as const;

/**
 * Data sosial media — setiap item punya ikon (Lucide), label, dan URL.
 */
const SOCIAL_LINKS = [
  { icon: IconInstagram, label: "Instagram", href: "https://instagram.com" },
  { icon: IconX, label: "X", href: "https://x.com" },
  { icon: IconYoutube, label: "YouTube", href: "https://youtube.com" },
] as const;

/**
 * Komponen Footer utama.
 *
 * Layout:
 * - Desktop: 2 kolom (brand kiri, navigasi + contact + sosmed kanan)
 * - Mobile: stack vertikal, center-aligned
 *
 * Fitur:
 * - Animasi hover pada link navigasi (geser ke kanan)
 * - Ikon sosmed dengan animasi scale + glow saat hover
 * - Separator dari shadcn/ui untuk pembatas copyright
 * - Tombol email menggunakan Button shadcn/ui
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#0A0A0A] text-white overflow-hidden">
      {/* 
        Elemen dekoratif: gradient blur merah halus di pojok kiri atas.
        Memberikan kesan "glow" yang premium tanpa mengganggu konten.
      */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* ====== KONTEN UTAMA ====== */}
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-16 sm:pt-20 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

          {/* ====== KOLOM KIRI: BRAND ====== */}
          <div className="space-y-6">
            {/* Logo — konsisten dengan Navbar */}
            <a href="#home" className="inline-flex items-center gap-3 group">
              <img src={logoImg} alt="Gym Logo" className="h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-110" />
              <span className="text-2xl font-bold tracking-tight">
                Gym<span className="text-red-600">Hub</span>
              </span>
            </a>

            {/* Deskripsi singkat tentang brand */}
            <p className="text-white/50 text-sm leading-relaxed max-w-sm">
              Tempat di mana transformasi dimulai. Kami menyediakan fasilitas
              terbaik, pelatih berpengalaman, dan komunitas yang mendukung
              perjalanan fitness Anda.
            </p>

            {/* Badge/detail kecil — menambah kesan profesional */}
            <div className="flex items-center gap-2 text-xs text-white/30">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
              Open 24/7
            </div>
          </div>

          {/* ====== KOLOM KANAN: NAV + CONTACT + SOSMED ====== */}
          <div className="space-y-10 lg:pl-8">

            {/* --- Navigasi --- */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/30 mb-4">
                Navigation
              </h3>
              <nav className="flex flex-col gap-1">
                {FOOTER_NAV.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="
                      group flex items-center justify-between
                      py-2.5 px-3 -mx-3 rounded-lg
                      text-sm text-white/70
                      transition-all duration-300
                      hover:text-white hover:bg-white/[0.03] hover:pl-5
                    "
                  >
                    {link.label}
                    {/* 
                      Ikon panah kanan atas: muncul saat hover.
                      Memberikan micro-interaction yang engaging.
                    */}
                    <ArrowUpRight
                      size={14}
                      className="opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
                    />
                  </a>
                ))}
              </nav>
            </div>

            {/* --- Contact --- */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/30 mb-4">
                Have a Questions?
              </h3>
              <p className="text-sm text-white/50 mb-4">
                Hubungi kami kapan saja melalui email. Tim kami siap membantu Anda.
              </p>
              {/* 
                Menggunakan shadcn Button dengan variant "outline".
                asChild memungkinkan kita render <a> di dalamnya
                agar bisa klik langsung ke email.
              */}
              <Button
                asChild
                variant="outline"
                className="
                  border-white/10 text-white/70 bg-transparent
                  hover:border-red-600/50 hover:text-white hover:bg-red-600/5
                  transition-all duration-300
                "
              >
                <a href="mailto:hello@gymhub.com">
                  <Mail size={14} />
                  hello@gymhub.com
                </a>
              </Button>
            </div>

            {/* --- Sosial Media --- */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/30 mb-4">
                Follow Us
              </h3>
              <div className="flex items-center gap-2">
                {SOCIAL_LINKS.map((social) => (
                  /* 
                    Menggunakan shadcn Button variant "ghost" + size "icon"
                    untuk ikon sosmed. Memberikan interaksi yang konsisten
                    dengan komponen Button lainnya di project.
                  */
                  <Button
                    key={social.label}
                    asChild
                    variant="ghost"
                    size="icon"
                    className="
                      w-10 h-10 rounded-lg
                      text-white/40 bg-white/[0.03] border border-white/[0.06]
                      hover:text-white hover:bg-red-600/10 hover:border-red-600/30
                      hover:shadow-[0_0_20px_rgba(220,38,38,0.1)]
                      transition-all duration-300
                    "
                  >
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                    >
                      <social.icon size={16} />
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ====== SEPARATOR + COPYRIGHT ====== */}
        <Separator className="my-8 bg-white/[0.06]" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/30">
          <p>&copy; {currentYear} GymHub. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="hover:text-white/60 transition-colors duration-300"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="hover:text-white/60 transition-colors duration-300"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
