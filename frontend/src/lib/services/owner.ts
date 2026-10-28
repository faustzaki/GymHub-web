import api from "@/lib/axios";
import type { MemberStatus } from "@/lib/services/members";

/**
 * Pemanggilan API panel owner + `formatRupiah()`.
 *
 * Dua aturan yang menempel di sini:
 * - Harga yang belum diisi = `null`, dan tampil "–" dengan keterangan. Jangan pernah "Rp 0"
 *   untuk sesuatu yang belum diisi (keputusan josjis 2026-10-28, P5).
 * - Nominal pembayaran disimpan apa adanya (P2/P3), jadi `amount` selalu angka yang benar-benar
 *   diterima, bukan turunan harga hari ini.
 *
 * Bentuk jawaban backend ada di `backend/app/Http/Controllers/OwnerController.php` dan
 * `SettingController.php`. Endpoint owner mengirim `data` datar (bukan `{items, meta}`).
 */

/** Metode bayar. Bukan status Lunas/Belum (P2). */
export type PaymentMethod = "cash" | "qris";

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  cash: "CASH",
  qris: "QRIS",
};

/** Nominal uang. `null` = belum ada angkanya, bukan nol bayaran. */
export type Money = number | null;

/** Satu titik grafik: `bulan` berformat "2026-10". */
export interface MonthPoint {
  bulan: string;
  anggota_baru?: number;
  total?: number;
  cash?: number;
  qris?: number;
  transaksi?: number;
}

export interface OwnerSummary {
  aktif: number;
  akan_berakhir: number;
  nonaktif: number;
  baru_bulan_ini: number;
  berhenti_bulan_ini: number;
  uang_bulan_ini: number;
  transaksi_bulan_ini: number;
  /** `false` = harga bulanan belum diisi, jadi Rp 0 di layar berarti "belum diisi" (P5). */
  harga_terisi: boolean;
}

export interface PriorityMember {
  id: number;
  member_code: string;
  name: string | null;
  phone: string | null;
  membership_expires_at: string | null;
  days_left: number;
  status: MemberStatus;
  /** Nilai paketnya kalau tidak kembali; `null` = harga durasi itu belum diisi. */
  harga_paket: Money;
}

export interface OwnerSettingsRow {
  key: string;
  value: string | null;
  updated_by: string | null;
  updated_at: string | null;
}

export interface GymInfo {
  name: string;
  address: string;
  hours: string;
  whatsapp: string;
}

/** Kunci tulisan PATCH: nilai `null`/"" berarti "belum diisi" (disimpan NULL, bukan 0). */
export type SettingsPayload = Record<string, string | null>;

export const SETTING_KEYS = {
  registration: "price.registration",
  monthly: "price.monthly",
  months_3: "price.months_3",
  months_6: "price.months_6",
  months_12: "price.months_12",
  name: "gym.name",
  address: "gym.address",
  hours: "gym.hours",
  whatsapp: "gym.whatsapp",
} as const;

/** Jawaban `GET /settings/public` — dipakai form petugas dan landing, tanpa login. */
export type PublicSettings = Partial<Record<(typeof SETTING_KEYS)[keyof typeof SETTING_KEYS], string | null>>;

// ---------------------------------------------------------------------------
// Format
// ---------------------------------------------------------------------------

const RUPIAH = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

/** 150000 -> "Rp 150.000". `null` -> "–": belum ada angkanya, bukan Rp 0. */
export function formatRupiah(value: Money): string {
  if (value === null || Number.isNaN(value)) return "–";
  return RUPIAH.format(value).replace(/\u00a0/g, " ");
}

/** Harga yang belum diisi selalu berbunyi sama di semua layar (P5). */
export const BELUM_DIISI = "Harga belum diisi di Pengaturan Web";

/** "2026-10-28" atau "2026-10-28 11:20:36" -> "28 Okt 2026", tanpa pergeseran UTC. */
export function formatTanggal(iso: string | null): string {
  if (!iso) return "–";
  const [tahun, bulan, hari] = iso.split("T")[0].split(" ")[0].split("-").map(Number);
  if (!tahun || !bulan || !hari) return "–";
  return new Date(tahun, bulan - 1, hari).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** "2026-10" -> "Okt". */
export function monthLabel(bulan: string): string {
  const [tahun, angka] = bulan.split("-").map(Number);
  if (!tahun || !angka) return bulan;
  return new Date(tahun, angka - 1, 1).toLocaleDateString("id-ID", { month: "short" });
}

/**
 * Nomor untuk `https://wa.me/62...`. Nomor lokal 08xx -> 628xx; selain itu dipakai apa adanya
 * selama bentuknya masuk akal. `null` kalau nomornya tidak bisa dihubungi sama sekali.
 */
export function waNumber(phone: string | null): string | null {
  if (!phone) return null;
  const digit = phone.replace(/\D/g, "");
  if (digit.length < 8) return null;
  if (digit.startsWith("62")) return digit;
  if (digit.startsWith("0")) return `62${digit.slice(1)}`;
  return `62${digit}`;
}

/** Pesan tagihan siap kirim: nama + tanggal berakhir + sisa hari. */
export function waLink(member: PriorityMember, gymName: string | null): string | null {
  const nomor = waNumber(member.phone);
  if (!nomor) return null;
  const nama = member.name ?? member.member_code;
  const berakhir = formatTanggal(member.membership_expires_at);
  const sisa =
    member.days_left < 0
      ? `Masa aktif ${nama} sudah berakhir ${berakhir}.`
      : `Masa aktif ${nama} berakhir ${berakhir} (${member.days_left} hari lagi).`;
  const teks =
    `Halo ${nama}, ${sisa}\n\n` +
    `Kalau mau lanjut latihan, perpanjangan bisa dilakukan di meja ${gymName ?? "gym"}. ` +
    `Sisa masa aktif yang belum habis tidak hangus. Terima kasih.`;
  return `https://wa.me/${nomor}?text=${encodeURIComponent(teks)}`;
}

// ---------------------------------------------------------------------------
// Pemanggilan API
// ---------------------------------------------------------------------------

export async function fetchOwnerSummary(): Promise<OwnerSummary> {
  const { data } = await api.get<{ data: OwnerSummary }>("/owner/summary");
  return data.data;
}

/** Seluruh isi layar Ringkasan sekaligus -- satu permintaan, bukan empat. */
export interface OwnerDashboard {
  summary: OwnerSummary;
  growth: MonthPoint[];
  priorities: PriorityMember[];
  settings: PublicSettings;
}

/**
 * Satu permintaan untuk SELURUH layar Ringkasan.
 *
 * Bukan gaya: server dev di Windows (`php -S`) melayani satu permintaan sekaligus, jadi empat
 * permintaan berbaris membuat kartu menunggu yang paling belakang (±1,3 detik jadi ±0,1).
 * Endpoint terpisah tetap dipakai halaman lain (Uang Masuk, Pengaturan Web).
 */
export async function fetchOwnerDashboard(): Promise<OwnerDashboard> {
  const { data } = await api.get<{
    data: {
      summary: OwnerSummary;
      growth: { months: number; items: MonthPoint[] };
      priorities: { months?: number; items: PriorityMember[] };
      settings: PublicSettings;
    };
  }>("/owner/dashboard", { params: { months: 6 } });

  // Backend mengirim deret mentah (bulan + items); di sini dibuka supaya layar tinggal pakai.
  return {
    summary: data.data.summary,
    growth: data.data.growth.items,
    priorities: data.data.priorities.items,
    settings: data.data.settings,
  };
}

/** Anggota baru per bulan, deret kontinu (bulan kosong tetap muncul bernilai 0). */
export async function fetchGrowth(): Promise<MonthPoint[]> {
  const { data } = await api.get<{ data: { items: MonthPoint[] } }>("/owner/growth", {
    params: { months: 6 },
  });
  return data.data.items;
}

/** Uang masuk per bulan + pecahan cash/qris. */
export async function fetchRevenue(): Promise<MonthPoint[]> {
  const { data } = await api.get<{ data: { items: MonthPoint[] } }>("/owner/revenue", {
    params: { months: 6 },
  });
  return data.data.items;
}

/** Sepuluh anggota yang paling perlu ditagih, sudah diurutkan backend. */
export async function fetchPriorities(): Promise<PriorityMember[]> {
  const { data } = await api.get<{ data: { items: PriorityMember[] } }>("/owner/priorities");
  return data.data.items;
}

export async function fetchOwnerSettings(): Promise<OwnerSettingsRow[]> {
  const { data } = await api.get<{ data: { items: OwnerSettingsRow[] } }>("/owner/settings");
  return data.data.items;
}

export async function fetchPublicSettings(): Promise<PublicSettings> {
  const { data } = await api.get<{ data: PublicSettings }>("/settings/public");
  return data.data;
}

/** Kirim pengaturan. `null` = kosongkan (belum diisi), bukan nol. */
export async function saveOwnerSettings(payload: SettingsPayload): Promise<OwnerSettingsRow[]> {
  const { data } = await api.patch<{ data: { items: OwnerSettingsRow[] } }>(
    "/owner/settings",
    payload
  );
  return data.data.items;
}

/** Baris pengaturan -> peta kunci/nilai, dipakai dua layar (ringkasan & pengaturan). */
export function settingsMap(rows: OwnerSettingsRow[]): Record<string, string | null> {
  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
}

/**
 * Harga patokan untuk satu durasi, mengikuti aturan backend `Setting::priceFor()`:
 * harga khusus durasi -> harga bulanan x bulan -> tidak ada (null).
 *
 * `null` berarti kolom nominal dibiarkan kosong dan boleh diketik manual.
 */
export function priceForMonths(settings: PublicSettings | null, months: number): Money {
  if (!settings) return null;
  const khusus =
    months === 1
      ? settings[SETTING_KEYS.monthly]
      : months === 3
        ? settings[SETTING_KEYS.months_3]
        : months === 6
          ? settings[SETTING_KEYS.months_6]
          : months === 12
            ? settings[SETTING_KEYS.months_12]
            : null;
  if (khusus !== null && khusus !== undefined) return Number(khusus);
  if (settings[SETTING_KEYS.monthly] === null || settings[SETTING_KEYS.monthly] === undefined) {
    return null;
  }
  return Number(settings[SETTING_KEYS.monthly]) * months;
}
