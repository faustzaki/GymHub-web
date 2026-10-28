import { DisciplineBlock, PhotoFrame, Reveal, SignatureRow } from "@/components/brand/DisciplineBlock";
import { LinePattern } from "@/components/brand/LinePattern";
import { useDisciplineType } from "@/store/useDisciplineStore";
import { cn } from "@/lib/utils";

// [angka nyata] — spesifikasi alat dikonfirmasi pemilik; angka final ditunggu.
// `room` = label ruang tempat unit itu dipakai; `span` = ukuran petak di galeri.
type GalleryItem = {
  name: string;
  spec: string;
  /** Foto bisa dipakai dua petak (detail di bawah), jadi `src` opsional. */
  src?: string;
  alt: string;
  room: string;
  span: string;
};

const GALLERY: GalleryItem[] = [
  {
    name: "Plat bumper",
    spec: "2,5 / 5 / 10 / 15 / 20 / 25 kg · 6 pasang",
    src: "/assets/equip-plates.jpg",
    alt: "Tumpukan plat bumper hitam dengan cincin merah di lantai gym",
    room: "Iron",
    span: "sm:col-span-2 sm:row-span-2 lg:col-span-6 lg:row-span-2",
  },
  {
    name: "Rack & bar olimpiade",
    spec: "4 power rack · bar 20 kg, grip 28 mm",
    src: "/assets/equip-rack.jpg",
    alt: "Power rack besi hitam kosong di ruang angkat beban",
    room: "Iron",
    span: "lg:col-span-6",
  },
  {
    name: "Heavy bag",
    spec: "6 bag gantung 30 kg · 2 bag lantai",
    src: "/assets/equip-bag.jpg",
    alt: "Deretan heavy bag hitam menggantung di ruang muaythai",
    room: "Muaythai",
    span: "lg:col-span-3",
  },
  {
    name: "Matras & props yoga",
    spec: "14 matras tebal 6 mm · blok, strap, bolster",
    src: "/assets/equip-yoga.jpg",
    alt: "Matras yoga dan peti kayu bertumpuk di sudut studio",
    room: "Yoga",
    span: "lg:col-span-3",
  },
  {
    // Petak detail: memakai foto plat yang sama, crop lebih ketat agar terbaca
    // sebagai close-up — tanpa menambah aset baru.
    name: "Plat & collar",
    spec: "Collar pengunci di tiap bar · drop zone berlapis karet",
    alt: "Potongan rapat plat bumper dan collar pengunci di lantai gym",
    room: "Iron",
    span: "sm:col-span-2 lg:col-span-4",
  },
  {
    name: "Pendukung",
    spec: "Dumbbell, bench, kabel, kettlebell, erg, squat rack",
    alt: "Peralatan pendukung gym",
    room: "Semua ruang",
    span: "sm:col-span-2 lg:col-span-8",
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

/**
 * Blok 03 — Alat yang ada, dibaca sebagai galeri.
 *
 * Satu petak galeri = satu unit alat: foto + nama + spesifikasi. Petak pertama
 * membesar (featured), sisanya mengisi sisa grid. Grid dua tingkat dibuat eksplisit
 * (`lg:` berbeda dari `sm:`) supaya tidak ada petak kosong atau luapan mendatar di
 * 375/768/1024 px. Petak tanpa foto memakai kartu teks, bukan gambar kosong.
 *
 * Hover: hanya transform halus pada foto (`group-hover:scale-[1.03]`), satu pola
 * untuk semua petak; durasinya ikut tempo disiplin aktif lewat `--local-dur`.
 * Petak berfokus keyboard dipaksa menampilkan keterangan yang sama (lihat
 * `group-focus-within`), jadi informasi tidak hanya tersedia lewat tetikus.
 */
export default function EquipmentSection() {
  const typing = useDisciplineType();

  return (
    <DisciplineBlock
      id="alat"
      rhythm={3}
      tone="raised"
      title="Alatnya nyata,"
      titleItalic="lihat sendiri."
      lead="Nama, jumlah, dan ukuran tiap unit tertulis di bawah fotonya. Semua yang tampil di sini ada di lantai, siap dipakai kelas."
      className="border-y border-border"
    >
      {/* Baris 1–2 dikunci 11rem supaya irama petak foto tidak bergeser; baris 3
          (dua kartu teks) memakai `auto` — tinggi aslinya tidak muat di 11rem dan
          dulu melimpah ke petak di bawahnya. */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:auto-rows-[13rem] lg:auto-rows-[11rem] lg:grid-cols-12 lg:grid-rows-[11rem_11rem_auto]">
        {GALLERY.map((item, index) => {
          // Petak tanpa foto: kartu teks pendukung, tanpa gambar kosong.
          if (!item.src) {
            return (
              <Reveal key={item.name} delay={index * 60} className={cn("min-w-0", item.span)}>
                <div className="relative flex h-full min-h-44 flex-col justify-between overflow-hidden border border-border bg-background p-5 sm:min-h-0 lg:p-6">
                  <LinePattern id="equip-support-lines" angle={-32} gap={12} opacity={0.1} />
                  <div className="relative">
                    <p className={cn("text-label font-bold uppercase text-primary-text", typing.label)}>{item.room}</p>
                    <h3 className="mt-2 text-xl font-extrabold uppercase tracking-tight text-foreground">{item.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{item.spec}</p>
                  </div>
                  <ul className="relative mt-4 grid grid-cols-1 gap-2 text-sm text-muted-foreground sm:grid-cols-2 sm:gap-x-6">
                    {SUPPORTING.map((entry) => (
                      <li key={entry} className="flex gap-2">
                        <span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-primary" />
                        {entry}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          }

          return (
            <Reveal key={item.src + item.span} delay={index * 60} className={cn("min-w-0", item.span)}>
              <figure className="group relative h-full min-h-44 overflow-hidden border border-border bg-background sm:min-h-0">
                <PhotoFrame
                  photo={{ src: item.src, alt: item.alt }}
                  className="absolute inset-0"
                  imgClassName="group-hover:scale-[1.03] group-focus-within:scale-[1.03] motion-reduce:transform-none"
                  // Petak detail memakai foto yang sudah ada; crop ketat = close-up.
                  {...(index === 4 ? { angle: true } : {})}
                />
                {/* Keterangan selalu terbaca di layar sempit & saat fokus; di layar
                    besar baru muncul saat hover — foto tetap jadi fokus utama. */}
                <figcaption className="absolute inset-x-0 bottom-0 bg-[linear-gradient(to_top,rgba(18,18,18,0.95),rgba(18,18,18,0.55)_65%,transparent)] p-4 transition-opacity ease-[var(--ease-out-quint)] motion-reduce:transition-none lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100" style={{ transitionDuration: "var(--local-dur)" }}>
                  {/* Label ruang selalu terbaca: satu-satunya pembeda visual antar petak. */}
                  <p className={cn("text-label font-bold uppercase text-primary-text", typing.label)}>{item.room}</p>
                  <h3 className="mt-1 text-lg font-extrabold uppercase leading-tight tracking-tight text-foreground">
                    {item.name}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{item.spec}</p>
                </figcaption>
              </figure>
            </Reveal>
          );
        })}
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
