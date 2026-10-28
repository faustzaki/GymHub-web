import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Outlet, NavLink, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logoImg from "@/assets/logo-gymhub.png";
import {
  LayoutDashboard,
  CalendarDays,
  Dumbbell,
  ClipboardList,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  User,
} from "lucide-react";

/**
 * Daftar menu sidebar untuk Member Dashboard.
 *
 * Setiap item punya:
 * - label: Teks yang tampil di sidebar.
 * - href: Path routing React Router.
 * - icon: Ikon dari Lucide React.
 *
 * Kenapa dipisah dari komponen?
 * Agar mudah di-maintain dan di-update tanpa menyentuh logika UI.
 */
const SIDEBAR_MENU = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Jadwal", href: "/dashboard/schedule", icon: CalendarDays },
  { label: "Progres Latihan", href: "/dashboard/progress", icon: Dumbbell },
  { label: "To-Do List", href: "/dashboard/todos", icon: ClipboardList },
  { label: "Materi", href: "/dashboard/materials", icon: BookOpen },
  { label: "Pengaturan", href: "/dashboard/settings", icon: Settings },
] as const;

/**
 * DashboardLayout — Layout untuk halaman member dashboard.
 *
 * Struktur:
 * - Sidebar di kiri (collapsible di mobile via hamburger).
 * - Top bar di atas (notifikasi, profil).
 * - <Outlet /> di area konten utama.
 *
 * Fitur:
 * - Sidebar bisa dibuka/tutup di mobile.
 * - NavLink dari React Router otomatis memberi kelas "active"
 *   sehingga menu yang sedang dibuka ter-highlight.
 * - Warna konsisten: Dark (#0A0A0A sidebar) + Red accent.
 */
export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen flex bg-background">
      {/* ====== OVERLAY (Mobile — saat sidebar terbuka) ====== */}
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
        {/* Logo + Close Button */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/[0.06]">
          <Link to="/" className="flex items-center gap-2.5" onClick={closeSidebar}>
            <img src={logoImg} alt="Logo" className="h-9 w-auto object-contain" />
            <span className="text-white text-lg font-bold tracking-tight">
              Gym<span className="text-red-600">Hub</span>
            </span>
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
          {SIDEBAR_MENU.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? location.pathname === "/dashboard"
                : location.pathname.startsWith(item.href);

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

        {/* Logout Button */}
        <div className="px-3 pb-4 border-t border-white/[0.06] pt-4">
          <Button
            variant="ghost"
            onClick={() => useAuthStore.getState().logout()}
            className="w-full justify-start gap-3 text-white/50 hover:text-red-500 hover:bg-red-600/5 h-10"
          >
            <LogOut size={18} />
            Keluar
          </Button>
        </div>
      </aside>

      {/* ====== MAIN CONTENT AREA ====== */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 lg:px-6">
          {/* Hamburger (Mobile) */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-accent text-foreground transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>

          {/* Page Title — bisa diperluas nanti dengan breadcrumb */}
          <div className="hidden lg:block">
            <h2 className="text-sm font-medium text-muted-foreground">
              Member Dashboard
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
              {/* Notifikasi badge */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-9 h-9 rounded-full bg-accent text-foreground"
            >
              <User size={18} />
            </Button>
          </div>
        </header>

        {/* Page Content — Outlet merender halaman dashboard aktif */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
