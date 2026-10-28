import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook untuk mendeteksi perilaku scroll pada Navbar.
 *
 * Mengembalikan satu state:
 * - `isScrolled`: true jika user sudah scroll melewati threshold (navbar jadi solid + blur).
 *
 * Navbar tidak pernah disembunyikan saat scroll: posisinya selalu menempel di atas
 * supaya navigasi tetap terjangkau tanpa harus scroll balik ke atas.
 */
export function useScrollNavbar(threshold = 50) {
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > threshold);
  }, [threshold]);

  useEffect(() => {
    // `passive: true` meningkatkan performa scroll listener
    // karena browser tahu kita tidak akan memanggil preventDefault()
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return { isScrolled };
}
