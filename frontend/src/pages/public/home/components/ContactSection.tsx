import { useEffect, useState } from "react";
import { MapPin, Phone, Clock, Send, ArrowUpRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  IconFacebook,
  IconInstagram,
  IconTiktok,
  IconYoutube,
} from "@/components/brand/SocialIcons";
import { kirimPesan } from "@/lib/services/messages";
import {
  SETTING_KEYS,
  fetchPublicSettings,
  petaEmbed,
  petaLink,
  waNumber,
  type PublicSettings,
} from "@/lib/services/owner";

/**
 * Penutup: lokasi, jam buka, peta, dan kanal sosial.
 *
 * Semua isinya dari `GET /settings/public`. Yang belum diisi owner TIDAK dirender -- tidak ada
 * alamat karangan, tidak ada tautan sosial yang mati, tidak ada "jam buka: –".
 *
 * Keputusan josjis 2026-10-29:
 * - Ikon media sosial memakai glyph merek (digambar sendiri di `brand/SocialIcons`), bukan huruf.
 * - Peta WAJIB menunjuk alamat gym. `petaEmbed()` yang memutuskan: sematan resmi dipakai apa
 *   adanya, tautan peta biasa diturunkan jadi `maps?q=<alamat>&output=embed`.
 * - Form kontak benar-benar mengirim pesan (dulu `// dummy`: pesan menguap, pengunjung mengira
 *   sudah menghubungi gym).
 */
const SOSIAL = [
  { key: SETTING_KEYS.instagram, label: "Instagram", Icon: IconInstagram },
  { key: SETTING_KEYS.tiktok, label: "TikTok", Icon: IconTiktok },
  { key: SETTING_KEYS.facebook, label: "Facebook", Icon: IconFacebook },
  { key: SETTING_KEYS.youtube, label: "YouTube", Icon: IconYoutube },
] as const;

function useContactForm() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isValid =
    formData.name.trim().length > 1 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
    formData.message.trim().length > 4;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    setGalat(null);
    try {
      await kirimPesan({
        name: formData.name.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
      });
      setIsSubmitted(true);
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      const e = err as {
        response?: { data?: { message?: string; errors?: Record<string, string[]> } };
      };
      setGalat(
        Object.values(e.response?.data?.errors ?? {}).flat().join(" ") ||
          e.response?.data?.message ||
          "Pesan belum terkirim. Coba lagi, atau hubungi lewat WhatsApp."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return { formData, updateField, isValid, isSubmitting, isSubmitted, galat, handleSubmit };
}

/** Penutup: lokasi, jam buka, kanal kontak, dan form singkat. */
export default function ContactSection() {
  const { formData, updateField, isValid, isSubmitting, isSubmitted, galat, handleSubmit } =
    useContactForm();
  const [settings, setSettings] = useState<PublicSettings | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchPublicSettings()
      .then((hasil) => !cancelled && setSettings(hasil))
      .catch(() => {
        // Gagal memuat pengaturan bukan alasan menyembunyikan seluruh seksi: form tetap tampil.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const alamat = settings?.[SETTING_KEYS.address] ?? null;
  const jam = settings?.[SETTING_KEYS.hours] ?? null;
  const nomorWa = waNumber(settings?.[SETTING_KEYS.whatsapp] ?? null);
  // Peta SELALU mengarah ke alamat, bukan ke kode sematan mentah.
  const embed = petaEmbed(settings?.[SETTING_KEYS.maps_embed] ?? null, alamat);
  const tautanPeta = petaLink(alamat);

  // Baris kosong dibuang seluruhnya: alamat "–" lebih buruk daripada tidak ada baris alamat.
  const kontak = [
    alamat && {
      Icon: MapPin,
      label: "Lokasi",
      value: alamat,
      href: tautanPeta,
    },
    nomorWa && {
      Icon: Phone,
      label: "WhatsApp",
      value: settings?.[SETTING_KEYS.whatsapp] ?? "",
      href: `https://wa.me/${nomorWa}`,
    },
    jam && { Icon: Clock, label: "Jam operasional", value: jam, href: null },
  ].filter(Boolean) as {
    Icon: typeof MapPin;
    label: string;
    value: string;
    href: string | null;
  }[];

  const sosial = SOSIAL.filter((s) => {
    const isi = settings?.[s.key];
    return typeof isi === "string" && isi.trim() !== "";
  });

  return (
    <section
      id="contact"
      className="cv-auto relative overflow-hidden bg-background"
      style={{ paddingBlock: "var(--rhythm-3)", scrollMarginTop: "calc(-1 * var(--rhythm-3))" }}
    >
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <h2 className="text-4xl font-extrabold uppercase leading-[1.02] tracking-tight text-foreground md:text-5xl">
              Siap mulai.
              <br />
              <span className="italic font-light normal-case text-muted-foreground">{" "}Datang, atau tanya dulu.</span>
            </h2>
            <p className="mt-5 max-w-md text-base font-light leading-relaxed text-muted-foreground">
              Kunjungi gym langsung untuk lihat ruangannya, atau hubungi lewat salah satu kanal di
              bawah.
            </p>

            {kontak.length > 0 && (
              <dl className="mt-10 divide-y divide-border border-y border-border">
                {kontak.map((item) => {
                  const content = (
                    <div className="flex min-h-14 items-center gap-4 py-3">
                      <item.Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
                      <dt className="w-32 shrink-0 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        {item.label}
                      </dt>
                      <dd className="flex min-w-0 flex-1 items-center gap-2 text-sm text-foreground group-hover:underline group-hover:underline-offset-4">
                        {item.value}
                        {item.href && (
                          <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                        )}
                      </dd>
                    </div>
                  );

                  return item.href ? (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {content}
                    </a>
                  ) : (
                    <div key={item.label}>{content}</div>
                  );
                })}
              </dl>
            )}

            {sosial.length > 0 && (
              <div className="mt-8">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Ikuti
                </p>
                {/* Ikon saja, dengan nama di `aria-label` + tooltip judul: empat kotak berikon
                    lebih ringkas daripada empat tombol bertulisan yang memakan satu baris penuh. */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {sosial.map(({ key, label, Icon }) => (
                    <a
                      key={key}
                      href={settings?.[key] ?? undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      title={label}
                      className="flex size-11 items-center justify-center border border-border text-foreground transition-colors hover:border-primary/60 hover:bg-primary/10 hover:text-primary-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Icon className="size-[18px]" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {embed && (
              <div className="mt-8 overflow-hidden border border-border">
                {/* loading="lazy": peta tidak boleh menahan muat pertama landing. */}
                <iframe
                  src={embed}
                  title="Peta lokasi gym"
                  className="h-64 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
                {tautanPeta && (
                  <a
                    href={tautanPeta}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-2 border-t border-border px-4 py-3 text-sm text-foreground transition-colors hover:bg-accent"
                  >
                    Buka di Google Maps
                    <ArrowUpRight className="size-4 text-muted-foreground" aria-hidden="true" />
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-7">
            <div className="border border-border bg-card p-6 md:p-8">
              {isSubmitted && (
                <p
                  role="status"
                  className="mb-6 border border-primary/60 bg-primary/10 px-4 py-3 text-sm text-foreground animate-in fade-in duration-200"
                >
                  Pesanmu terkirim. Kami akan membalas ke email yang kamu tulis.
                </p>
              )}

              {galat && (
                <p
                  role="alert"
                  className="mb-6 border border-border bg-background px-4 py-3 text-sm text-foreground"
                >
                  {galat}
                </p>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="nama" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Nama lengkap
                  </label>
                  <Input
                    id="nama"
                    type="text"
                    placeholder="Nama kamu"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className="h-11 rounded-md bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="h-11 rounded-md bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="pesan" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Pesan
                  </label>
                  <Textarea
                    id="pesan"
                    placeholder="Mau tanya jadwal, biaya, atau sesi percobaan?"
                    value={formData.message}
                    onChange={(e) => updateField("message", e.target.value)}
                    className="min-h-[120px] resize-none rounded-md bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={!isValid || isSubmitting}
                  className="group h-12 w-full rounded bg-primary text-sm font-bold uppercase tracking-widest text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" aria-hidden="true" />
                      Mengirim
                    </>
                  ) : (
                    <>
                      Kirim Pesan
                      <Send aria-hidden="true" />
                    </>
                  )}
                </Button>

                {nomorWa && (
                  <p className="text-center text-xs text-muted-foreground">
                    Butuh jawaban cepat? WhatsApp lebih dulu dibalas di jam operasional.
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
