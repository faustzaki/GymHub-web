import { useState } from "react";
import { MapPin, Phone, Clock, Mail, Send, ArrowUpRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// dummy — alamat & nomor kontak contoh; ganti dengan data resmi sebelum publikasi.
const CONTACT_INFO = [
  {
    icon: MapPin,
    label: "Lokasi",
    value: "Jl. Fitness No. 88, Jakarta Selatan",
    href: "https://maps.google.com",
  },
  {
    icon: Phone,
    label: "Telepon",
    value: "+62 812 3456 7890",
    href: "tel:+6281234567890",
  },
  {
    icon: Clock,
    label: "Jam operasional",
    value: "Setiap hari, 05.00 – 23.00",
    href: null,
  },
  {
    icon: Mail,
    label: "Email",
    value: "hello@bifrostgym.id",
    href: "mailto:hello@bifrostgym.id",
  },
] as const;

function useContactForm() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isValid =
    formData.name.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
    formData.message.trim().length > 0;

  // dummy — belum ada endpoint kontak; perilaku & waktu kirim disimulasikan.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({ name: "", email: "", message: "" });
  };

  return { formData, updateField, isValid, isSubmitting, isSubmitted, handleSubmit };
}

/** Penutup: lokasi, jam buka, kanal kontak, dan form singkat. */
export default function ContactSection() {
  const { formData, updateField, isValid, isSubmitting, isSubmitted, handleSubmit } = useContactForm();

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
              Kunjungi gym langsung untuk lihat ruangannya, atau kirim pertanyaan lewat salah satu kanal di bawah. Pernah
              dibalas dalam 24 jam kerja.
            </p>

            <dl className="mt-10 divide-y divide-border border-y border-border">
              {CONTACT_INFO.map((item) => {
                const content = (
                  <div className="flex min-h-14 items-center gap-4 py-3">
                    <item.icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
                    <dt className="w-32 shrink-0 text-xs font-bold uppercase tracking-widest text-muted-foreground">{item.label}</dt>
                    <dd className="flex min-w-0 flex-1 items-center gap-2 text-sm text-foreground group-hover:underline group-hover:underline-offset-4">
                      {item.value}
                      {item.href && <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />}
                    </dd>
                  </div>
                );

                return item.href ? (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {content}
                  </a>
                ) : (
                  <div key={item.label}>{content}</div>
                );
              })}
            </dl>
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

                <p className="text-center text-xs text-muted-foreground">
                  Butuh jawaban cepat? WhatsApp lebih dulu dibalas di jam operasional.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
