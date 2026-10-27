import { useState } from "react";
import { DisciplineBlock, PhotoFrame, Reveal, SignatureRow } from "@/components/brand/DisciplineBlock";
import { LinePattern } from "@/components/brand/LinePattern";
import type { Equipment, Photo } from "@/components/brand/DisciplineBlock";

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

/**
 * Blok 03 — Alat yang ada.
 * Interaksi fisik satu-satunya: menumpuk beban dengan klik/tarik slider berat,
 * pelat bergeser dan bayangannya ikut menebal (bukan hover pada kartu).
 */
export default function EquipmentSection() {
  const [load, setLoad] = useState(60);
  // 2,5 kg per pelat; tumpukan maks 120 kg supaya tetap muat sebagai ilustrasi.
  const plates = Math.round(load / 2.5);
  const stack = Math.min(plates, 48);

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
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7">
          <div className="grid grid-cols-4 gap-3">
            {PHOTOS.map((photo) => (
              <PhotoFrame key={photo.src + photo.className} photo={photo} className={photo.className} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:col-span-5">
          <Reveal>
            <div className="border border-border bg-background p-6">
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Simulasi tumpukan bar</p>
                <p className="font-extrabold text-3xl tracking-tight text-foreground">
                  {load}
                  <span className="ml-1 text-sm font-bold text-muted-foreground">kg</span>
                </p>
              </div>
              <label htmlFor="beban" className="mt-5 block text-sm text-muted-foreground">
                Geser untuk menumpuk plat di satu sisi bar. Beban ini yang tercatat di akunmu setiap sesi.
              </label>
              <input
                id="beban"
                type="range"
                min={0}
                max={120}
                step={2.5}
                value={load}
                onChange={(e) => setLoad(Number(e.target.value))}
                className="mt-3 h-11 w-full accent-primary"
                aria-valuetext={`${load} kilogram, ${plates} pelat`}
              />
              <div aria-hidden="true" className="mt-4 flex h-16 items-center justify-center gap-[2px]">
                {Array.from({ length: 48 }).map((_, index) => (
                  <span
                    key={index}
                    className="block h-14 w-[3px] origin-bottom rounded-sm transition-[height,background-color,box-shadow] duration-200 ease-[var(--ease-out-quint)]"
                    style={{
                      height: index < stack ? `${28 + Math.min(index, 20) * 1.6}px` : "6px",
                      backgroundColor: index < stack ? "var(--primary)" : "var(--border)",
                      boxShadow: index < stack ? "0 6px 10px -6px rgba(220,38,38,0.55)" : "none",
                    }}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Bar 20 kg + {plates} pelat. Di lantai, plat tersedia 2,5–25 kg dan selalu berpasangan.
              </p>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <dl className="divide-y divide-border border-y border-border">
              {EQUIPMENT.map((item) => (
                <div key={item.name} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                  <dt className="font-bold text-foreground">{item.name}</dt>
                  <dd className="text-sm text-muted-foreground">{item.spec}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <div className="relative border border-border p-6">
            <LinePattern id="equip-stripes" angle={-32} gap={12} opacity={0.1} />
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-widest text-primary-text">Pendukung</p>
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
