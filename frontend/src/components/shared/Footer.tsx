import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowUpRight, Mail, Phone } from "lucide-react";
import logoImg from "@/assets/logo-gymhub.png";
import {
  IconFacebook,
  IconInstagram,
  IconTiktok,
  IconYoutube,
} from "@/components/brand/SocialIcons";
import {
  SETTING_KEYS,
  fetchPublicSettings,
  petaLink,
  waNumber,
  type PublicSettings,
} from "@/lib/services/owner";

// Urutan sama dengan Navbar dan urutan seksi di DOM halaman beranda.
const FOOTER_NAV = [
  { label: "Fasilitas", href: "#alat" },
  { label: "Latihan", href: "#ruang" },
  { label: "Jadwal", href: "#jadwal" },
  { label: "Coach", href: "#pt" },
  { label: "Biaya", href: "#membership" },
  { label: "Kontak", href: "#contact" },
] as const;

/**
 * Ikon sosial footer.
 *
 * Keputusan josjis 2026-10-29: "media sosial bisa dinamis juga di footer". Dulu tautannya ditanam
 * di kode (`https://instagram.com`, `https://x.com`) -- dua tautan contoh yang selalu tampil walau
 * gym tidak punya akunnya. Sekarang isinya dari `GET /settings/public`, sama seperti seksi kontak;
 * yang kosong tidak dirender.
 */
const SOSIAL = [
  { key: SETTING_KEYS.instagram, label: "Instagram", Icon: IconInstagram },
  { key: SETTING_KEYS.tiktok, label: "TikTok", Icon: IconTiktok },
  { key: SETTING_KEYS.facebook, label: "Facebook", Icon: IconFacebook },
  { key: SETTING_KEYS.youtube, label: "YouTube", Icon: IconYoutube },
] as const;

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = useState<PublicSettings | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchPublicSettings()
      .then((hasil) => !cancelled && setSettings(hasil))
      .catch(() => {
        // Footer tetap tampil tanpa data: navigasi dan hak cipta tidak bergantung pada settings.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const alamat = settings?.[SETTING_KEYS.address] ?? null;
  const jam = settings?.[SETTING_KEYS.hours] ?? null;
  const nomorWa = waNumber(settings?.[SETTING_KEYS.whatsapp] ?? null);
  const tautanPeta = petaLink(alamat);

  // Yang kosong dibuang seluruhnya -- tidak ada baris "· " menggantung di footer.
  const jejak = [
    jam && { label: jam, href: null as string | null },
    alamat && { label: alamat, href: tautanPeta },
  ].filter(Boolean) as { label: string; href: string | null }[];

  const sosial = SOSIAL.filter((s) => {
    const isi = settings?.[s.key];
    return typeof isi === "string" && isi.trim() !== "";
  });

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
              Satu pintu masuk, satu sistem: keanggotaan, perpanjangan, dan uang masuk tercatat di
              tempat yang sama.
            </p>
            {jejak.length > 0 && (
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                {jejak.map((j, i) => (
                  <span key={j.label}>
                    {i > 0 && " · "}
                    {j.href ? (
                      <a
                        href={j.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline-offset-4 hover:underline"
                      >
                        {j.label}
                      </a>
                    ) : (
                      j.label
                    )}
                  </span>
                ))}
              </p>
            )}
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
              <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Ada pertanyaan?
              </h2>
              <p className="mb-4 text-sm font-light leading-relaxed text-muted-foreground">
                Kirim lewat form di halaman ini, atau WhatsApp di jam operasional.
              </p>

              {nomorWa && (
                <Button
                  asChild
                  variant="outline"
                  className="mb-2 h-11 rounded border-border bg-transparent text-foreground hover:bg-card hover:text-foreground"
                >
                  <a href={`https://wa.me/${nomorWa}`} target="_blank" rel="noopener noreferrer">
                    <Phone aria-hidden="true" />
                    WhatsApp
                  </a>
                </Button>
              )}

              <Button
                asChild
                variant="outline"
                className="h-11 rounded border-border bg-transparent text-foreground hover:bg-card hover:text-foreground"
              >
                <a href="#contact">
                  <Mail aria-hidden="true" />
                  Kirim pesan
                </a>
              </Button>

              {sosial.length > 0 && (
                <div className="mt-6 flex items-center gap-2">
                  {sosial.map(({ key, label, Icon }) => (
                    <Button
                      key={key}
                      asChild
                      variant="ghost"
                      size="icon"
                      className="size-11 rounded border border-border text-muted-foreground hover:border-primary/50 hover:bg-card hover:text-foreground"
                    >
                      <a
                        href={settings?.[key] ?? undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        title={label}
                      >
                        <Icon />
                      </a>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <p className="text-xs text-muted-foreground">&copy; {currentYear} GymHub. Seluruh hak cipta dilindungi.</p>
      </div>
    </footer>
  );
}
