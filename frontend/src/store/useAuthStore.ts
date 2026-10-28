import { create } from "zustand";
import api, { TOKEN_KEY } from "@/lib/axios";

/** [DEV-SAJA] Akun untuk masuk otomatis selama pengembangan. Diisi dari frontend/.env.local. */
const DEV_EMAIL = import.meta.env.VITE_DEV_ADMIN_EMAIL as string | undefined;
const DEV_PASSWORD = import.meta.env.VITE_DEV_ADMIN_PASSWORD as string | undefined;

/** Role yang dikenal backend (users.role). */
export type Role = "member" | "coach" | "admin";

interface User {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  role: Role;
  member?: {
    height: number | null;
    weight: number | null;
    membership_expires_at: string | null;
  };
}

interface LoginResult {
  ok: boolean;
  role?: Role;
  message?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (user: User, token: string) => void;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

/**
 * Auth Store (Zustand)
 *
 * Sumber kebenaran status login: token di localStorage + hasil GET /me.
 * Tidak ada user karangan: kalau /me gagal, sesi dianggap berakhir.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem(TOKEN_KEY),
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, token) => {
    localStorage.setItem(TOKEN_KEY, token);
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  login: async (email, password) => {
    try {
      const response = await api.post("/login", { email, password });
      const { user, access_token } = response.data.data;
      localStorage.setItem(TOKEN_KEY, access_token);
      set({ user, token: access_token, isAuthenticated: true, isLoading: false });
      return { ok: true, role: user.role };
    } catch (err) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      return {
        ok: false,
        message:
          axiosErr.response?.data?.message ??
          "Tidak bisa masuk. Periksa koneksi ke server lalu coba lagi.",
      };
    }
  },

  logout: async () => {
    try {
      await api.post("/logout");
    } catch {
      // Token sudah tidak berlaku pun tidak masalah: sesi lokal tetap dibersihkan.
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      window.location.href = "/login";
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      // [DEV-SAJA] Halaman masuk dilewati selama pengembangan: masuk otomatis memakai akun admin
      // yang tertulis di frontend/.env.local (berkas itu diabaikan git, jadi sandinya tidak ikut
      // terunggah). Tidak aktif di build produksi karena import.meta.env.DEV bernilai false.
      if (import.meta.env.DEV && DEV_EMAIL && DEV_PASSWORD) {
        const hasil = await useAuthStore.getState().login(DEV_EMAIL, DEV_PASSWORD);
        if (!hasil.ok) {
          console.warn("[DEV] Masuk otomatis gagal:", hasil.message);
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
        return;
      }
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      return;
    }

    set({ isLoading: true });
    try {
      const response = await api.get("/me");
      set({
        user: response.data.data,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
