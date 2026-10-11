import { Outlet } from "react-router-dom";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

/**
 * PublicLayout — Layout untuk halaman publik (Landing Page, dll).
 *
 * Menggunakan <Outlet /> dari React Router agar konten halaman
 * (misal: LandingPage) di-render di antara Navbar dan Footer.
 * Ini menghindari duplikasi Navbar/Footer di setiap halaman.
 */
export default function PublicLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
