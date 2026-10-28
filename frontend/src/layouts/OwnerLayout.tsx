import { useState } from "react";
import { Outlet, NavLink, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import logoImg from "@/assets/logo-gymhub.png";
import { LayoutDashboard, Wallet, Settings, ArrowRightLeft, LogOut, Menu, X, Crown } from "lucide-react";

/**
 * Menu sidebar Panel Owner.
 *
 * Keputusan josjis 2026-10-28 (P1): owner bertingkat -- dia boleh masuk semua halaman petugas.
 * Pintu ke sana satu tautan ("Buka Panel Petugas"), bukan salinan tabel anggota: dua aplikasi untuk
 * pekerjaan yang sama akan berperilaku beda lama-lama.
 */
const OWNER_MENU = [
  { label: "Ringkasan", href: "/owner", icon: LayoutDashboard, exact: true },
  { label: "Uang Masuk", href: "/owner/revenue", icon: Wallet, exact: false },
  { label: "Pengaturan Web", href: "/owner/pengaturan", icon: Settings, exact: false },
] as const;

/**
 * OwnerLayout — layout panel pemilik gym. Tiruan AdminLayout dengan badge berbeda, supaya
 * pemilik langsung tahu dia sedang di panel angka & keputusan, bukan di meja layanan.
 */
export default function OwnerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Overlay (Mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
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
        {/* Logo + Badge Owner */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/[0.06]">
          <Link to="/owner" className="flex items-center gap-2.5" onClick={() => setSidebarOpen(false)}>
            <img src={logoImg} alt="Logo" className="h-9 w-auto object-contain" />
            <div className="flex flex-col">
              <span className="text-white text-lg font-bold tracking-tight leading-tight">
                Gym<span className="text-red-600">Hub</span>
              </span>
              <span className="text-[11px] font-semibold tracking-widest uppercase text-white/70 flex items-center gap-1">
                <Crown size={10} />
                Panel Owner
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/60 transition-colors"
            aria-label="Tutup menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {OWNER_MENU.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.href
              : location.pathname.startsWith(item.href);

            return (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.exact}
                onClick={() => setSidebarOpen(false)}
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

          {/* Satu pintu ke pekerjaan meja. Bukan menu "Coming Soon". */}
          <Link
            to="/admin/members"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/[0.04] transition-all duration-200 border-t border-white/[0.06] mt-2 pt-3"
          >
            <ArrowRightLeft size={18} />
            Buka Panel Petugas
          </Link>
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
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-accent text-foreground transition-colors"
            aria-label="Buka menu"
          >
            <Menu size={20} />
          </button>

          <div className="hidden lg:block">
            <h2 className="text-sm font-medium text-muted-foreground">Panel Owner</h2>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="w-9 h-9 rounded-full bg-red-600/10 text-red-500 border border-red-600/20"
              aria-label="Panel owner"
            >
              <Crown size={16} />
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
