import { DisciplineBlock, Reveal } from "@/components/brand/DisciplineBlock";
import { DISCIPLINES, DISCIPLINE_ORDER, useDisciplineStore } from "@/store/useDisciplineStore";
import { cn } from "@/lib/utils";

// dummy — tiga testimoni contoh, tanpa rating bintang. Ganti setelah ada kutipan asli.
const NOTES = [
  {
    quote: "Dulu saya cuma berani treadmill. Sekarang jadwal Selasa saya deadlift, dan angkanya naik tiap bulan.",
    name: "Bagas",
    discipline: "iron" as const,
    since: "member 1 tahun 2 bulan",
    log: "Deadlift 60 → 110 kg",
  },
  {
    quote: "Kelas 06.00 bikin saya sadar napas. Sebelumnya saya kira yoga cuma peregangan.",
    name: "Ratna",
    discipline: "yoga" as const,
    since: "member 7 bulan",
    log: "3× seminggu sejak Maret",
  },
  {
    quote: "Coach tidak langsung menyuruh sparing. Dua bulan pertama cuma pijakan dan guard.",
    name: "Fajar",
    discipline: "muaythai" as const,
    since: "member 5 bulan",
    log: "12 sesi pad work",
  },
];

/** Blok 09 — Kata member. Disusun seperti catatan latihan, bukan kartu ulasan bintang lima. */
export default function TestimonialsSection() {
  const active = useDisciplineStore((s) => s.discipline);

  return (
    <DisciplineBlock
      id="kata-member"
      rhythm={3}
      tone="raised"

      title="Bukan ulasan, tapi catatan latihan"
      lead="Tiga kutipan dari member yang masih aktif. Jumlah dan perubahan angkanya mereka sebut sendiri."
      className="border-y border-border"
    >
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {NOTES.map((note, index) => {
          const isActive = note.discipline === active;
          return (
            <Reveal key={note.name} delay={index * 70} className="h-full">
              <figure className="flex h-full flex-col">
                <p className="mb-4 flex items-baseline justify-between border-b border-border pb-2 text-[11px] font-bold uppercase tracking-[0.22em]">
                  <span className={cn("text-foreground", isActive && "text-primary-text")}>{DISCIPLINES[note.discipline].rhythmLabel}</span>
                  <span className="text-muted-foreground">{DISCIPLINES[note.discipline].name}</span>
                </p>
                <blockquote className="text-xl font-light leading-snug text-foreground">
                  <p>{note.quote}</p>
                </blockquote>
                <figcaption className="mt-auto pt-6 text-sm">
                  <span className="block font-extrabold uppercase tracking-tight text-foreground">{note.name}</span>
                  <span className="block text-muted-foreground">{note.since}</span>
                  <span className="mt-2 block border-l border-primary pl-3 text-muted-foreground">{note.log}</span>
                </figcaption>
              </figure>
            </Reveal>
          );
        })}
      </div>
      <p className="mt-10 text-xs text-muted-foreground">
        Kutipan contoh dari{" "}
        {DISCIPLINE_ORDER.map((id) => DISCIPLINES[id].name).join(", ")} — diterbitkan ulang setelah izin member.
      </p>
    </DisciplineBlock>
  );
}
