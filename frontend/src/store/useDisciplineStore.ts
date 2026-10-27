import { create } from "zustand";

export type Discipline = "iron" | "yoga" | "muaythai";

export interface DisciplineMeta {
  id: Discipline;
  /** Nama ruang, dipakai di heading dan pemilih. */
  name: string;
  /** Label ritme khas tiap suara (lihat docs/landing-direction.md §2). */
  rhythmLabel: string;
  /** Satu kalimat yang membedakan ruang ini dari dua ruang lain. */
  promise: string;
  /** Grade foto = filter CSS, bukan set foto kedua. */
  grade: string;
  /** Durasi transisi (ms) untuk reveal & crossfade saat disiplin ini aktif. */
  duration: number;
  /** Angka khas ruang ini, mis. "12.480 kg". Absen = tidak ditampilkan. */
  signature: { value: string; label: string } | null;
}

export const DISCIPLINES: Record<Discipline, DisciplineMeta> = {
  iron: {
    id: "iron",
    name: "Iron",
    rhythmLabel: "Tenaga",
    promise: "Angkat lebih berat tiap bulan, dengan catatan yang jelas.",
    grade: "contrast(1.18) saturate(0.9) brightness(1.02)",
    duration: 220,
    signature: { value: "20 kg", label: "bar olimpiade standar, plat bumper 2,5–25 kg" },
  },
  yoga: {
    id: "yoga",
    name: "Yoga",
    rhythmLabel: "Napas",
    promise: "Ruang sepi, tempo lambat, gerakan yang bisa kamu tahan.",
    grade: "contrast(0.94) saturate(0.72) brightness(1.06) sepia(0.12)",
    duration: 600,
    signature: { value: "60 menit", label: "satu sesi, dari pemanasan sampai savasana" },
  },
  muaythai: {
    id: "muaythai",
    name: "Muaythai",
    rhythmLabel: "Tempo",
    promise: "Ronde pendek, istirahat terukur, teknik yang diulang sampai jadi.",
    grade: "contrast(1.22) saturate(0.4) brightness(0.98)",
    duration: 320,
    signature: { value: "3 × 3", label: "ronde latihan, istirahat 60 detik" },
  },
};

export const DISCIPLINE_ORDER: Discipline[] = ["iron", "yoga", "muaythai"];

interface DisciplineState {
  discipline: Discipline;
  setDiscipline: (discipline: Discipline) => void;
}

export const useDisciplineStore = create<DisciplineState>((set) => ({
  discipline: "iron",
  setDiscipline: (discipline) => set({ discipline }),
}));

/**
 * Ritme tipografi per disiplin (docs/landing-polish.md item 2).
 * `label` ikut berubah, bukan cuma judul — label adalah suara ruang, dan tanpa
 * perubahan tracking, label pemilih terasa sama di tiga ruang.
 */
export const TYPE_BY_DISCIPLINE = {
  iron: { title: "tracking-[-0.03em] font-extrabold", lead: "tracking-tight", label: "tracking-[0.18em]" },
  yoga: { title: "tracking-[0.04em] font-bold", lead: "tracking-wide", label: "tracking-[0.3em]" },
  muaythai: { title: "tracking-tight font-extrabold", lead: "tracking-normal", label: "tracking-[0.14em]" },
} as const;

/** Kelas tipografi disiplin aktif, untuk label di seksi mana pun. */
export function useDisciplineType() {
  const discipline = useDisciplineStore((s) => s.discipline);
  return TYPE_BY_DISCIPLINE[discipline];
}
