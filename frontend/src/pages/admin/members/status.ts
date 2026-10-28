import type { MemberStatus } from "@/lib/services/members";

/** Label status: dihitung server, diterjemahkan saja di sini. */
export const STATUS_LABEL: Record<MemberStatus, string> = {
  aktif: "Aktif",
  akan_berakhir: "Akan berakhir",
  kadaluarsa: "Kadaluarsa",
  nonaktif: "Nonaktif",
};

/** Badge tidak memakai merah untuk status: merah = material & sinyal (DESIGN.md). */
export const STATUS_CLASS: Record<MemberStatus, string> = {
  aktif: "border-emerald-600/40 bg-emerald-600/10 text-foreground",
  akan_berakhir: "border-amber-600/40 bg-amber-600/10 text-foreground",
  kadaluarsa: "border-border bg-accent text-foreground",
  nonaktif: "border-border bg-transparent text-muted-foreground",
};

export const STATUS_OPTIONS: { value: MemberStatus | ""; label: string }[] = [
  { value: "", label: "Semua status" },
  { value: "aktif", label: "Aktif" },
  { value: "akan_berakhir", label: "Akan berakhir (≤7 hari)" },
  { value: "kadaluarsa", label: "Kadaluarsa" },
  { value: "nonaktif", label: "Nonaktif" },
];
