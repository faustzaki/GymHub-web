import { useDisciplineStore, DISCIPLINES, DISCIPLINE_ORDER, TYPE_BY_DISCIPLINE } from "@/store/useDisciplineStore";
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
 * Perubahan ruang diumumkan lewat `aria-live="polite"` di luar radiogroup, karena
 * perubahan state radio sendiri sudah dibacakan peramban.
 */
export default function DisciplineSwitch({ className }: { className?: string }) {
  const discipline = useDisciplineStore((s) => s.discipline);
  const setDiscipline = useDisciplineStore((s) => s.setDiscipline);
  const activeIndex = DISCIPLINE_ORDER.indexOf(discipline);
  const meta = DISCIPLINES[discipline];

  const move = (delta: number) => {
    const next = (activeIndex + delta + DISCIPLINE_ORDER.length) % DISCIPLINE_ORDER.length;
    setDiscipline(DISCIPLINE_ORDER[next]);
    // Fokus ikut pindah ke opsi baru — pola radiogroup.
    document.getElementById(`ruang-opsi-${DISCIPLINE_ORDER[next]}`)?.focus();
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div
        role="radiogroup"
        aria-label="Pilih ruang latihan"
        className="relative grid w-full max-w-md grid-cols-3 border border-border bg-card p-1"
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
            transitionDuration: `${meta.duration}ms`,
          }}
        />
        {DISCIPLINE_ORDER.map((id) => {
          const item = DISCIPLINES[id];
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
                "relative z-10 flex min-h-11 flex-col items-start justify-center px-3 py-2 text-left transition-colors duration-200",
                active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className={cn("text-sm font-extrabold uppercase", TYPE_BY_DISCIPLINE[id].label)}>{item.name}</span>
              <span
                className={cn(
                  "text-label font-bold uppercase",
                  TYPE_BY_DISCIPLINE[id].label,
                  active ? "text-primary-foreground/80" : ""
                )}
              >
                {item.rhythmLabel}
              </span>
            </button>
          );
        })}
      </div>

      <p aria-live="polite" className="sr-only">
        Ruang {meta.name}, label {meta.rhythmLabel}, aktif.
      </p>
    </div>
  );
}
