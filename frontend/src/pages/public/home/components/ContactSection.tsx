import { useState } from "react";
import { MapPin, Phone, Clock, Mail, Send, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// --- DATA INFO KONTAK ---
// Dipisahkan dari UI agar mudah diubah tanpa menyentuh komponen
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
    label: "Jam Operasional",
    value: "Senin – Minggu, 06:00 – 23:00",
    href: null,
  },
  {
    icon: Mail,
    label: "Email",
    value: "hello@gymhub.com",
    href: "mailto:hello@gymhub.com",
  },
] as const;

/**
 * Custom hook untuk mengelola state form kontak.
 *
 * Memisahkan logic dari UI agar komponen tetap bersih.
 * Nanti saat sudah ada backend Laravel, tinggal tambahkan
 * fetch/axios POST ke endpoint API di dalam fungsi handleSubmit.
 */
function useContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Validasi sederhana: semua field harus terisi dan email valid
  const isValid =
    formData.name.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
    formData.message.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);

    // Simulasi pengiriman — nanti diganti dengan API call ke Laravel
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({ name: "", email: "", message: "" });

    // Reset notifikasi sukses setelah 5 detik
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  return {
    formData,
    updateField,
    isValid,
    isSubmitting,
    isSubmitted,
    handleSubmit,
  };
}

/**
 * Section Contact / CTA — section penutup sebelum Footer.
 *
 * Layout:
 * - Desktop: 2 kolom (info kiri, form kanan)
 * - Mobile: stack vertikal
 *
 * Desain:
 * - Background gradient gelap untuk transisi mulus ke Footer
 * - Form dengan glassmorphism ringan
 * - Ikon merah sebagai aksen visual pada info kontak
 * - Micro-animations pada hover untuk setiap item
 */
export default function ContactSection() {
  const {
    formData,
    updateField,
    isValid,
    isSubmitting,
    isSubmitted,
    handleSubmit,
  } = useContactForm();

  return (
    <section
      id="contact"
      className="relative w-full py-24 bg-gradient-to-b from-[#0A0A0A] to-black text-white overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute top-1/3 right-0 w-80 h-80 bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-red-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* HEADER */}
        <div className="flex flex-col items-center text-center space-y-4 mb-16">
          <Badge
            variant="outline"
            className="text-red-500 border-red-500/30 bg-red-500/10 uppercase tracking-widest px-4 py-1"
          >
            Hubungi Kami
          </Badge>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            SIAP <span className="text-red-600">MEMULAI?</span>
          </h2>
          <p className="text-gray-400 max-w-xl text-sm md:text-base leading-relaxed">
            Punya pertanyaan atau ingin langsung bergabung? Hubungi kami atau
            isi form di bawah. Tim kami akan merespons dalam 24 jam.
          </p>
        </div>

        {/* CONTENT: 2 KOLOM */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* ====== KOLOM KIRI: INFO KONTAK ====== */}
          <div className="space-y-8">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Info Kontak</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Kunjungi gym kami atau hubungi melalui salah satu channel di
                bawah ini.
              </p>
            </div>

            {/* List item kontak */}
            <div className="space-y-4">
              {CONTACT_INFO.map((item) => {
                const content = (
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-red-600/30 hover:bg-white/[0.04] transition-all duration-300 group">
                    {/* Ikon dengan background lingkaran */}
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-red-600/10 flex items-center justify-center group-hover:bg-red-600/20 transition-colors duration-300">
                      <item.icon className="w-4 h-4 text-red-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                        {item.label}
                      </p>
                      <p className="text-sm text-white/80 group-hover:text-white transition-colors">
                        {item.value}
                      </p>
                    </div>
                    {/* Ikon panah muncul saat hover jika item bisa diklik */}
                    {item.href && (
                      <ArrowUpRight className="shrink-0 w-4 h-4 text-gray-600 opacity-0 group-hover:opacity-100 group-hover:text-red-500 transition-all duration-300 ml-auto mt-1" />
                    )}
                  </div>
                );

                // Jika ada href, bungkus dengan <a>; jika tidak, render div biasa
                return item.href ? (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      item.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="block"
                  >
                    {content}
                  </a>
                ) : (
                  <div key={item.label}>{content}</div>
                );
              })}
            </div>

            {/* Mini map placeholder — bisa diganti Google Maps embed nanti */}
            <div className="relative rounded-xl overflow-hidden border border-white/5 h-40 bg-white/[0.02]">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <MapPin className="w-6 h-6 text-red-500/50 mx-auto" />
                  <p className="text-xs text-gray-600">
                    Google Maps akan ditampilkan di sini
                  </p>
                </div>
              </div>
              {/* Gradient overlay atas & bawah untuk kesan premium */}
              <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-[#0A0A0A] to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
            </div>
          </div>

          {/* ====== KOLOM KANAN: FORM KONTAK ====== */}
          <Card className="bg-white/[0.02] border-white/10 backdrop-blur-sm shadow-2xl">
            <CardContent className="p-6 md:p-8">
              {/* Notifikasi sukses setelah submit */}
              {isSubmitted && (
                <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-sm text-green-400 text-center font-medium">
                    ✓ Pesan berhasil dikirim! Kami akan segera menghubungi
                    kamu.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Field Nama */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Nama Lengkap
                  </label>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className="bg-black/50 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-red-600 h-11"
                    required
                  />
                </div>

                {/* Field Email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="bg-black/50 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-red-600 h-11"
                    required
                  />
                </div>

                {/* Field Pesan */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Pesan
                  </label>
                  <Textarea
                    placeholder="Tulis pertanyaan atau pesanmu di sini..."
                    value={formData.message}
                    onChange={(e) => updateField("message", e.target.value)}
                    className="bg-black/50 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-red-600 min-h-[120px] resize-none"
                    required
                  />
                </div>

                {/* Tombol Submit */}
                <Button
                  type="submit"
                  disabled={!isValid || isSubmitting}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed group"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      {/* Spinner loading sederhana */}
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Mengirim...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Kirim Pesan
                      <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform duration-300" />
                    </span>
                  )}
                </Button>

                <p className="text-xs text-gray-600 text-center">
                  Kami akan merespons dalam waktu 1×24 jam kerja.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
