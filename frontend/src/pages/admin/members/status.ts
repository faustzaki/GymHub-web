import type { MemberStatus } from "@/lib/services/members";

/**
 * Tiga status saja (keputusan josjis 2026-10-28):
 * aktif · akan berakhir (tenggat 7 hari) · nonaktif.
 *
 * "Kadaluarsa" dilebur ke "nonaktif": dari sisi petugas, anggota yang masa aktifnya habis dan
 * anggota yang dimatikan petugas sama-sama tidak boleh masuk. Bedanya tetap kelihatan di panel
 * detail -- tanggal berakhirnya masih tertulis, dan tombolnya berubah jadi "Aktifkan kembali".
 */
export const SOON_DAYS = 7;

/** Label status: dihitung server, diterjemahkan saja di sini. */
export const STATUS_LABEL: Record<MemberStatus, string> = {
  aktif: "Aktif",
  akan_berakhir: "Akan berakhir",
  nonaktif: "Nonaktif",
};

/** Badge tidak memakai merah untuk status: merah = material & sinyal (DESIGN.md). */
export const STATUS_CLASS: Record<MemberStatus, string> = {
  aktif: "border-emerald-600/40 bg-emerald-600/10 text-foreground",
  akan_berakhir: "border-amber-600/40 bg-amber-600/10 text-foreground",
  nonaktif: "border-border bg-accent text-foreground",
};

export const STATUS_OPTIONS: { value: MemberStatus | ""; label: string }[] = [
  { value: "", label: "Semua status" },
  { value: "aktif", label: "Aktif" },
  { value: "akan_berakhir", label: `Akan berakhir (≤${SOON_DAYS} hari)` },
  { value: "nonaktif", label: "Nonaktif (habis masa aktif atau dimatikan)" },
];
