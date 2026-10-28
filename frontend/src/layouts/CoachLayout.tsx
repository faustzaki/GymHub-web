import { useState } from "react";
import { Outlet, NavLink, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logoImg from "@/assets/logo-gymhub.png";
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  GraduationCap,
  User,
} from "lucide-react";

/**
 * Menu sidebar untuk Coach Dashboard.
 *
 * Fokus pada operasional pelatihan:
 * - Materi & Modul: Upload dan kelola konten pelatihan.
 * - Jadwal Member: Atur kalender sesi latihan peserta.
 * - Progres Member: Pantau perkembangan member yang dibimbing.
 *
 * TIDAK ADA akses ke:
 * - Keuangan (hanya Admin).
 * - Manajemen User global (hanya Admin).
 */
const COACH_MENU = [
  { label: "Overview", href: "/coach", icon: LayoutDashboard },
  { label: "Materi & Modul", href: "/coach/materials", icon: BookOpen },
  { label: "Jadwal Member", href: "/coach/schedule", icon: CalendarDays },
  { label: "Progres Member", href: "/coach/progress", icon: TrendingUp },
  { label: "Pengaturan", href: "/coach/settings", icon: Settings },
] as const;

/**
 * CoachLayout — Layout untuk halaman coach/pelatih.
 *
 * Perbedaan visual dengan layout lain:
 * - Badge: "Coach Panel" dengan aksen teal (hijau kebiruan) yang elegan.
 * - Menu aktif menggunakan highlight teal (bukan merah seperti Admin).
 * - Ini memberikan identitas visual terpisah tanpa berlebihan.
 *
 * Warna teal dipilih karena:
 * - Kontras baik dengan dark theme (#0A0A0A).
 * - Terasa profesional dan tenang (cocok untuk peran pelatih).
 * - Berbeda secara jelas dari merah (Admin) dan default (Member).
 */
export default function CoachLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

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
        {/* Logo + Badge Coach */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/[0.06]">
          <Link to="/" className="flex items-center gap-2.5" onClick={closeSidebar}>
            <img src={logoImg} alt="Logo" className="h-9 w-auto object-contain" />
            <div className="flex flex-col">
              <span className="text-white text-lg font-bold tracking-tight leading-tight">
                Gym<span className="text-red-600">Hub</span>
              </span>
              {/* Badge Coach — aksen teal untuk membedakan dari Admin (merah) */}
              <span className="text-[11px] font-semibold tracking-widest uppercase text-teal-400/80 flex items-center gap-1">
                <GraduationCap size={10} />
                Coach Panel
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
          {COACH_MENU.map((item) => {
            const isActive =
              item.href === "/coach"
                ? location.pathname === "/coach"
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
                      ? "bg-teal-600/10 text-teal-400 border border-teal-600/20"
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
            className="w-full justify-start gap-3 text-white/50 hover:text-teal-400 hover:bg-teal-600/5 h-10"
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
          <button
            onClick={toggleSidebar}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-accent text-foreground transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>

          <div className="hidden lg:block">
            <h2 className="text-sm font-medium text-muted-foreground">
              Coach Dashboard
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
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-9 h-9 rounded-full bg-teal-600/10 text-teal-400 border border-teal-600/20"
            >
              <User size={16} />
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
