import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * BridgeSpan — motif utama GymHub: satu path SVG tipis berbentuk kurva jembatan.
 *
 * Aturan pemakaian (docs/landing-direction.md §4): maksimal 2 tempat di seluruh
 * halaman — batas Hero→Alat, dan sebelum footer (seksi Komunitas→Kontak).
 *
 * `edge` memilih setengah kurva yang dipakai:
 * - "bottom": lengkung turun dari pilar kiri ke kanan (penutup seksi)
 * - "top": lengkung naik (pembuka seksi)
 */
export default function BridgeSpan({
  edge = "bottom",
  className,
  withRail = false,
}: {
  edge?: "bottom" | "top";
  className?: string;
  /** Garis kedua (handrail) yang mengikuti lengkung, memberi kesan struktur. */
  withRail?: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const gradientId = `bridge-fade-${uid}`;
  const isBottom = edge === "bottom";

  // Satu lengkung kuadratik: pilar kiri & kanan di tepi, puncak dekat tengah.
  const path = isBottom ? "M0 2 Q 640 58 1280 2" : "M0 58 Q 640 2 1280 58";
  const rail = isBottom ? "M0 12 Q 640 68 1280 12" : "M0 68 Q 640 12 1280 68";

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1280 72"
      preserveAspectRatio="none"
      className={cn("w-full", isBottom ? "h-[72px]" : "h-[72px]", className)}
    >
      <defs>
        {/* Garis memudar ke tepi supaya tidak terasa seperti border seksi. */}
        <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="currentColor" stopOpacity="0" />
          <stop offset="0.18" stopColor="currentColor" stopOpacity="0.9" />
          <stop offset="0.82" stopColor="currentColor" stopOpacity="0.9" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={path} fill="none" stroke={`url(#${gradientId})`} strokeWidth="1" />
      {withRail && (
        <path d={rail} fill="none" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1" />
      )}
      {/* Pilar: dua garis tegak pendek di titik tumpu lengkung. */}
      <line x1="2" y1={isBottom ? 2 : 58} x2="2" y2={isBottom ? 22 : 72} stroke="currentColor" strokeOpacity="0.55" strokeWidth="1" />
      <line x1="1278" y1={isBottom ? 2 : 58} x2="1278" y2={isBottom ? 22 : 72} stroke="currentColor" strokeOpacity="0.55" strokeWidth="1" />
    </svg>
  );
}
