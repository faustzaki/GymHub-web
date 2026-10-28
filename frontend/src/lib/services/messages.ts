import api, { getSekali } from "@/lib/axios";

/**
 * Pesan dari form kontak landing.
 *
 * Dipakai dua tempat: lonceng notifikasi di header panel (angka + tiga pesan terbaru) dan halaman
 * "Pesan" yang menampilkan isi lengkap. Keduanya membaca tabel `messages` yang sama -- pesan yang
 * dikirim pengunjung lewat landing benar-benar tersimpan, bukan hilang setelah "terkirim".
 */
export type MessageStatus = "baru" | "dibaca" | "dibalas";

export interface Pesan {
  id: number;
  name: string;
  email: string;
  message: string;
  status: MessageStatus;
  read_at: string | null;
  handled_by: string | null;
  created_at: string | null;
  kapan: string | null;
}

export interface PesanList {
  items: Pesan[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
  belum_dibaca: number;
}

export interface Lonceng {
  belum_dibaca: number;
  terbaru: { id: number; nama: string; ringkas: string; kapan: string | null }[];
}

/** Publik: dipakai form kontak di landing. Tanpa token. */
export async function kirimPesan(payload: { name: string; email: string; message: string }): Promise<string> {
  const { data } = await api.post<{ message: string }>("/messages", payload);
  return data.message;
}

export async function fetchPesan(params: { status?: MessageStatus | ""; page?: number } = {}): Promise<PesanList> {
  const { data } = await getSekali<{ data: PesanList }>("/admin/messages", {
    params: { status: params.status || undefined, page: params.page, per_page: 20 },
  });
  return data.data;
}

/** Lonceng header. Jangan dedupe dengan `getSekali`: angka belum-dibaca harus selalu segar. */
export async function fetchLonceng(): Promise<Lonceng> {
  const { data } = await api.get<{ data: Lonceng }>("/admin/messages/unread");
  return data.data;
}

export async function ubahStatusPesan(id: number, status: MessageStatus): Promise<Pesan> {
  const { data } = await api.patch<{ data: Pesan }>(`/admin/messages/${id}`, { status });
  return data.data;
}

export const STATUS_PESAN: Record<MessageStatus, { label: string; kelas: string }> = {
  baru: { label: "Baru", kelas: "border-primary/50 bg-primary/10 text-primary-text" },
  dibaca: { label: "Dibaca", kelas: "border-border bg-card text-muted-foreground" },
  dibalas: { label: "Dibalas", kelas: "border-emerald-600/40 bg-emerald-600/10 text-emerald-500" },
};
