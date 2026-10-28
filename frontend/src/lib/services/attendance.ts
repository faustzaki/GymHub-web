import { getSekali } from "@/lib/axios";
import api from "@/lib/axios";
import type { MemberStatus } from "@/lib/services/members";

/**
 * Absen masuk lewat kamera HP petugas.
 *
 * Kode yang dipindai = `member_code` di kartu anggota (`GH-0001`). Backend menerima tiga bentuk
 * tulisan (`GH-0001`, `gh0001`, atau URL yang memuatnya), jadi sisi ini cukup mengirim teks apa
 * adanya -- jangan menormalkan di sini, dua tempat menormalkan = dua perilaku berbeda.
 */
export interface AbsenAnggota {
  id: number;
  member_code: string;
  name: string | null;
  phone: string | null;
  status: MemberStatus;
  days_left: number;
  membership_expires_at: string | null;
  nonaktif_karena_akun: boolean;
}

export interface AbsenHasil {
  duplikat: boolean;
  anggota: AbsenAnggota;
  absen: { id: number; jam: string | null; tanggal: string | null; method: "scan" | "manual" };
  absen_hari_ini: number;
}

export interface AbsenHariIni {
  items: {
    id: number;
    jam: string | null;
    method: "scan" | "manual";
    nama: string | null;
    member_code: string | null;
    oleh: string | null;
  }[];
  hari_ini: number;
  anggota_unik: number;
}

export async function catatAbsen(code: string, method: "scan" | "manual" = "scan"): Promise<AbsenHasil> {
  const { data } = await api.post<{ message: string; data: AbsenHasil }>("/admin/attendances", {
    code,
    method,
  });
  return data.data;
}

/**
 * Daftar kunjungan hari ini.
 *
 * `segar` dipakai setelah mencatat absen: `getSekali` menggabungkan GET yang identik dan masih
 * berjalan, jadi tanpa penanda ini daftar yang dimuat tepat setelah POST bisa memakai balasan
 * lama (gejala nyata: hasil pemindaian tampil, tapi "absen hari ini" masih 0 kunjungan).
 */
export async function fetchAbsenHariIni(limit = 10, segar = false): Promise<AbsenHariIni> {
  const { data } = await getSekali<{ data: AbsenHariIni }>("/admin/attendances", {
    params: segar ? { limit, _: Date.now() } : { limit },
  });
  return data.data;
}
