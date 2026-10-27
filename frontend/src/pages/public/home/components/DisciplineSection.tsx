import { DisciplineBlock, PhotoFrame, Reveal } from "@/components/brand/DisciplineBlock";
import { LinePattern } from "@/components/brand/LinePattern";
import { DISCIPLINES, DISCIPLINE_ORDER, useDisciplineStore, type Discipline } from "@/store/useDisciplineStore";
import { cn } from "@/lib/utils";

type Panel = {
  id: Discipline;
  photo: { src: string; alt: string };
  schedule: { time: string; name: string; coach: string }[];
};

// [angka nyata] — isi jadwal mengikuti jadwal kelas yang dikelola admin; sesuaikan
// saat endpoint jadwal publik tersedia.
const PANELS: Panel[] = [
  {
    id: "iron",
    photo: { src: "/assets/discipline-iron.jpg", alt: "Barbell berisi plat di lantai ruang angkat beban" },
    schedule: [
      { time: "05.30", name: "Barbell Dasar", coach: "Rangga" },
      { time: "18.30", name: "Deadlift & Press", coach: "Rangga" },
      { time: "20.00", name: "Open Gym (coach standby)", coach: "—" },
    ],
  },
  {
    id: "yoga",
    photo: { src: "/assets/discipline-yoga.jpg", alt: "Matras dan peti plyo di studio yoga" },
    schedule: [
      { time: "06.00", name: "Vinyasa Pagi", coach: "Nadia" },
      { time: "09.00", name: "Yoga Pemula", coach: "Nadia" },
      { time: "19.00", name: "Restoratif & Napas", coach: "Sari" },
    ],
  },
  {
    id: "muaythai",
    photo: { src: "/assets/discipline-muaythai.jpg", alt: "Deretan heavy bag di ruang muaythai" },
    schedule: [
      { time: "07.00", name: "Teknik Dasar", coach: "Damar" },
      { time: "17.30", name: "Pad Work", coach: "Damar" },
      { time: "20.30", name: "Sparring Terkendali", coach: "Damar" },
    ],
  },
];

/**
 * Blok 05 — Tiga ruang itu nyata.
 * Tiga panel sejajar dengan satu foto & satu daftar jadwal per ruang. Panel milik
 * disiplin aktif diberi bobot penuh; dua lainnya meredup tapi tetap terbaca.
 * Ritme tipografi & tempo transisi berbeda per panel (§2).
 */
export default function DisciplineSection() {
  const active = useDisciplineStore((s) => s.discipline);
  const setDiscipline = useDisciplineStore((s) => s.setDiscipline);

  const typing: Record<Discipline, string> = {
    iron: "tracking-[-0.03em] font-extrabold",
    yoga: "tracking-[0.05em] font-bold",
    muaythai: "tracking-tight font-extrabold italic",
  };

  return (
    <DisciplineBlock
      id="ruang"
      rhythm={3}
      tone="raised"

      title="Pindah ruang,"
      titleItalic="bukan pindah tempat."
      lead="Yang berubah di tiap ruang bukan warnanya, tapi gradenya: tempo, ritme label, dan isi jadwal. Lihat sendiri bedanya sebelum datang."
      className="border-y border-border"
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-4">
        {DISCIPLINE_ORDER.map((id, index) => {
          const meta = DISCIPLINES[id];
          const panel = PANELS[index];
          const isActive = id === active;
          return (
            <Reveal key={id} delay={index * 70} className="h-full">
              <article
                className={cn(
                  "flex h-full flex-col border bg-background transition-[opacity,border-color] ease-[var(--ease-out-quint)]",
                  isActive ? "border-primary/60" : "border-border hover:border-foreground/30"
                )}
                style={{ transitionDuration: `${meta.duration}ms` }}
              >
                <button
                  type="button"
                  onClick={() => setDiscipline(id)}
                  aria-pressed={isActive}
                  className="group relative block aspect-[3/2] w-full overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                >
                  <PhotoFrame
                    photo={panel.photo}
                    className="absolute inset-0"
                    imgClassName="group-hover:scale-[1.03]"
                  />
                  <span className="absolute inset-0 bg-[linear-gradient(to_top,rgba(18,18,18,0.92),rgba(18,18,18,0.15))]" aria-hidden="true" />
                  {/* Panel tidak aktif diredupkan di fotonya saja, bukan di seluruh kartu:
                      opacity pada <article> menurunkan kontras teks (terukur 3,8:1). */}
                  {!isActive && <span className="absolute inset-0 bg-background/45" aria-hidden="true" />}
                  <span className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
                    <span className={cn("text-3xl uppercase leading-none text-foreground", typing[id])}>{meta.name}</span>
                    <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary-text">{meta.rhythmLabel}</span>
                  </span>
                </button>

                <div className="flex flex-1 flex-col gap-5 p-5">
                  <p className="text-sm font-light leading-relaxed text-muted-foreground">{meta.promise}</p>
                  <div>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                      Jadwal hari kerja
                    </p>
                    <ul className="divide-y divide-border border-t border-border">
                      {panel.schedule.map((entry) => (
                        <li key={entry.time} className="flex items-baseline justify-between gap-3 py-2 text-sm">
                          <span className="font-bold tabular-nums text-foreground">{entry.time}</span>
                          <span className="flex-1 text-muted-foreground">{entry.name}</span>
                          <span className="text-xs text-muted-foreground">{entry.coach}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="relative mt-auto border border-border p-4">
                    <LinePattern id={`panel-lines-${id}`} angle={id === "muaythai" ? 24 : -18} gap={10} opacity={0.08} />
                    <p className="relative text-xs uppercase tracking-widest text-muted-foreground">{meta.rhythmLabel}</p>
                    {meta.signature && (
                      <p className="relative mt-1 font-extrabold text-2xl tracking-tight text-foreground">{meta.signature.value}</p>
                    )}
                  </div>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>

      <div className="mt-12">
      </div>
    </DisciplineBlock>
  );
}
