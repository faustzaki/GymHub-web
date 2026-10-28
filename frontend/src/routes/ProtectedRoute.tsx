import { useEffect } from "react";
import { Link, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DEV_BYPASS_AUTH } from "@/lib/devMode";
import { useAuthStore, type Role } from "@/store/useAuthStore";

/** Sebutan peran untuk pesan penolakan — jangan pernah menulis "admin" keras-kode. */
const ROLE_LABEL: Record<Role, string> = {
  owner: "pemilik",
  admin: "petugas",
  coach: "pelatih",
  member: "anggota",
};

/** Peringatan dev cukup sekali per sesi halaman. */
let sudahIngatkan = false;

/**
 * ProtectedRoute — penjaga halaman dashboard.
 *
 * 1. Selama checkAuth jalan: tampilkan indikator, jangan pernah render isi.
 * 2. Belum login: tendang ke /login.
 * 3. `requiredRole` diisi dan peran user tidak termasuk: tampilkan penolakan, bukan halaman kosong.
 *    Daftar peran dipakai untuk panel bertingkat: owner boleh masuk semua halaman petugas (P1).
 */
export default function ProtectedRoute({ requiredRole }: { requiredRole?: Role | Role[] }) {
  const { isLoading, isAuthenticated, user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  // [DEV-SAJA] Peringatan sekali per sesi halaman. Lewat efek, bukan saat render: menulis variabel
  // di luar komponen saat render melanggar aturan React (dan eslint menandainya sebagai galat).
  useEffect(() => {
    if (DEV_BYPASS_AUTH && !sudahIngatkan) {
      sudahIngatkan = true;
      console.warn(
        "[DEV] ProtectedRoute dilewati: halaman masuk tidak diminta selama pengembangan. " +
          "Jalankan dengan VITE_DEV_BYPASS_AUTH=0 untuk menguji penjaganya."
      );
    }
  }, []);

  // [DEV-SAJA] Selama pengembangan, penjaga ini dilewati supaya tidak bolak-balik halaman masuk
  // waktu pindah-pindah layar. Aman dari kebocoran: `import.meta.env.DEV` bernilai false di
  // build produksi (`vite build`), jadi penjaga aslinya tetap aktif di server.
  // Perlu diuji dengan penjaga hidup? jalankan dengan VITE_DEV_BYPASS_AUTH=0.
  if (DEV_BYPASS_AUTH) {
    // Tetap tunggu sampai checkAuth selesai. Kalau tidak, layar memanggil API sebelum token ada
    // dan tabelnya muncul kosong / "Unauthenticated" sampai halaman dimuat ulang.
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }
    return <Outlet />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const allowed = requiredRole === undefined
    ? null
    : Array.isArray(requiredRole)
      ? requiredRole
      : [requiredRole];

  if (allowed && (!user || !allowed.includes(user.role))) {
    const perlu = allowed.map((role) => ROLE_LABEL[role]).join(" atau ");
    // Petugas yang tersesat ke /owner tidak perlu keluar-masuk cuma untuk kembali bekerja:
    // tawarkan halaman yang memang boleh dia buka.
    const jalurSendiri = user?.role === "admin" ? "/admin/members" : null;
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="max-w-sm space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-foreground">Halaman ini hanya untuk {perlu}</h1>
            <p className="text-sm text-muted-foreground">
              Akun ini masuk sebagai {user ? ROLE_LABEL[user.role] : "pengguna lain"}
              {user?.email ? ` (${user.email})` : ""}. Keluar dulu, lalu masuk dengan akun {perlu}.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            {jalurSendiri && (
              <Button asChild variant="outline">
                <Link to={jalurSendiri}>Buka panel petugas</Link>
              </Button>
            )}
            <Button
              onClick={() => {
                logout();
                navigate("/login", { replace: true });
              }}
            >
              Keluar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
