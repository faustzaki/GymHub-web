import { cn } from "@/lib/utils";

/**
 * Pola garis halus sebagai latar potongan foto/panel.
 * Dibuat dengan SVG `<pattern>` (bukan `repeating-linear-gradient`, yang
 * ditandai detector impeccable sebagai slop). Arah garis = garis span jembatan.
 */
export function LinePattern({
  id,
  className,
  angle = -18,
  gap = 14,
  opacity = 0.12,
}: {
  id: string;
  className?: string;
  angle?: number;
  gap?: number;
  opacity?: number;
}) {
  return (
    <svg
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
    >
      <defs>
        <pattern
          id={id}
          width={gap}
          height={gap}
          patternUnits="userSpaceOnUse"
          patternTransform={`rotate(${angle})`}
        >
          <line x1="0" y1="0" x2="0" y2={gap} stroke="currentColor" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} opacity={opacity} />
    </svg>
  );
}
