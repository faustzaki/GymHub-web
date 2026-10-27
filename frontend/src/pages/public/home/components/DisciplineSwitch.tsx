import { useDisciplineStore, DISCIPLINES, DISCIPLINE_ORDER } from "@/store/useDisciplineStore";
import { cn } from "@/lib/utils";

/**
 * DisciplineSwitch — pemilih ruang (IRON / YOGA / MUAYTHAI).
 *
 * Penanda bergeser seperti collar barbell yang mengunci di alur: satu balok
 * bergerak antar-slot dengan `transform`, durasi mengikuti tempo disiplin tujuan
 * (langkah mengunci = sinyal state, bukan ornamen).
 *
 * Dasar: satu elemen `role="radiogroup"` memakai arrow-key bawaan peramban —
 * Radix Tabs tidak dipakai karena tidak ada panel yang diganti per tab di sini.
 */
export default function DisciplineSwitch({ className }: { className?: string }) {
  const discipline = useDisciplineStore((s) => s.discipline);
  const setDiscipline = useDisciplineStore((s) => s.setDiscipline);
  const activeIndex = DISCIPLINE_ORDER.indexOf(discipline);

  const move = (delta: number) => {
    const next = (activeIndex + delta + DISCIPLINE_ORDER.length) % DISCIPLINE_ORDER.length;
    setDiscipline(DISCIPLINE_ORDER[next]);
    // Fokus ikut pindah ke opsi baru — pola radiogroup.
    document.getElementById(`ruang-opsi-${DISCIPLINE_ORDER[next]}`)?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label="Pilih ruang latihan"
      className={cn(
        "relative grid w-full max-w-md grid-cols-3 border border-border bg-card/95 p-1 backdrop-blur-sm",
        className
      )}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          move(1);
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          move(-1);
        }
      }}
    >
      {/* Collar pengunci: bergeser smooth ke slot aktif. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-1 left-1 rounded-sm bg-primary transition-[width,transform] ease-[var(--ease-out-quint)]"
        style={{
          width: `calc((100% - 0.5rem) / 3)`,
          transform: `translateX(${activeIndex * 100}%)`,
          transitionDuration: `${DISCIPLINES[discipline].duration}ms`,
        }}
      />
      {DISCIPLINE_ORDER.map((id) => {
        const meta = DISCIPLINES[id];
        const active = id === discipline;
        return (
          <button
            key={id}
            id={`ruang-opsi-${id}`}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => setDiscipline(id)}
            className={cn(
              "relative z-10 flex min-h-11 flex-col items-start justify-center px-3 py-2 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="text-sm font-extrabold uppercase tracking-widest">{meta.name}</span>
            <span className={cn("text-[11px] font-bold uppercase tracking-[0.22em]", active ? "text-primary-foreground/80" : "")}>
              {meta.rhythmLabel}
            </span>
          </button>
        );
      })}
    </div>
  );
}
