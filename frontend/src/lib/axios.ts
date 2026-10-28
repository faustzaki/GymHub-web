import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";

/**
 * Konfigurasi Global Axios.
 *
 * baseURL diambil dari VITE_API_BASE_URL (lihat frontend/.env.example) supaya tidak mati
 * saat di-deploy. Token Sanctum disuntik lewat interceptor.
 */
export const TOKEN_KEY = "gymhub_token";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8001/api",
  // Auth memakai Bearer token, bukan cookie sesi: jangan pasang `withCredentials`,
  // backend mengirim `Access-Control-Allow-Origin: *` sehingga browser menolaknya.
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Token kedaluwarsa / dicabut: buang supaya penjaga rute tidak mengira masih login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
    }
    return Promise.reject(error);
  }
);

export default api;

/**
 * GET yang sama dan belum selesai tidak diulang: pemanggil kedua menerima permintaan yang sama.
 *
 * Sejak React 18, StrictMode menjalankan effect dua kali di dev -- tanpa ini setiap halaman
 * memanggil API dua kali. Terukur di GymHub: `/login` dan `/owner/revenue` masing-masing 2x per
 * muat halaman, dan karena server dev melayani satu permintaan sekaligus, salinan kedua ikut
 * mengantre -- halaman terasa dua kali lebih lambat. Dedupe ini juga menolong di produksi saat
 * dua komponen kebetulan meminta data yang sama.
 *
 * Sengaja hanya untuk GET, dan hanya selama permintaannya masih berjalan (dihapus begitu selesai,
 * jadi data tidak pernah basi). POST/PATCH tidak di-dedupe: menekan "simpan" dua kali adalah dua
 * tindakan, bukan satu.
 */
const permintaanAktif = new Map<string, Promise<AxiosResponse<unknown>>>();

export function getSekali<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
  const kunci = `${url}|${JSON.stringify(config?.params ?? {})}`;
  const sudahJalan = permintaanAktif.get(kunci) as Promise<AxiosResponse<T>> | undefined;
  if (sudahJalan) return sudahJalan;

  const jalan = api.get<T>(url, config).finally(() => permintaanAktif.delete(kunci));
  permintaanAktif.set(kunci, jalan as Promise<AxiosResponse<unknown>>);
  return jalan;
}
