import { Outlet } from "react-router-dom";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

/**
 * PublicLayout — kerangka halaman publik.
 *
 * Kelas `dark` dipasang di sini (bukan di `<html>`) supaya token warna gelap
 * hanya berlaku untuk area publik, tanpa mengubah dashboard yang memakai tema
 * terang. `bg-background` ikut dipasang agar overscroll tidak memutih.
 */
export default function PublicLayout() {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <a
        href="#konten-utama"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded focus:bg-primary focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:text-primary-foreground"
      >
        Lompat ke konten utama
      </a>
      <Navbar />
      <main id="konten-utama">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
