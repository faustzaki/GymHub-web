import { useRef, useState, useCallback } from "react";
import { DisciplineBlock, PhotoFrame, Reveal, SignatureRow } from "@/components/brand/DisciplineBlock";
import { LinePattern } from "@/components/brand/LinePattern";
import type { Equipment, Photo } from "@/components/brand/DisciplineBlock";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";

// [angka nyata] — spesifikasi alat dikonfirmasi pemilik; angka final ditunggu.
const EQUIPMENT: Equipment[] = [
  {
    name: "Plat bumper",
    spec: "2,5 / 5 / 10 / 15 / 20 / 25 kg · 6 pasang",
    src: "/assets/equip-plates.jpg",
    alt: "Tumpukan plat bumper hitam dengan cincin merah di lantai gym",
  },
  {
    name: "Rack & bar olimpiade",
    spec: "4 power rack · bar 20 kg, grip 28 mm",
    src: "/assets/equip-rack.jpg",
    alt: "Power rack besi hitam kosong di ruang angkat beban",
  },
  {
    name: "Heavy bag",
    spec: "6 bag gantung 30 kg · 2 bag lantai",
    src: "/assets/equip-bag.jpg",
    alt: "Deretan heavy bag hitam menggantung di ruang muaythai",
  },
  {
    name: "Matras & props yoga",
    spec: "14 matras tebal 6 mm · blok, strap, bolster",
    src: "/assets/equip-yoga.jpg",
    alt: "Matras yoga dan peti kayu bertumpuk di sudut studio",
  },
];

const SUPPORTING = [
  "Dumbbell 2,5–50 kg per 2,5 kg",
  "Bench datar, incline, decline",
  "Kabel cross-over + aksesori",
  "Kettlebell 4–32 kg",
  "Rowing erg & assault bike",
  "Squat rack dengan safety pin",
];

// Potongan grid asimetris: kolom 2 & 3 baris berbeda, bukan 4 kartu seragam.
const PHOTOS: Photo[] = [
  { src: "/assets/equip-plates.jpg", alt: "Plat bumper disusun di rak lantai", className: "col-span-2 row-span-2 min-h-64 lg:col-span-7" },
  { src: "/assets/equip-rack.jpg", alt: "Power rack di ruang angkat beban", className: "col-span-2 min-h-40 lg:col-span-5" },
  { src: "/assets/equip-bag.jpg", alt: "Heavy bag menggantung di ruang muaythai", className: "col-span-1 min-h-40 lg:col-span-5" },
  { src: "/assets/equip-yoga.jpg", alt: "Matras yoga dan peti di studio", className: "col-span-1 min-h-40 lg:col-span-4" },
];

/** Bar olimpiade selalu terpasang; berat plat ditambahkan di atasnya. */
const BAR_KG = 20;
const STEP_KG = 2.5;
const MAX_PLATE_KG = 120;
const PX_PER_STEP = 12;
const SLOTS = MAX_PLATE_KG / STEP_KG;

const snap = (value: number) =>
  Math.min(MAX_PLATE_KG, Math.max(0, Math.round(value / STEP_KG) * STEP_KG));

/**
 * Blok 03 — Alat yang ada.
 *
 * Satu interaksi fisik: mengisi pelat di bar dengan menyeret. Langkah 2,5 kg,
 * berhenti di langkah terdekat (snap), bisa dipakai lewat keyboard, dan saat
 * seret dilepas pelat memantul satu kali — sinyal "sudah terkunci", bukan hiasan.
 * Angka total dibacakan lewat `aria-live="polite"` setelah seret selesai supaya
 * pembaca layar tidak dibanjiri nilai antara.
 */
export default function EquipmentSection() {
  const [load, setLoad] = useState(60);
  const [dragging, setDragging] = useState(false);
  const [settleKey, setSettleKey] = useState(0);
  const [announced, setAnnounced] = useState(BAR_KG + 60);
  const dragOrigin = useRef<{ x: number; load: number } | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const plates = Math.round(load / STEP_KG);
  const total = BAR_KG + load;
  const pct = (load / MAX_PLATE_KG) * 100;

  const commit = useCallback((value: number) => {
    const next = snap(value);
    setLoad(next);
    setAnnounced(BAR_KG + next);
  }, []);

  const settle = useCallback(() => {
    setSettleKey((k) => k + 1);
    setAnnounced(BAR_KG + snap(load));
  }, [load]);

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragOrigin.current) return;
    dragOrigin.current = null;
    setDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    settle();
  };

  const onTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const track = trackRef.current;
    if (!track) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = track.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const clicked = snap(ratio * MAX_PLATE_KG);
    setLoad(clicked);
    dragOrigin.current = { x: e.clientX, load: clicked };
    setDragging(true);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, number | "min" | "max"> = {
      ArrowRight: load + STEP_KG,
      ArrowUp: load + STEP_KG,
      ArrowLeft: load - STEP_KG,
      ArrowDown: load - STEP_KG,
      Home: "min",
      End: "max",
    };
    const move = moves[e.key];
    if (move === undefined) return;
    e.preventDefault();
    commit(move === "min" ? 0 : move === "max" ? MAX_PLATE_KG : move);
  };

  return (
    <DisciplineBlock
      id="alat"
      rhythm={3}
      tone="raised"
      title="Alatnya nyata,"
      titleItalic="spesifikasinya tertulis."
      lead="Tidak perlu menebak apakah bar-nya olimpiade atau platnya berpasangan. Semua yang kamu lihat di daftar ini ada di lantai, siap dipakai kelas."
      className="border-y border-border"
    >
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="min-w-0 lg:col-span-7">
          <div className="grid min-w-0 grid-cols-4 gap-3">
            {PHOTOS.map((photo) => (
              <PhotoFrame key={photo.src + photo.className} photo={photo} className={photo.className} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:col-span-5">
          <Reveal>
            <div className="border border-border bg-background p-6">
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-label font-bold uppercase tracking-widest text-muted-foreground">
                  Simulasi tumpukan bar
                </p>
                <p className="font-extrabold text-3xl tracking-tight text-foreground tabular-nums">
                  {total}
                  <span className="ml-1 text-sm font-bold text-muted-foreground">kg</span>
                </p>
              </div>

              {/* Track + kenop + tombol ±. Seluruh baris ≥44px untuk sentuh. */}
              <div className="mt-5 flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Kurangi 2,5 kg"
                  onClick={() => commit(load - STEP_KG)}
                  disabled={load <= 0}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded border border-border bg-card text-foreground transition-colors hover:bg-primary hover:text-primary-foreground active:bg-primary/80 disabled:pointer-events-none disabled:opacity-40"
                >
                  <Minus className="size-4" aria-hidden="true" />
                </button>

                {/* Slider track — seret di track atau kenop. */}
                <div
                  ref={trackRef}
                  role="slider"
                  tabIndex={0}
                  aria-label="Berat plat di bar"
                  aria-valuemin={0}
                  aria-valuemax={MAX_PLATE_KG}
                  aria-valuenow={load}
                  aria-valuetext={`${load} kilogram plat, total ${total} kilogram`}
                  onPointerDown={onTrackPointerDown}
                  onPointerMove={(e) => {
                    const origin = dragOrigin.current;
                    if (!origin) return;
                    const deltaSteps = (e.clientX - origin.x) / PX_PER_STEP;
                    setLoad(snap(origin.load + deltaSteps * STEP_KG));
                  }}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                  onKeyDown={onKeyDown}
                  className={cn(
                    "relative h-11 w-full touch-none select-none rounded",
                    dragging ? "cursor-grabbing" : "cursor-grab"
                  )}
                >
                  {/* Track background */}
                  <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-card" />
                  {/* Track fill */}
                  <div
                    className="absolute top-1/2 left-0 h-1 -translate-y-1/2 rounded-full bg-primary transition-[width] ease-[var(--ease-out-quint)]"
                    style={{
                      width: `${pct}%`,
                      transitionDuration: dragging ? "0ms" : "220ms",
                    }}
                  />
                  {/* Kenop */}
                  <div
                    className={cn(
                      "absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-foreground transition-[left,transform] ease-[var(--ease-out-quint)]",
                      dragging ? "scale-125" : "hover:scale-110"
                    )}
                    style={{
                      left: `${pct}%`,
                      transitionDuration: dragging ? "0ms" : "220ms",
                    }}
                  />
                </div>

                <button
                  type="button"
                  aria-label="Tambah 2,5 kg"
                  onClick={() => commit(load + STEP_KG)}
                  disabled={load >= MAX_PLATE_KG}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded border border-border bg-card text-foreground transition-colors hover:bg-primary hover:text-primary-foreground active:bg-primary/80 disabled:pointer-events-none disabled:opacity-40"
                >
                  <Plus className="size-4" aria-hidden="true" />
                </button>
              </div>

              {/* Plat visual: jarak 5px agar terbaca sebagai tumpukan. */}
              <div
                key={settleKey}
                className="plate-settle mt-4 flex h-16 items-end justify-center gap-[5px] px-3"
                style={{
                  filter: plates > 0 ? `drop-shadow(0 ${Math.min(plates, 18)}px 8px rgba(220,38,38,0.16))` : "none",
                }}
              >
                {Array.from({ length: SLOTS }).map((_, index) => {
                  const filled = index < plates;
                  return (
                    <span
                      key={index}
                      aria-hidden="true"
                      className={cn(
                        "block w-[3px] origin-bottom rounded-sm transition-[transform,background-color] ease-[var(--ease-out-quint)]",
                        filled ? "bg-primary" : "bg-border"
                      )}
                      style={{
                        height: "100%",
                        transform: `scaleY(${filled ? 0.72 + Math.min(index, 20) * 0.014 : 0.06})`,
                        transitionDuration: dragging ? "80ms" : "220ms",
                      }}
                    />
                  );
                })}
              </div>

              <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm text-foreground/70">
                <p>
                  <span className="font-bold text-foreground">Bar {BAR_KG} kg</span> + {plates} pelat ({load} kg)
                </p>
                {/* Instruksi keyboard: sr-only, bukan teks antarmuka. */}
                <p className="sr-only">Panah kiri/kanan ubah 2,5 kg. Home ke minimum, End ke maksimum.</p>
              </div>

              <p className="mt-4 text-sm text-foreground/70">
                Beban ini yang tercatat di akunmu setiap sesi.
              </p>

              <p aria-live="polite" className="sr-only">
                Total {announced} kilogram.
              </p>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <dl className="divide-y divide-border border border-border bg-background">
              {EQUIPMENT.map((item) => (
                <div key={item.name} className="flex flex-col gap-1 px-6 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                  <dt className="font-bold text-foreground">{item.name}</dt>
                  <dd className="text-sm text-muted-foreground">{item.spec}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <div className="relative border border-border bg-background p-6">
            <LinePattern id="equip-stripes" angle={-32} gap={12} opacity={0.1} />
            <div className="relative">
              <p className="text-label font-bold uppercase tracking-widest text-primary-text">Pendukung</p>
              <ul className="mt-3 grid grid-cols-1 gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                {SUPPORTING.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <SignatureRow
          items={[
            { value: "45+ alat", label: "dihitung per unit, bukan per jenis" },
            { value: "3 ruang", label: "alat tidak dipindah antar-ruang" },
            { value: "05.00", label: "alat pertama siap dipakai" },
          ]}
        />
      </div>
    </DisciplineBlock>
  );
}
