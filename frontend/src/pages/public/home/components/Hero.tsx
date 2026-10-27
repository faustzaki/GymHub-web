import { useEffect, useRef } from "react";
import { ArrowRight, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChalkField from "@/components/brand/ChalkField";
import { usePrefersReducedMotion } from "@/hooks/useLandingMotion";
import { DISCIPLINES, DISCIPLINE_ORDER, useDisciplineStore } from "@/store/useDisciplineStore";
import { cn } from "@/lib/utils";
import DisciplineSwitch from "./DisciplineSwitch";

/** Skip video on save-data or slow connections (2g/slow-2g). */
const shouldSkipVideo = (() => {
  if (!("connection" in navigator)) return false;
  const conn = navigator.connection;
  if (!conn || typeof conn !== "object") return false;
  const saveData = "saveData" in conn && conn.saveData === true;
  const effectiveType = "effectiveType" in conn ? conn.effectiveType : null;
  return saveData || effectiveType === "slow-2g" || effectiveType === "2g";
})();


/** Tiga klip hero; ketiganya dirender berdampingan lalu di-crossfade (tanpa remount). */
const VIDEOS = DISCIPLINE_ORDER.map((id) => ({
  id,
  src: `/assets/hero-${id}.mp4`,
  poster: `/assets/hero-${id}.jpg`,
}));

/**
 * Parallax hero: geser vertikal maksimum 40px mengikuti scroll.
 * Ditulis langsung ke transform lewat rAF (tanpa re-render React) dan berhenti
 * saat scroll berhenti. Gerak = kedalaman lapisan, bukan hiasan; dimatikan
 * sepenuhnya saat `prefers-reduced-motion`.
 */
function useParallax(max = 40) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node || reduced) {
      node?.style.removeProperty("transform");
      return;
    }
    let frame = 0;
    const apply = () => {
      frame = 0;
      const offset = Math.min(max, Math.max(0, window.scrollY * 0.18));
      node.style.transform = `translate3d(0, ${offset}px, 0)`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [max, reduced]);

  return ref;
}

const Hero = () => {
  const discipline = useDisciplineStore((s) => s.discipline);
  const meta = DISCIPLINES[discipline];
  const reduced = usePrefersReducedMotion();
  const mediaRef = useParallax(40);
  const typing = {
    iron: "tracking-[-0.03em]",
    yoga: "tracking-[0.03em]",
    muaythai: "tracking-[-0.01em]",
  }[discipline];

  return (
    <section
      id="home"
      className="relative flex min-h-[100svh] w-full flex-col justify-end overflow-hidden bg-background pb-10 pt-28"
      style={{ ["--local-dur" as string]: `${meta.duration}ms` }}
    >
      {/* Media: satu video per ruang, crossfade opacity. Di belakangnya poster
          dipakai sebagai lapisan dasar; reduced-motion mematikan video. */}
      <div ref={mediaRef} aria-hidden="true" className="absolute inset-0">
        <div className="absolute inset-0 scale-[1.06]">
          {VIDEOS.map((video) => (
            <img
              key={`poster-${video.id}`}
              src={video.poster}
              alt=""
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-opacity ease-[var(--ease-out-quint)]",
                video.id === discipline ? "opacity-100" : "opacity-0"
              )}
              style={{ filter: DISCIPLINES[video.id].grade, transitionDuration: `${meta.duration}ms` }}
            />
          ))}
          {!reduced && !shouldSkipVideo &&
            VIDEOS.map((video) => (
              <video
                key={video.id}
                className={cn(
                  "absolute inset-0 hidden h-full w-full object-cover transition-opacity ease-[var(--ease-out-quint)] md:block",
                  video.id === discipline ? "opacity-100" : "opacity-0"
                )}
                style={{ filter: DISCIPLINES[video.id].grade, transitionDuration: `${meta.duration}ms` }}
                src={video.src}
                poster={video.poster}
                autoPlay
                muted
                loop
                playsInline
                preload={video.id === "iron" ? "auto" : "none"}
                tabIndex={-1}
              />
            ))}
        </div>
        {/* Overlay gelap supaya teks tetap >=4.5:1 di semua frame video. */}
        {/* Dua lapis scrim: vertikal menahan bagian bawah, horizontal menahan kolom teks.
            Diukur dari piksel hasil render: sebelumnya bagian paling terang di pita teks
            hanya menyisakan 2,65:1 untuk putih (gagal AA) karena asap chalk yang terang. */}
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(18,18,18,0.98)_0%,rgba(18,18,18,0.95)_36%,rgba(18,18,18,0.86)_58%,rgba(18,18,18,0.6)_80%,rgba(18,18,18,0.5)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(18,18,18,0.96)_0%,rgba(18,18,18,0.88)_50%,rgba(18,18,18,0.3)_100%)] opacity-60 md:opacity-100" />
        <ChalkField position="bottom" opacity={discipline === "yoga" ? 0.24 : 0.42} />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          <div className="max-w-4xl">
            <h1
              className={cn(
                "text-display font-extrabold uppercase text-foreground transition-[letter-spacing] duration-300",
                typing
              )}
            >
              Satu jembatan.
              <br />
              {/* Spasi di awal span ini tidak terlihat (white-space normal), tapi
                  memberi pemisah kata supaya pembaca layar tidak membaca
                  "jembatan.Tiga" sebagai satu kata. */}
              <span className="italic font-light normal-case text-foreground/90">{" "}Tiga ruang latihan.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lead font-light text-foreground/80">
              Angkat beban, yoga, dan muaythai di satu atap — dengan jadwal, progres, dan materi yang
              tercatat di akunmu.
            </p>
          </div>

          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-4">
              <DisciplineSwitch />
              <p key={meta.id} className="max-w-md text-sm leading-relaxed text-foreground/80 animate-in fade-in duration-300">
                <span className="font-bold uppercase tracking-widest text-foreground">{meta.name}</span>
                {" — "}
                {meta.promise}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                className="group h-12 rounded bg-primary px-7 text-sm font-bold uppercase tracking-widest text-primary-foreground hover:bg-primary/90"
              >
                <a href="#membership">
                  Mulai Latihanmu
                  <ArrowRight className="ml-2 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 rounded border-border bg-transparent px-7 text-sm font-bold uppercase tracking-widest text-foreground hover:bg-card hover:text-foreground"
              >
                <a href="#jadwal">Lihat Jadwal Hari Ini</a>
              </Button>
            </div>
          </div>

          {/* Baris fakta: jam buka, lokasi, tiga disiplin. */}
          <div className="grid grid-cols-1 gap-px border-t border-border pt-6 text-sm sm:grid-cols-3">
            <p className="flex items-center gap-2 text-foreground/85">
              <Clock className="size-4 text-primary" aria-hidden="true" />
              Buka setiap hari, 05.00–23.00
            </p>
            <p className="flex items-center gap-2 text-foreground/85">
              <MapPin className="size-4 text-primary" aria-hidden="true" />
              Jakarta Selatan, dekat MRT
            </p>
            <p className="text-foreground/85">
              <span className="font-bold text-foreground">3 ruang</span> beroperasi bersamaan
            </p>
          </div>
        </div>
      </div>

    </section>
  );
};

export default Hero;
