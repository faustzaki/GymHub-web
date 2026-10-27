import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { DISCIPLINES, TYPE_BY_DISCIPLINE, useDisciplineStore, useDisciplineType } from "@/store/useDisciplineStore";
import { useInViewOnce, usePrefersReducedMotion } from "@/hooks/useLandingMotion";

/** Kontrak data untuk kartu alat. Semua foto dari `/assets` lokal. */
export type Equipment = {
  name: string;
  /** Spesifikasi nyata; angka ditandai `[angka nyata]` di pemanggil bila belum final. */
  spec: string;
  src: string;
  alt: string;
};

/** Foto berlapis grade per disiplin. */
export type Photo = { src: string; alt: string; className?: string };


type DisciplineBlockProps = {
  id: string;
  /** Baris kedua judul memakai gaya italic ringan; dikirim terpisah. */
  title: string;
  titleItalic?: string;
  lead?: string;
  children: ReactNode;
  className?: string;
  /** Aturan jarak antar seksi: rapat / standar / lega (--rhythm-1..3). */
  rhythm?: 1 | 2 | 3;
  /** Latar `bg-card` untuk seksi yang sengaja dibaca sebagai ruang terpisah. */
  tone?: "base" | "raised";
};

/**
 * DisciplineBlock — kerangka satu seksi ruang latihan.
 *
 * Ritme tipografi ikut disiplin aktif (docs/landing-direction.md §2): Iron rapat &
 * extrabold, Yoga tracking lebar, Muaythai italic & tegas. Warna tidak berubah.
 * `--local-dur` diteruskan ke anak supaya transisi hover/gerak memakai tempo ruang.
 */
export function DisciplineBlock({
  id,
  title,
  titleItalic,
  lead,
  children,
  className,
  rhythm = 2,
  tone = "base",
}: DisciplineBlockProps) {
  const discipline = useDisciplineStore((s) => s.discipline);
  const meta = DISCIPLINES[discipline];
  const typing = TYPE_BY_DISCIPLINE[discipline];
  const rhythmVar = { 1: "--rhythm-1", 2: "--rhythm-2", 3: "--rhythm-3" }[rhythm];

  return (
    <section
      id={id}
      data-discipline={discipline}
      className={cn("cv-auto relative overflow-hidden", tone === "raised" ? "bg-card" : "bg-background", className)}
      style={{ paddingBlock: `var(${rhythmVar})`, ["--local-dur" as string]: `${meta.duration}ms` }}
    >
      <div className="relative mx-auto w-full max-w-7xl px-6 lg:px-8">
        <header className="mb-12 flex flex-col gap-4 lg:mb-16">
          <h2
            className={cn(
              "max-w-4xl text-title uppercase text-foreground transition-[letter-spacing] duration-300",
              typing.title
            )}
          >
            {title}
            {titleItalic && (
              <>
                {" "}
                <span className="block italic font-light normal-case text-muted-foreground">{titleItalic}</span>
              </>
            )}
          </h2>
          {lead && (
            <p
              className={cn(
                "max-w-2xl text-lead font-light text-muted-foreground transition-[letter-spacing] duration-300",
                typing.lead
              )}
            >
              {lead}
            </p>
          )}
        </header>
        {children}
      </div>
    </section>
  );
}

/** Angka pendukung seksi; statis, tidak ditransisikan. */
export function SignatureRow({ items }: { items: { value: string; label: string }[] }) {
  const typing = useDisciplineType();
  return (
    <dl className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="bg-background px-5 py-6">
          <dt className={cn("text-label font-bold uppercase text-muted-foreground", typing.label)}>{item.label}</dt>
          <dd className="mt-2 text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * PhotoFrame — foto dengan grade per disiplin (CSS filter, bukan foto baru) dan
 * tepi bawah terpotong diagonal mengikuti garis jembatan (mask SVG).
 */
export function PhotoFrame({
  photo,
  className,
  imgClassName,
  angle = false,
}: {
  photo: Photo;
  className?: string;
  imgClassName?: string;
  /** Tepi bawah miring (mask SVG) — untuk potongan foto besar saja. */
  angle?: boolean;
}) {
  const discipline = useDisciplineStore((s) => s.discipline);
  const clipId = `cut-${photo.src.replace(/[^a-z0-9]/gi, "")}`;

  return (
    <div className={cn("relative min-w-0 overflow-hidden bg-card", className)}>
      {angle && (
        <svg width="0" height="0" className="absolute" aria-hidden="true">
          <defs>
            <clipPath id={clipId} clipPathUnits="objectBoundingBox">
              <path d="M0,0 H1 V0.86 L0.62,1 H0 V1 Z" />
            </clipPath>
          </defs>
        </svg>
      )}
      <img
        src={photo.src}
        alt={photo.alt}
        loading="lazy"
        decoding="async"
        className={cn("h-full w-full object-cover transition-[filter,transform] duration-300 ease-[var(--ease-out-quint)]", imgClassName)}
        style={{ filter: DISCIPLINES[discipline].grade, clipPath: angle ? `url(#${clipId})` : undefined }}
      />
    </div>
  );
}

/**
 * Reveal — geser 16px + fade saat pertama kali masuk viewport.
 * Durasi mengikuti tempo disiplin aktif; reduced-motion = langsung tampil.
 * Rumus jaraknya sengaja ditulis di sini (bukan util) karena nilainya konstan.
 */
const REVEAL_SHIFT = "translate-y-4";

export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const discipline = useDisciplineStore((s) => s.discipline);
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInViewOnce<HTMLDivElement>(!reduced);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-[opacity,transform] ease-[var(--ease-out-quint)]",
        inView ? "translate-y-0 opacity-100" : `${REVEAL_SHIFT} opacity-0`,
        className
      )}
      style={{
        transitionDuration: `${DISCIPLINES[discipline].duration}ms`,
        transitionDelay: inView ? `${delay}ms` : "0ms",
      }}
    >
      {children}
    </div>
  );
}
