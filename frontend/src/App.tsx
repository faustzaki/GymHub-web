import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { Toaster } from "@/components/ui/sonner";

// Layouts — PublicLayout stays in main chunk (landing page shell)
import PublicLayout from "@/layouts/PublicLayout";

// Landing — main chunk
import HomePage from "@/pages/public/home/HomePage";

// Lazy-loaded layouts
const AuthLayout = lazy(() => import("@/layouts/AuthLayout"));
const DashboardLayout = lazy(() => import("@/layouts/DashboardLayout"));
const AdminLayout = lazy(() => import("@/layouts/AdminLayout"));
const CoachLayout = lazy(() => import("@/layouts/CoachLayout"));
const ProtectedRoute = lazy(() => import("@/routes/ProtectedRoute"));

// Lazy-loaded pages
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage"));
const NotFoundPage = lazy(() => import("@/pages/auth/NotFoundPage"));
const MemberOverviewPage = lazy(() => import("@/pages/member/overview/MemberOverviewPage"));
const AdminOverviewPage = lazy(() => import("@/pages/admin/overview/AdminOverviewPage"));
const CoachOverviewPage = lazy(() => import("@/pages/coach/overview/CoachOverviewPage"));
const UserManagementPage = lazy(() => import("@/pages/admin/users/UserManagementPage").then((m) => ({ default: m.UserManagementPage })));
const CoachManagementPage = lazy(() => import("@/pages/admin/coaches/CoachManagementPage").then((m) => ({ default: m.CoachManagementPage })));
const CoachFormPage = lazy(() => import("@/pages/admin/coaches/CoachFormPage").then((m) => ({ default: m.CoachFormPage })));

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
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
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
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Suspense>
      <Toaster position="top-right" richColors closeButton />
    </BrowserRouter>
  );
}

export default App;
