import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
const OwnerLayout = lazy(() => import("@/layouts/OwnerLayout"));
const CoachLayout = lazy(() => import("@/layouts/CoachLayout"));
const ProtectedRoute = lazy(() => import("@/routes/ProtectedRoute"));

// Lazy-loaded pages
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const NotFoundPage = lazy(() => import("@/pages/auth/NotFoundPage"));
const MemberOverviewPage = lazy(() => import("@/pages/member/overview/MemberOverviewPage"));
// Halaman ringkasan admin tidak lagi dipakai sebagai halaman pertama (petugas langsung ke
// daftar anggota). Berkasnya sengaja dibiarkan di repositori untuk dashboard owner nanti.
// const AdminOverviewPage = lazy(() => import("@/pages/admin/overview/AdminOverviewPage"));
const CoachOverviewPage = lazy(() => import("@/pages/coach/overview/CoachOverviewPage"));
const MemberManagementPage = lazy(() =>
  import("@/pages/admin/members/MemberManagementPage").then((m) => ({ default: m.MemberManagementPage }))
);
const OwnerOverviewPage = lazy(() => import("@/pages/owner/overview/OwnerOverviewPage"));
const RevenuePage = lazy(() => import("@/pages/owner/revenue/RevenuePage"));
const WebSettingsPage = lazy(() => import("@/pages/owner/settings/WebSettingsPage"));

/**
 * App Component
 *
 * Bertindak sebagai Router Hub. Memetakan URL ke Layout + Page.
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
            Pendaftaran mandiri sudah dimatikan (PRD-001 K1): /register dialihkan.
        ========================================= */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Navigate to="/login" replace />} />
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
            Menggunakan CoachLayout (Sidebar Coach dengan aksen merah)
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
            ADMIN DASHBOARD ROUTES (PROTECTED, role=admin atau owner)
            Owner bertingkat (P1): pemilik ikut jaga meja, jadi dia boleh masuk semua halaman
            petugas. Petugas tidak boleh masuk /owner/*.
        ========================================= */}
        <Route element={<ProtectedRoute requiredRole={["admin", "owner"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            {/* Petugas mendarat langsung di daftar anggota (keputusan josjis 2026-10-28). */}
            <Route index element={<Navigate to="members" replace />} />
            <Route path="members" element={<MemberManagementPage />} />
            <Route path="reports" element={<div className="p-4">Laporan Ops (Coming Soon)</div>} />
            <Route path="settings" element={<div className="p-4">Pengaturan (Coming Soon)</div>} />
          </Route>
        </Route>

        {/* =========================================
            OWNER DASHBOARD ROUTES (PROTECTED, role=owner)
            Owner bertingkat (P1): dia juga boleh masuk /admin/* karena grup di atas
            menerima ["admin", "owner"].
        ========================================= */}
        <Route element={<ProtectedRoute requiredRole="owner" />}>
          <Route path="/owner" element={<OwnerLayout />}>
            <Route index element={<OwnerOverviewPage />} />
            <Route path="uang" element={<RevenuePage />} />
            <Route path="pengaturan" element={<WebSettingsPage />} />
          </Route>
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
