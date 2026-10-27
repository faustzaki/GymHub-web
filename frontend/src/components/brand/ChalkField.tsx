import { cn } from "@/lib/utils";

/**
 * ChalkField — kepulan chalk (`texture-chalk.jpg`) dengan `mix-blend-mode: screen`.
 *
 * Pemakaian dibatasi 2 seksi (Hero & Komunitas) supaya lapisan ini tetap jadi
 * penanda, bukan latar umum. Kadang opacity diturunkan saat disiplin Yoga karena
 * gradenya lembut.
 */
export default function ChalkField({
  className,
  opacity = 0.5,
  position = "center",
}: {
  className?: string;
  opacity?: number;
  position?: "center" | "bottom" | "top";
}) {
  const alignment = {
    center: "inset-0",
    bottom: "inset-x-0 bottom-0 h-[80%]",
    top: "inset-x-0 top-0 h-[80%]",
  }[position];

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute overflow-hidden mix-blend-screen", alignment, className)}
    >
      <img
        src="/assets/texture-chalk.jpg"
        alt=""
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
        style={{ opacity }}
      />
    </div>
  );
}
