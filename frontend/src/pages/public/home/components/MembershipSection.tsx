import { Check } from "lucide-react";
import { DisciplineBlock, Reveal } from "@/components/brand/DisciplineBlock";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDisciplineStore } from "@/store/useDisciplineStore";

// [angka nyata] — harga placeholder; konfirmasi pemilik sebelum dipublikasikan.
const PLANS = [
  {
    id: "harian",
    name: "Harian",
    price: "Rp 50.000",
    note: "per kedatangan",
    summary: "Untuk yang sedang mencoba atau mampir sesekali.",
    features: ["Akses satu hari ke tiga ruang", "Loker harian", "Kelas berkelompok bila kuota tersisa"],
    cta: "Datang hari ini",
  },
  {
    id: "bulanan",
    name: "Bulanan",
    price: "Rp 350.000",
    note: "per bulan",
    summary: "Pilihan paling banyak diambil member yang latihan 3–4 kali seminggu.",
    features: [
      "Akses tanpa batas jam operasional",
      "Semua kelas berkelompok, kuota didahulukan",
      "Catatan latihan & progres di akun",
      "Konsultasi program 1× per bulan",
    ],
    cta: "Mulai Latihanmu",
    featured: true,
  },
  {
    id: "tahunan",
    name: "Tahunan",
    price: "Rp 3.500.000",
    note: "per tahun · setara 10 bulan",
    summary: "Untuk yang sudah yakin akan latihan jangka panjang.",
    features: ["Semua fasilitas bulanan", "2 sesi PT di awal bergabung", "Prioritas kuota kelas ramai", "Beku keanggotaan 1× per tahun"],
    cta: "Ambil paket setahun",
  },
];

const WA = "https://wa.me/6281234567890?text=";

/** Blok 08 — Biaya. Tanpa kalkulator BMI; harga & fasilitas yang ditanyakan orang lewat WhatsApp. */
export default function MembershipSection() {
  const discipline = useDisciplineStore((s) => s.discipline);

  return (
    <DisciplineBlock
      id="membership"
      rhythm={2}

      title="Tiga cara untuk masuk"
      lead="Satu harga sudah termasuk akses iron, yoga, dan muaythai — tidak ada biaya tambahan untuk pindah ruang. Tanpa biaya pendaftaran tersembunyi."
    >
      <div className="grid grid-cols-1 gap-px border border-border bg-border lg:grid-cols-3">
        {PLANS.map((plan, index) => (
          <Reveal key={plan.id} delay={index * 60} className="h-full">
            <article
              className={cn(
                "flex h-full flex-col gap-6 p-7 lg:p-8",
                plan.featured ? "bg-card" : "bg-background"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{plan.name}</h3>
                {plan.featured && (
                  <span className="border border-primary px-2 py-0.5 text-[11px] font-bold uppercase tracking-widest text-primary-text">
                    Paling sering diambil
                  </span>
                )}
              </div>
              <div>
                <p className="font-extrabold text-4xl tracking-tight text-foreground">{plan.price}</p>
                <p className="mt-1 text-sm text-muted-foreground">{plan.note}</p>
              </div>
              <p className="text-sm font-light leading-relaxed text-muted-foreground">{plan.summary}</p>
              <ul className="space-y-3 border-t border-border pt-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm text-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className={cn(
                  "mt-auto h-12 rounded text-sm font-bold uppercase tracking-widest",
                  plan.featured
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                <a
                  href={`${WA}${encodeURIComponent(`Halo Bifrost, saya ingin mendaftar paket ${plan.name} (disiplin ${discipline}).`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {plan.cta}
                </a>
              </Button>
            </article>
          </Reveal>
        ))}
      </div>

      <div className="mt-10 grid gap-6 border border-border p-6 sm:grid-cols-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sudah termasuk</p>
          <p className="mt-2 text-sm text-foreground">Loker, ruang ganti, dan air minum isi ulang.</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Belum termasuk</p>
          <p className="mt-2 text-sm text-foreground">Sesi personal 1-on-1 dan sewa loker bulanan.</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Cara daftar</p>
          <p className="mt-2 text-sm text-foreground">Datang langsung atau tanya lewat WhatsApp; pembayaran di lokasi.</p>
        </div>
      </div>
    </DisciplineBlock>
  );
}
