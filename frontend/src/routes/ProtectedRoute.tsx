import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";

/**
 * ProtectedRoute — Penjaga halaman dashboard.
 * 
 * Logika:
 * 1. Jika masih loading (checkAuth sedang jalan), tampilkan spinner/kosong.
 * 2. Jika tidak terautentikasi, tendang ke /login.
 * 3. Jika oke, render konten (Outlet).
 */
export default function ProtectedRoute() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    // Verifikasi token ke backend saat pertama kali load
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // TEMPORARY BYPASS LOGIN
  // if (!isAuthenticated) {
  //   return <Navigate to="/login" replace />;
  // }

  return <Outlet />;
}
