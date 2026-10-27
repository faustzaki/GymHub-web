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
    grade: "contrast(1.18) saturate(0.85) brightness(0.94)",
    duration: 220,
    signature: { value: "20 kg", label: "bar olimpiade standar, plat bumper 2,5–25 kg" },
  },
  yoga: {
    id: "yoga",
    name: "Yoga",
    rhythmLabel: "Napas",
    promise: "Ruang sepi, tempo lambat, gerakan yang bisa kamu tahan.",
    grade: "contrast(0.92) saturate(0.7) brightness(1.04) sepia(0.12)",
    duration: 600,
    signature: { value: "60 menit", label: "satu sesi, dari pemanasan sampai savasana" },
  },
  muaythai: {
    id: "muaythai",
    name: "Muaythai",
    rhythmLabel: "Tempo",
    promise: "Ronde pendek, istirahat terukur, teknik yang diulang sampai jadi.",
    grade: "contrast(1.22) saturate(0.9) brightness(0.88)",
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
