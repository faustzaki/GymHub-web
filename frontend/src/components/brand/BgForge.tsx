import { cn } from "@/lib/utils";

/**
 * BgForge — lapisan latar satu elemen per seksi.
 *
 * Isi: radial merah sangat rendah di tepi atas + radial gelap di bawah + grain
 * tekstur (`texture-grain.png`, opacity .06, repeat). Tanpa warna baru.
 * Hanya dekoratif, tidak pernah menangkap pointer.
 */
export default function BgForge({
  className,
  grain = true,
  red = true,
}: {
  className?: string;
  /** Matikan grain bila seksi sudah punya ChalkField agar tidak menumpuk noise. */
  grain?: boolean;
  red?: boolean;
}) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {red && (
        <div
          className="absolute inset-x-0 top-0 h-[55%]"
          style={{
            background:
              "radial-gradient(ellipse 70% 100% at 50% 0%, color-mix(in srgb, var(--primary) 26%, transparent) 0%, color-mix(in srgb, var(--primary) 7%, transparent) 38%, transparent 70%)",
            opacity: 0.32,
          }}
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 50% 100%, #000 0%, transparent 62%)",
        }}
      />
      {grain && (
        <div
          className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
          style={{ backgroundImage: "url(/assets/texture-grain.png)", backgroundRepeat: "repeat" }}
        />
      )}
    </div>
  );
}
