import { create } from "zustand";
import api, { getSekali, TOKEN_KEY } from "@/lib/axios";
import { DEV_BYPASS_AUTH, DEV_EMAIL, DEV_PASSWORD } from "@/lib/devMode";

/** Role yang dikenal backend (users.role). */
export type Role = "member" | "coach" | "admin" | "owner";

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
 * Penjaga agar pemeriksaan sesi tidak berjalan dua kali sekaligus.
 *
 * Penjaga rute dipasang dua kali oleh StrictMode di dev, dan tanpa penjaga ini dua-duanya
 * menjalankan checkAuth -- artinya /login dipanggil dua kali. Terukur: masuk otomatis sekali
 * saja sudah ~1,5 detik, jadi salinan kedua itu langsung terasa. Panggilan kedua sekarang hanya
 * menunggu yang pertama selesai.
 */
let checkAuthSedangJalan: Promise<void> | null = null;

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

  checkAuth: () => {
    if (checkAuthSedangJalan) return checkAuthSedangJalan;

    checkAuthSedangJalan = (async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      // [DEV-SAJA] Halaman masuk dilewati selama pengembangan: masuk otomatis memakai akun
      // yang tertulis di frontend/.env.local (berkas itu diabaikan git, jadi sandinya tidak ikut
      // terunggah). Ikut mati kalau VITE_DEV_BYPASS_AUTH=0 -- kalau tidak, penjaga halaman masuk
      // mustahil diuji karena sesinya selalu dibuat sendiri.
      if (DEV_BYPASS_AUTH && DEV_EMAIL && DEV_PASSWORD) {
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
      const response = await getSekali<{ data: User }>("/me");
      const akun = response.data.data;

      // [DEV-SAJA] Sesi lama bisa saja milik akun lain -- dulu masuk otomatis memakai
      // admin@gymhub.local, dan token itu masih tersimpan di peramban. Akibatnya semua endpoint
      // /owner/* menjawab 403 ("Akses ditolak. Halaman ini hanya untuk owner") dan layarnya tampak
      // rusak, padahal yang salah cuma sesi basi. Kalau akunnya bukan akun dev, sesi itu dibuang
      // dan diganti dengan akun dev.
      if (DEV_BYPASS_AUTH && DEV_EMAIL && DEV_PASSWORD && akun.email !== DEV_EMAIL) {
        console.warn(
          `[DEV] Sesi lama milik ${akun.email ?? "akun lain"} diganti dengan ${DEV_EMAIL} ` +
            "(akun dev). Set VITE_DEV_BYPASS_AUTH=0 kalau memang ingin menguji sebagai akun lain."
        );
        localStorage.removeItem(TOKEN_KEY);
        const hasil = await useAuthStore.getState().login(DEV_EMAIL, DEV_PASSWORD);
        if (!hasil.ok) {
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
        return;
      }

      set({
        user: akun,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
    })().finally(() => {
      checkAuthSedangJalan = null;
    });

    return checkAuthSedangJalan;
  },
}));
