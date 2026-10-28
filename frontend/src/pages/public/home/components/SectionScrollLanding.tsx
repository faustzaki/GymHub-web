import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * SectionScrollLanding — mendaratkan anchor dengan benar saat MUAT DINGIN.
 *
 * MASALAH
 * `.cv-auto` menunda tata letak seksi di bawah lipatan. Saat tautan
 * `#alat`..`#contact` diklik sebelum ada seksi yang pernah dilewati, scroll
 * halus berjalan lintas wilayah yang belum ditata: seksi diukur satu per satu
 * di tengah lompatan dan dokumen memanjang SESUDAH browser menghitung titik
 * tujuan. Akibatnya pendaratan meleset — judul terlalu jauh di bawah navbar
 * atau tertutup navbar. Kunjungan kedua benar karena dokumen sudah panas.
 *
 * OBAT
 * Selama hash berubah, containment dimatikan lewat `html.cv-landing` sehingga
 * seluruh tata letak final sebelum browser memilih titik tujuan. Kelas
 * dipasang sinkron pada `click` anchor (fase tangkap) dan `hashchange`, lalu
 * dilepas begitu posisi diam. Tanpa sampul, tanpa menggeser ulang, tanpa
 * `preventDefault` — tautan tetap tautan biasa dan scroll biasa (tanpa hash)
 * tidak tersentuh.
 */
const SETTLE_FRAMES = 3;
const MAX_FRAMES = 200;

export default function SectionScrollLanding() {
  const { key, hash } = useLocation();

  useLayoutEffect(() => {
    const root = document.documentElement;
    let frame = 0;

    const settle = () => {
      root.classList.add("cv-landing");
      cancelAnimationFrame(frame);

      let frames = 0;
      let stable = 0;
      let last = NaN;
      frame = requestAnimationFrame(function step() {
        frames += 1;
        if (window.scrollY === last) stable += 1;
        else stable = 0;
        last = window.scrollY;

        if (stable >= SETTLE_FRAMES || frames >= MAX_FRAMES) root.classList.remove("cv-landing");
        else frame = requestAnimationFrame(step);
      });
    };

    // `click` mendahului scroll karena hash berubah; `hashchange` menangkap
    // tautan yang dipicu keyboard atau skrip. Klik di luar halaman (mis. ganti
    // rute tanpa hash) tidak memicu apa pun.
    const onClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.("a[href^='#']");
      if (link) settle();
    };
    const onHashChange = () => {
      if (window.location.hash) settle();
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("hashchange", onHashChange);
    if (hash) settle();

    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("hashchange", onHashChange);
      cancelAnimationFrame(frame);
      root.classList.remove("cv-landing");
    };
  }, [key, hash]);

  return null;
}
