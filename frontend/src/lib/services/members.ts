import api from "@/lib/axios";

/** Status dihitung backend (Member::status()). FE hanya menerjemahkan ke label. */
export type MemberStatus = "aktif" | "akan_berakhir" | "kadaluarsa" | "nonaktif";

export interface Member {
  id: number;
  member_code: string;
  name: string | null;
  phone: string | null;
  membership_started_at: string | null;
  membership_expires_at: string | null;
  plan_months: number | null;
  status: MemberStatus;
  days_left: number;
  has_login: boolean;
  is_active: boolean;
}

export interface MemberRenewal {
  added_months: number;
  started_from: string | null;
  expires_at_after: string | null;
  oleh: string | null;
  kapan: string | null;
}

export interface MemberDetail extends Member {
  riwayat: MemberRenewal[];
}

export interface MemberList {
  items: Member[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}

/** Bentuk galat 409 saat nomor HP sudah dipakai (PRD US-1). */
export interface PhoneTaken {
  existing_member: { id: number; name: string; member_code: string } | null;
}

/** Durasi cepat yang tampil di layar: 1 bulan · 3 bulan · 6 bulan · 1 tahun. */
export const PLAN_OPTIONS = [1, 3, 6, 12] as const;

/** Durasi bebas -- petugas boleh menyusun sendiri (mis. 2 bulan atau 7 bulan). */
export type PlanMonths = number;

/** Batas durasi, harus sama dengan AdminMemberController::PLAN_MAX_MONTHS. */
export const PLAN_MAX_MONTHS = 24;

/** 1 -> "1 bulan", 12 -> "1 tahun", 24 -> "2 tahun". */
export function planLabel(months: number): string {
  if (months === 12) return "1 tahun";
  if (months > 12 && months % 12 === 0) return `${months / 12} tahun`;
  return `${months} bulan`;
}

export async function fetchMembers(params: {
  q?: string;
  status?: MemberStatus | "";
  page?: number;
  per_page?: number;
}): Promise<MemberList> {
  const { data } = await api.get<{ data: MemberList }>("/admin/members", {
    params: {
      q: params.q || undefined,
      status: params.status || undefined,
      page: params.page,
      per_page: params.per_page ?? 15,
    },
  });
  return data.data;
}

export async function fetchMember(id: number): Promise<MemberDetail> {
  const { data } = await api.get<{ data: MemberDetail }>(`/admin/members/${id}`);
  return data.data;
}

export async function createMember(input: {
  name: string;
  phone: string;
  plan_months: PlanMonths;
}): Promise<Member> {
  const { data } = await api.post<{ data: Member }>("/admin/members", input);
  return data.data;
}

export async function renewMember(id: number, plan_months: PlanMonths): Promise<Member> {
  const { data } = await api.post<{ data: Member }>(`/admin/members/${id}/renew`, { plan_months });
  return data.data;
}

export async function setMemberActive(id: number, active: boolean): Promise<Member> {
  const { data } = await api.post<{ data: Member }>(
    `/admin/members/${id}/${active ? "reactivate" : "deactivate"}`
  );
  return data.data;
}

/**
 * Tanggal berakhir untuk pratinjau di form — hitungan bulan kalender, sama dengan
 * `addMonthsNoOverflow` di backend (31 Jan + 1 bulan = 28/29 Feb).
 */
export function previewExpiry(months: number, from: Date = new Date()): Date {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const target = new Date(start);
  const day = start.getDate();
  target.setDate(1);
  target.setMonth(target.getMonth() + months);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(day, lastDay));
  return target;
}

/**
 * Date -> "2027-03-27" memakai tanggal LOKAL.
 *
 * Jangan pakai toISOString(): nilai itu UTC, jadi di WIB (UTC+7) tengah malam lokal terbaca
 * sebagai hari sebelumnya ("28 Nov" jadi "27 Nov").
 */
export function toISODate(date: Date): string {
  const bulan = String(date.getMonth() + 1).padStart(2, "0");
  const hari = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${bulan}-${hari}`;
}

/** 2026-11-28 -> "28 Nov 2026". */
export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  // Menerima tanggal saja ("2026-10-27"), tanggal+waktu ("2026-10-27 00:00:00"), maupun ISO
  // lengkap. Tanpa ini, nilai bertanggal-waktu tampil sebagai "Invalid Date".
  const bersih = iso.length <= 10 ? `${iso}T00:00:00` : iso.replace(" ", "T");
  const date = new Date(bersih);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}
