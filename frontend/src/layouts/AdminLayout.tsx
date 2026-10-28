import { useState } from "react";
import { Outlet, NavLink, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import logoImg from "@/assets/Gemini_Generated_Image_kmomnfkmomnfkmom-removebg-preview.png";
import {
  Users,
  LogOut,
  Menu,
  X,
  Bell,
  Shield,
} from "lucide-react";

/**
 * Menu sidebar untuk Admin Dashboard.
 *
 * Sengaja pendek. Keputusan josjis 2026-10-28: yang tampil hanya yang benar-benar dipakai --
 * menu "Coming Soon" (Coach, Kursus, Jadwal, Laporan, Pengaturan) dibuang dari sidebar karena
 * bikin panel terlihat belum jadi. Rutenya masih ada di App.tsx kalau nanti dikerjakan.
 */
const ADMIN_MENU = [
  { label: "Anggota Gym", href: "/admin/members", icon: Users },
] as const;

/**
 * AdminLayout — Layout untuk halaman admin/pengelola.
 *
 * Secara visual mirip dengan DashboardLayout (konsistensi branding),
 * tapi sidebar-nya punya warna accent berbeda (badge "Admin")
 * agar operator langsung tahu mereka di panel admin.
 */
export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Overlay (Mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* ====== SIDEBAR ====== */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen w-64
          bg-[#0A0A0A] border-r border-white/[0.06]
          flex flex-col transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo + Badge Admin */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/[0.06]">
          <Link to="/" className="flex items-center gap-2.5" onClick={closeSidebar}>
            <img src={logoImg} alt="Logo" className="h-9 w-auto object-contain" />
            <div className="flex flex-col">
              <span className="text-white text-lg font-bold tracking-tight leading-tight">
                Gym<span className="text-red-600">Hub</span>
              </span>
              {/* Badge Admin — pembeda visual dari Member Dashboard */}
              <span className="text-[11px] font-semibold tracking-widest uppercase text-red-500/80 flex items-center gap-1">
                <Shield size={10} />
                Admin Panel
              </span>
            </div>
          </Link>
          <button
            onClick={closeSidebar}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/60 transition-colors"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {ADMIN_MENU.map((item) => {
            const isActive = location.pathname.startsWith(item.href);

            return (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={closeSidebar}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${
                    isActive
                      ? "bg-red-600/10 text-red-500 border border-red-600/20"
                      : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                  }
                `}
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-4 border-t border-white/[0.06] pt-4">
          <Button
            variant="ghost"
            onClick={() => logout()}
            className="w-full justify-start gap-3 text-white/70 hover:text-white hover:bg-white/[0.04] h-11"
          >
            <LogOut size={18} />
            Keluar
          </Button>
        </div>
      </aside>

      {/* ====== MAIN CONTENT AREA ====== */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 lg:px-6">
          <button
            onClick={toggleSidebar}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-accent text-foreground transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>

          <div className="hidden lg:block">
            <h2 className="text-sm font-medium text-muted-foreground">
              Admin Dashboard
            </h2>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative w-9 h-9 text-muted-foreground hover:text-foreground"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-9 h-9 rounded-full bg-red-600/10 text-red-500 border border-red-600/20"
            >
              <Shield size={16} />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
