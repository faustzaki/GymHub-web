import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Toaster } from "@/components/ui/sonner";

// Layouts
import PublicLayout from "@/layouts/PublicLayout";
import AuthLayout from "@/layouts/AuthLayout";
import DashboardLayout from "@/layouts/DashboardLayout";
import AdminLayout from "@/layouts/AdminLayout";
import CoachLayout from "@/layouts/CoachLayout";
import ProtectedRoute from "@/routes/ProtectedRoute";

// Public Pages
import HomePage from "@/pages/public/home/HomePage";

// Auth Pages
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";

// Dashboard Pages
import MemberOverviewPage from "@/pages/member/overview/MemberOverviewPage";
import AdminOverviewPage from "@/pages/admin/overview/AdminOverviewPage";
import CoachOverviewPage from "@/pages/coach/overview/CoachOverviewPage";
import { UserManagementPage } from "@/pages/admin/users/UserManagementPage";
import { CoachManagementPage } from "@/pages/admin/coaches/CoachManagementPage";
import { CoachFormPage } from "@/pages/admin/coaches/CoachFormPage";

/**
 * App Component
 * 
 * Bertindak sebagai Router Hub.
 * Memetakan URL path ke Layout dan Page yang sesuai.
 */
function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Routes>
        {/* =========================================
            PUBLIC ROUTES
            Menggunakan PublicLayout (Navbar + Footer)
        ========================================= */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
        </Route>

        {/* =========================================
            AUTH ROUTES
            Menggunakan AuthLayout (Split-screen Form)
        ========================================= */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* =========================================
            MEMBER DASHBOARD ROUTES (PROTECTED)
        ========================================= */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<MemberOverviewPage />} />
            <Route path="schedule" element={<div className="p-4">Halaman Jadwal (Coming Soon)</div>} />
            <Route path="progress" element={<div className="p-4">Halaman Progres (Coming Soon)</div>} />
            <Route path="todos" element={<div className="p-4">Halaman To-Do (Coming Soon)</div>} />
            <Route path="materials" element={<div className="p-4">Halaman Materi (Coming Soon)</div>} />
            <Route path="settings" element={<div className="p-4">Halaman Pengaturan (Coming Soon)</div>} />
          </Route>
        </Route>

        {/* =========================================
            COACH DASHBOARD ROUTES
            Menggunakan CoachLayout (Sidebar Coach dengan aksen Teal)
        ========================================= */}
        <Route path="/coach" element={<CoachLayout />}>
          <Route index element={<CoachOverviewPage />} />
          {/* Placeholder for future pages */}
          <Route path="materials" element={<div className="p-4">Materi & Modul (Coming Soon)</div>} />
          <Route path="schedule" element={<div className="p-4">Jadwal Member (Coming Soon)</div>} />
          <Route path="progress" element={<div className="p-4">Progres Member (Coming Soon)</div>} />
          <Route path="settings" element={<div className="p-4">Pengaturan (Coming Soon)</div>} />
        </Route>

        {/* =========================================
            ADMIN DASHBOARD ROUTES
            Menggunakan AdminLayout (Sidebar Admin)
        ========================================= */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminOverviewPage />} />
          {/* Placeholder for future pages */}
          {/* <Route element={<ProtectedRoute requiredRole="admin" />}> */}
            <Route path="users" element={<UserManagementPage />} />
          {/* </Route> */}
          <Route path="coaches" element={<CoachManagementPage />} />
            <Route path="coaches/create" element={<CoachFormPage />} />
            <Route path="coaches/:id/edit" element={<CoachFormPage />} />
          <Route path="courses" element={<div className="p-4">Manajemen Kursus (Coming Soon)</div>} />
          <Route path="schedule" element={<div className="p-4">Jadwal & Kalender (Coming Soon)</div>} />
          <Route path="finance" element={<div className="p-4">Laporan Keuangan (Coming Soon)</div>} />
          <Route path="reports" element={<div className="p-4">Laporan Ops (Coming Soon)</div>} />
          <Route path="settings" element={<div className="p-4">Pengaturan (Coming Soon)</div>} />
        </Route>

        {/* 404 Fallback */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground flex-col gap-4">
              <h1 className="text-4xl font-bold">404</h1>
              <p>Halaman tidak ditemukan.</p>
              <a href="/" className="text-red-500 hover:underline">Kembali ke Beranda</a>
            </div>
          }
        />
      </Routes>
      <Toaster position="top-right" richColors closeButton />
    </BrowserRouter>
  );
}

export default App;
