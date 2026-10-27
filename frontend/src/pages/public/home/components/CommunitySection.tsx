import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/brand/DisciplineBlock";
import ChalkField from "@/components/brand/ChalkField";
import BridgeSpan from "@/components/brand/BridgeSpan";
import { Button } from "@/components/ui/button";
import { DISCIPLINES, useDisciplineStore } from "@/store/useDisciplineStore";

// [angka nyata] — frekuensi kegiatan mengikuti kalender komunitas; belum ada di backend.
const ACTIVITIES = [
  { title: "Open mat Sabtu", detail: "09.00–11.00, gratis untuk semua member. Bebas latihan bebas di matras dan bag." },
  { title: "Lari bareng, Minggu pagi", detail: "05.15 dari lobi, rute 5 km keliling blok. Semua kecepatan diterima." },
  { title: "Lomba internal per kuartal", detail: "Total beban, tahan plank, dan ronde pad work. Papan hasilnya ditempel di lobi." },
];

/** Blok 10 — Komunitas. Foto lebar dari belakang (tanpa wajah), satu baris ajakan. */
export default function CommunitySection() {
  const discipline = useDisciplineStore((s) => s.discipline);
  const meta = DISCIPLINES[discipline];

  return (
    <section id="komunitas" className="cv-auto relative overflow-hidden bg-background" style={{ ["--local-dur" as string]: `${meta.duration}ms` }}>
      <div className="relative">
        <img
          src="/assets/community.jpg"
          alt="Member Bifrost Gym berbaris menghadap dinding dari belakang sebelum sesi"
          loading="lazy"
          decoding="async"
          className="h-[52vh] min-h-80 w-full object-cover transition-[filter] duration-500"
          style={{ filter: meta.grade }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,var(--background)_0%,rgba(18,18,18,0.35)_45%,rgba(18,18,18,0.15)_100%)]" aria-hidden="true" />
        <ChalkField position="top" opacity={0.28} />
        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto w-full max-w-7xl px-6 pb-10 lg:px-8">
            <h2 className="max-w-2xl text-4xl font-extrabold uppercase leading-[1.02] tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Latihan sendiri,
              <br />
              <span className="italic font-light normal-case text-muted-foreground">{" "}pulang punya nama yang dikenal.</span>
            </h2>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-6 pb-16 pt-10 lg:px-8 lg:pb-24">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <ol className="divide-y divide-border border-y border-border">
              {ACTIVITIES.map((activity, index) => (
                <Reveal key={activity.title} delay={index * 60}>
                  <li className="grid grid-cols-1 gap-2 py-5 sm:grid-cols-[56px_1fr] sm:gap-6">
                    <span className="font-bold tabular-nums text-primary-text">{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <h3 className="text-lg font-extrabold uppercase tracking-tight text-foreground">{activity.title}</h3>
                      <p className="mt-1 text-sm font-light leading-relaxed text-muted-foreground">{activity.detail}</p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
          <div className="flex flex-col justify-center gap-5 lg:col-span-5 lg:pl-10">
            <p className="text-lg font-light leading-relaxed text-muted-foreground">
              Datang pertama kali tidak berarti berdiri sendirian di sudir. Ada yang menyapa di lobi, dan kelasnya sudah punya
              nama untuk kamu.
            </p>
            <Button
              asChild
              className="group h-12 w-fit rounded bg-primary px-7 text-sm font-bold uppercase tracking-widest text-primary-foreground hover:bg-primary/90"
            >
              <a href="#contact">
                Bergabung Sekarang
                <ArrowRight className="ml-2 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
              </a>
            </Button>
          </div>
        </div>
      </div>

      <BridgeSpan edge="bottom" className="text-primary" />
    </section>
  );
}
