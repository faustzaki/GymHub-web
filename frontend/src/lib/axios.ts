import axios from "axios";

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
