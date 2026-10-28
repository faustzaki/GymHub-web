import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore, type Role } from "@/store/useAuthStore";

/** [DEV-SAJA] Penjaga login dimatikan hanya di build pengembangan. Lihat catatan di komponen. */
const DEV_BYPASS_AUTH = import.meta.env.DEV && import.meta.env.VITE_DEV_BYPASS_AUTH !== "0";
let sudahIngatkan = false;

/** Sebutan peran untuk pesan penolakan — jangan pernah menulis "admin" keras-kode. */
const ROLE_LABEL: Record<Role, string> = {
  owner: "pemilik",
  admin: "petugas",
  coach: "pelatih",
  member: "anggota",
};

/**
 * ProtectedRoute — penjaga halaman dashboard.
 *
 * 1. Selama checkAuth jalan: tampilkan indikator, jangan pernah render isi.
 * 2. Belum login: tendang ke /login.
 * 3. `requiredRole` diisi dan peran user tidak termasuk: tampilkan penolakan, bukan halaman kosong.
 *    Daftar peran dipakai untuk panel bertingkat: owner boleh masuk semua halaman petugas (P1).
 */
export default function ProtectedRoute({ requiredRole }: { requiredRole?: Role | Role[] }) {
  const { isLoading, isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // [DEV-SAJA] Selama pengembangan, penjaga ini dilewati supaya tidak bolak-balik halaman masuk
  // waktu pindah-pindah layar. Aman dari kebocoran: `import.meta.env.DEV` bernilai false di
  // build produksi (`vite build`), jadi penjaga aslinya tetap aktif di server.
  // Perlu diuji dengan penjaga hidup? jalankan dengan VITE_DEV_BYPASS_AUTH=0.
  if (DEV_BYPASS_AUTH) {
    if (!sudahIngatkan) {
      console.warn(
        "[DEV] ProtectedRoute dilewati: halaman masuk tidak diminta selama pengembangan. " +
          "Jalankan dengan VITE_DEV_BYPASS_AUTH=0 untuk menguji penjaganya."
      );
      sudahIngatkan = true;
    }
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="max-w-sm space-y-2 text-center">
          <h1 className="text-xl font-bold text-foreground">Halaman ini hanya untuk {perlu}</h1>
          <p className="text-sm text-muted-foreground">
            Akun Anda masuk sebagai {user ? ROLE_LABEL[user.role] : "pengguna lain"}. Keluar dulu,
            lalu masuk dengan akun {perlu}.
          </p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
