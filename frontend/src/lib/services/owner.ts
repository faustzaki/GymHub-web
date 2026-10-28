import api, { getSekali } from "@/lib/axios";
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
  /** Sekali kunjungan. Bukan paket -- tidak menambah masa aktif. */
  daily: "price.daily",
  monthly: "price.monthly",
  months_6: "price.months_6",
  months_12: "price.months_12",
  name: "gym.name",
  address: "gym.address",
  hours: "gym.hours",
  whatsapp: "gym.whatsapp",
  /** URL embed Google Maps. Kosong = peta tidak ditampilkan di landing. */
  maps_embed: "gym.maps_embed",
  instagram: "social.instagram",
  tiktok: "social.tiktok",
  facebook: "social.facebook",
  youtube: "social.youtube",
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

/** Kelompok waktu halaman Uang Masuk. Harus sama dengan `KELOMPOK_WAKTU` di OwnerController. */
export type GrupWaktu = "harian" | "mingguan" | "bulanan";

/**
 * Satu titik uang masuk. `periode` berbentuk 2026-10-28 (harian), 2026-W44 (mingguan), atau
 * 2026-10 (bulanan) — bentuk mesin, labelnya diurus `periodeLabel`/`periodeJudul`.
 */
export interface MoneyPoint {
  periode: string;
  total: number;
  cash: number;
  qris: number;
  transaksi: number;
}

/** Senin dari "tahun-minggu" ISO 8601 (mis. 2026-W44). Dipakai untuk label minggu yang bisa dibaca. */
function seninDariIso(tahun: number, minggu: number): Date {
  const jan4 = new Date(tahun, 0, 4); // ISO: minggu 1 selalu memuat 4 Januari
  const geser = (jan4.getDay() + 6) % 7; // Senin = 0
  const seninPekan1 = new Date(tahun, 0, 4 - geser);
  return new Date(seninPekan1.getFullYear(), seninPekan1.getMonth(), seninPekan1.getDate() + (minggu - 1) * 7);
}

/** Label pendek untuk grafik: "28 Okt" · "28 Okt–3 Nov" · "Okt". */
export function periodeLabel(periode: string, grup: GrupWaktu): string {
  if (grup === "bulanan") return monthLabel(periode);

  if (grup === "mingguan") {
    // "Mgg 44" tidak menjawab pertanyaan yang sebenarnya: minggu yang mana? Rentang tanggalnya
    // yang dibaca orang. Singkat bulan supaya 8 label masih muat di satu baris.
    const [tahun, angkaMinggu] = periode.split("-W").map(Number);
    if (!tahun || !angkaMinggu) return periode;
    const senin = seninDariIso(tahun, angkaMinggu);
    const minggu = new Date(senin.getFullYear(), senin.getMonth(), senin.getDate() + 6);
    const hari = (d: Date) => d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    return `${hari(senin)}–${hari(minggu)}`;
  }

  const [tahun, bulan, hari] = periode.split("-").map(Number);
  if (!tahun || !bulan || !hari) return periode;
  return new Date(tahun, bulan - 1, hari).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

/** Keterangan panjang untuk tabel & tooltip: "Rabu, 28 Okt 2026" · "26 Okt – 1 Nov 2026" · "Okt 2026". */
export function periodeJudul(periode: string, grup: GrupWaktu): string {
  if (grup === "bulanan") {
    const [tahun, bulan] = periode.split("-").map(Number);
    if (!tahun || !bulan) return periode;
    return new Date(tahun, bulan - 1, 1).toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    });
  }

  if (grup === "mingguan") {
    const [tahun, angkaMinggu] = periode.split("-W").map(Number);
    if (!tahun || !angkaMinggu) return periode;
    const senin = seninDariIso(tahun, angkaMinggu);
    const minggu = new Date(senin.getFullYear(), senin.getMonth(), senin.getDate() + 6);
    const hari = (d: Date) =>
      d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    return `${hari(senin)} – ${hari(minggu)} ${minggu.getFullYear()}`;
  }

  const [tahun, bulan, tanggal] = periode.split("-").map(Number);
  if (!tahun || !bulan || !tanggal) return periode;
  return new Date(tahun, bulan - 1, tanggal).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
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
  const { data } = await getSekali<{ data: OwnerSummary }>("/owner/summary");
  return data.data;
}

/** Seluruh isi layar Ringkasan sekaligus -- satu permintaan, bukan empat. */
export interface OwnerDashboard {
  summary: OwnerSummary;
  growth: MonthPoint[];
  priorities: PriorityMember[];
  /** Uang masuk 12 bulan terakhir -- bahan grafik gaya chart trading. */
  revenue: MoneyPoint[];
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
  const { data } = await getSekali<{
    data: {
      summary: OwnerSummary;
      growth: { months: number; items: MonthPoint[] };
      priorities: { months?: number; items: PriorityMember[] };
      revenue: { group: GrupWaktu; jumlah: number; items: MoneyPoint[] };
      settings: PublicSettings;
    }
  }>("/owner/dashboard", { params: { months: 6 } });

  // Backend mengirim deret mentah (bulan + items); di sini dibuka supaya layar tinggal pakai.
  return {
    summary: data.data.summary,
    growth: data.data.growth.items,
    priorities: data.data.priorities.items,
    revenue: data.data.revenue.items,
    settings: data.data.settings,
  };
}

/** Satu transaksi di dalam sebuah periode. */
export interface RevenueDetailRow {
  id: number;
  paid_at: string | null;
  dicatat: string | null;
  member_code: string | null;
  nama: string | null;
  phone: string | null;
  kind: string;
  method: PaymentMethod;
  months: number | null;
  amount: number;
  oleh: string | null;
}

export interface RevenueDetail {
  dari: string;
  sampai: string;
  items: RevenueDetailRow[];
  total: number;
  jumlah: number;
  /** `true` kalau barisnya lebih dari 500 dan dipotong (satu periode tidak wajar sebesar itu). */
  dipotong: boolean;
}

/**
 * Rincian transaksi satu periode. `periode` memakai bentuk mesin dari `revenue()`
 * (2026-10-28 / 2026-W44 / 2026-10), bukan label yang tampil di layar.
 */
export async function fetchRevenueDetail(
  group: GrupWaktu,
  periode: string
): Promise<RevenueDetail> {
  const { data } = await getSekali<{ data: RevenueDetail }>("/owner/revenue/detail", {
    params: { group, periode },
  });
  return data.data;
}

/** Anggota baru per bulan, deret kontinu (bulan kosong tetap muncul bernilai 0). */
export async function fetchGrowth(): Promise<MonthPoint[]> {
  const { data } = await getSekali<{ data: { items: MonthPoint[] } }>("/owner/growth", {
    params: { months: 6 },
  });
  return data.data.items;
}

/**
 * Uang masuk per kelompok waktu. `jumlah` opsional — kalau kosong, server memakai bawaannya
 * (harian 14 · mingguan 8 · bulanan 6).
 *
 * Harian & mingguan ditambahkan atas permintaan josjis 2026-10-28: uang masuk harian itu yang
 * dipakai membayar listrik & gaji, jadi angkanya perlu kelihatan tanpa menunggu akhir bulan.
 */
export async function fetchRevenue(
  group: GrupWaktu = "bulanan",
  jumlah?: number
): Promise<MoneyPoint[]> {
  const { data } = await getSekali<{ data: { items: MoneyPoint[] } }>("/owner/revenue", {
    params: { group, ...(jumlah ? { jumlah } : {}) },
  });
  return data.data.items;
}

/** Sepuluh anggota yang paling perlu ditagih, sudah diurutkan backend. */
export async function fetchPriorities(): Promise<PriorityMember[]> {
  const { data } = await getSekali<{ data: { items: PriorityMember[] } }>("/owner/priorities");
  return data.data.items;
}

export async function fetchOwnerSettings(): Promise<OwnerSettingsRow[]> {
  const { data } = await getSekali<{ data: { items: OwnerSettingsRow[] } }>("/owner/settings");
  return data.data.items;
}

export async function fetchPublicSettings(): Promise<PublicSettings> {
  const { data } = await getSekali<{ data: PublicSettings }>("/settings/public");
  return data.data;
}

/**
 * Titik peta yang benar-benar menunjuk alamat gym.
 *
 * Dulu seksi kontak hanya menyematkan `gym.maps_embed` apa adanya. Kalau owner menempel tautan
 * "sematan" yang salah (atau kosong), petanya menunjuk tempat lain -- dan tidak ada yang sadar,
 * karena peta yang salah tetap tampil seperti peta yang benar (permintaan josjis 2026-10-29:
 * "di Peta lokasi maps nya belum mengarah ke alamat tersebut").
 *
 * Aturannya:
 * - `<iframe ...>` yang ditempel owner -> ambil `src`-nya saja.
 * - URL `/maps/embed` dengan `pb=` -> pakai apa adanya.
 * - URL peta biasa (`/maps/place/...`, `/maps?q=...`, tautan pendek) -> TIDAK disematkan; yang
 *   dipakai `https://maps.google.com/maps?q=<alamat>&output=embed`, karena itu satu-satunya
 *   bentuk yang dijamin menunjuk alamat tanpa perlu kunci API.
 * - Tidak ada alamat -> `null`: peta tidak ditampilkan. Peta tanpa alamat = peta Jakarta yang
 *   tidak ada hubungannya dengan gym.
 */
export function petaEmbed(embed: string | null, alamat: string | null): string | null {
  const alamatBersih = (alamat ?? "").trim();
  const mentah = (embed ?? "").trim();

  const dariAlamat = () =>
    alamatBersih === ""
      ? null
      : `https://maps.google.com/maps?q=${encodeURIComponent(alamatBersih)}&output=embed&z=16`;

  if (mentah === "") return dariAlamat();

  const isi = mentah.match(/src=["']([^"']+)["']/i)?.[1] ?? mentah;

  // Sematan resmi Google lewat /maps/embed dengan `pb=` yang panjang (protobuf koordinat asli).
  // Panjangnya diperiksa: nilai contoh seperti `pb=abc123` juga lolos pola URL, dan kalau dipercaya
  // petanya menampilkan kotak abu-abu -- persis keluhan "maps-nya belum mengarah ke alamat".
  const pb = isi.match(/[?&]pb=([^&]+)/)?.[1] ?? "";
  if (/\/maps\/embed/i.test(isi) && pb.length >= 40) return isi;

  // Tautan peta biasa tidak bisa disematkan (X-Frame-Options). Turunkan dari alamat.
  return dariAlamat();
}

/** Tautan "buka di Google Maps", selalu dari alamat -- bukan dari kode sematan. */
export function petaLink(alamat: string | null): string | null {
  const bersih = (alamat ?? "").trim();
  if (bersih === "") return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(bersih)}`;
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

/**
 * Harga yang tampil di landing: pendaftaran, harian, 1 bulan, 6 bulan, 1 tahun.
 *
 * Susunannya sengaja tetap, bukan mengikuti `Object.keys(settings)`: urutan kartu harga adalah
 * keputusan tampilan, bukan urutan kolom basis data. Yang belum diisi bernilai `null` dan tidak
 * dirender sama sekali -- lebih baik kartunya tidak ada daripada "Rp –".
 */
export function priceCards(settings: PublicSettings | null): {
  key: string;
  label: string;
  amount: Money;
  note: string;
}[] {
  if (!settings) return [];
  const angka = (key: string): Money => {
    const nilai = settings[key as keyof PublicSettings];
    return nilai === null || nilai === undefined ? null : Number(nilai);
  };

  return [
    { key: "registration", label: "Pendaftaran", amount: angka(SETTING_KEYS.registration), note: "sekali bayar" },
    { key: "daily", label: "Harian", amount: angka(SETTING_KEYS.daily), note: "per kunjungan" },
    { key: "monthly", label: "1 Bulan", amount: angka(SETTING_KEYS.monthly), note: "per bulan" },
    { key: "months_6", label: "6 Bulan", amount: angka(SETTING_KEYS.months_6), note: "per 6 bulan" },
    { key: "months_12", label: "1 Tahun", amount: angka(SETTING_KEYS.months_12), note: "per tahun" },
  ].filter((kartu) => kartu.amount !== null);
}
