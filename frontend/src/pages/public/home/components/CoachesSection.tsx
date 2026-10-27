import { useMemo, useState } from "react";
import { DisciplineBlock, Reveal } from "@/components/brand/DisciplineBlock";
import { DISCIPLINES, DISCIPLINE_ORDER, useDisciplineStore } from "@/store/useDisciplineStore";
import { cn } from "@/lib/utils";

type ClassRow = { time: string; name: string; coach: string; room: string; slots: string };

// dummy — nama coach & isi jadwal contoh; sumber sebenarnya jadwal kelas dari admin.
const SCHEDULE: Record<string, ClassRow[]> = {
  sen: [
    { time: "05.30", name: "Barbell Dasar", coach: "Rangga Pratama", room: "Iron", slots: "sisa 6" },
    { time: "06.00", name: "Vinyasa Pagi", coach: "Nadia Kusuma", room: "Yoga", slots: "sisa 11" },
    { time: "07.00", name: "Teknik Dasar Muaythai", coach: "Damar Wijaya", room: "Muaythai", slots: "sisa 4" },
    { time: "18.30", name: "Deadlift & Press", coach: "Rangga Pratama", room: "Iron", slots: "sisa 2" },
    { time: "19.00", name: "Restoratif & Napas", coach: "Nadia Kusuma", room: "Yoga", slots: "sisa 9" },
  ],
  sel: [
    { time: "06.00", name: "Yoga Pemula", coach: "Nadia Kusuma", room: "Yoga", slots: "sisa 13" },
    { time: "17.30", name: "Pad Work", coach: "Damar Wijaya", room: "Muaythai", slots: "sisa 5" },
    { time: "19.00", name: "Squat Pattern", coach: "Rangga Pratama", room: "Iron", slots: "sisa 8" },
  ],
  rab: [
    { time: "05.30", name: "Barbell Dasar", coach: "Rangga Pratama", room: "Iron", slots: "sisa 7" },
    { time: "09.00", name: "Hatha Perlahan", coach: "Nadia Kusuma", room: "Yoga", slots: "sisa 12" },
    { time: "18.30", name: "Muaythai Kondisi", coach: "Damar Wijaya", room: "Muaythai", slots: "sisa 3" },
    { time: "20.00", name: "Open Gym", coach: "coach standby", room: "Iron", slots: "tanpa kuota" },
  ],
  kam: [
    { time: "06.00", name: "Yoga Pemula", coach: "Nadia Kusuma", room: "Yoga", slots: "sisa 10" },
    { time: "17.30", name: "Pad Work", coach: "Damar Wijaya", room: "Muaythai", slots: "sisa 6" },
    { time: "19.00", name: "Bench & Row", coach: "Rangga Pratama", room: "Iron", slots: "sisa 4" },
  ],
  jum: [
    { time: "05.30", name: "Oly Lift Ringan", coach: "Rangga Pratama", room: "Iron", slots: "sisa 9" },
    { time: "09.00", name: "Yoga Terapi", coach: "Nadia Kusuma", room: "Yoga", slots: "sisa 14" },
    { time: "20.30", name: "Sparring Terkendali", coach: "Damar Wijaya", room: "Muaythai", slots: "sisa 2" },
  ],
};

const DAYS = [
  { key: "sen", label: "Senin" },
  { key: "sel", label: "Selasa" },
  { key: "rab", label: "Rabu" },
  { key: "kam", label: "Kamis" },
  { key: "jum", label: "Jumat" },
] as const;

// Potret pt-1..3 dipakai khusus di blok PT profesional; di sini coach tampil sebagai monogram.
// dummy — bio & sertifikasi contoh; ganti dengan data store coach saat endpoint publik siap.
const COACHES = [
  {
    name: "Rangga Pratama",
    room: "Iron",
    cert: "Sertifikasi kekuatan — angkat besi & powerlifting",
    bio: "Menemani member dari teknik squat pertama sampai beban kerja yang bisa diulang setiap minggu.",
    photo: "/assets/pt-1.jpg",
    alt: "Potret coach angkat beban pria berusia tiga puluhan",
  },
  {
    name: "Nadia Kusuma",
    room: "Yoga",
    cert: "Yoga 200 jam — vinyasa & restoratif",
    bio: "Fokus pada napas dan rentang gerak, terutama untuk member yang duduk sepanjang hari.",
    photo: "/assets/pt-2.jpg",
    alt: "Potret coach muaythai perempuan dengan balutan tangan tinju",
  },
  {
    name: "Damar Wijaya",
    room: "Muaythai",
    cert: "Muaythai — pelatih teknik & pad work",
    bio: "Mengajar ronde pendek dengan istirahat terukur, dimulai dari pijakan dan guard, bukan sparing.",
    photo: "/assets/pt-3.jpg",
    alt: "Potret coach muaythai pria berusia empat puluhan",
  },
];

/**
 * Blok 06 — Jadwal kelas & coach.
 * Tab per hari (bukan tabel panjang). Baris filter mengikuti disiplin aktif saat
 * halaman dibuka, dan bisa diganti tanpa meninggalkan seksi.
 */
export default function CoachesSection() {
  const active = useDisciplineStore((s) => s.discipline);
  const [day, setDay] = useState<(typeof DAYS)[number]["key"]>("sen");
  const [roomFilter, setRoomFilter] = useState<"semua" | (typeof DISCIPLINE_ORDER)[number]>("semua");

  const rows = useMemo(() => {
    const all = SCHEDULE[day];
    return roomFilter === "semua" ? all : all.filter((row) => row.room.toLowerCase() === roomFilter);
  }, [day, roomFilter]);

  return (
    <DisciplineBlock
      id="jadwal"
      rhythm={2}

      title="Siapa yang melatih, jam berapa kamu datang"
      lead={`Jadwal minggu kerja di tiga ruang. Disiplin aktif saat ini ${DISCIPLINES[active].name}; saring ruang di bawah bila kamu ingin fokus ke satu ruang saja.`}
    >
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7">
          <div className="flex flex-wrap items-start justify-between gap-2 pb-3">
            <p className="text-label font-bold uppercase text-muted-foreground">Jadwal kelas</p>
            <p aria-live="polite" className="text-label uppercase text-primary-text">
              {DISCIPLINES[active].rhythmLabel} aktif
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
            <div role="group" aria-label="Pilih hari" className="flex flex-wrap gap-1">
              {DAYS.map((d) => (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => setDay(d.key)}
                  aria-pressed={day === d.key}
                  className={cn(
                    "min-h-11 rounded px-4 text-sm font-bold uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    day === d.key
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-card hover:text-foreground"
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <div role="group" aria-label="Saring ruang" className="ml-auto flex flex-wrap gap-1">
              {(["semua", ...DISCIPLINE_ORDER] as const).map((room) => (
                <button
                  key={room}
                  type="button"
                  onClick={() => setRoomFilter(room)}
                  aria-pressed={roomFilter === room}
                  className={cn(
                    "min-h-11 rounded border px-3 text-xs font-bold uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    roomFilter === room
                      ? "border-primary text-primary-text"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {room === "semua" ? "Semua" : DISCIPLINES[room].name.slice(0, 4)}
                </button>
              ))}
            </div>
          </div>

          {rows.length === 0 ? (
            <div className="border border-border border-t-0 bg-card/40 p-6 text-sm text-muted-foreground">
              Tidak ada kelas muaythai di hari ini.
              <button
                type="button"
                onClick={() => setRoomFilter("semua")}
                className="ml-2 min-h-11 font-bold text-foreground underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Tampilkan semua ruang
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-border border-x border-b border-border">
              {rows.map((row) => (
                <li key={`${day}-${row.time}-${row.name}`} className="grid grid-cols-[64px_1fr] gap-x-4 gap-y-1 p-4 sm:grid-cols-[72px_1fr_auto] sm:items-center">
                  <span className="font-extrabold tabular-nums text-foreground">{row.time}</span>
                  <span className="flex flex-col">
                    <span className="font-bold text-foreground">{row.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {row.coach} · {row.room}
                    </span>
                  </span>
                  <span className="col-start-2 text-xs uppercase tracking-widest text-primary-text sm:col-start-3">{row.slots}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs text-muted-foreground">Sisa kuota diperbarui mengikuti pendaftaran kelas.</p>
        </div>

        <div className="lg:col-span-5">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Coach tetap</p>
          <ul className="space-y-4">
            {COACHES.map((coach, index) => (
              <Reveal key={coach.name} delay={index * 60}>
                <li className="flex gap-4 border border-border bg-card/40 p-4">
                  {/* Monogram, bukan potret: tiga potret coach sudah tampil penuh di blok
                      PT profesional — mengulang wajah yang sama dua kali melemahkan halaman. */}
                  <span
                    aria-hidden="true"
                    className="flex h-20 w-16 shrink-0 items-center justify-center border border-border bg-background text-lg font-extrabold uppercase tracking-tight text-primary-text"
                  >
                    {coach.name.split(" ").map((word) => word[0]).slice(0, 2).join("")}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary-text">{coach.room}</p>
                    <p className="mt-1 font-extrabold uppercase tracking-tight text-foreground">{coach.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{coach.cert}</p>
                    <p className="mt-2 text-sm font-light leading-relaxed text-muted-foreground">{coach.bio}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </DisciplineBlock>
  );
}
