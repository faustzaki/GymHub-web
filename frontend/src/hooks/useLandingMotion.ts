import { useEffect, useRef, useState } from "react";

/** `prefers-reduced-motion` sebagai state React (video → poster, tanpa parallax). */
export function usePrefersReducedMotion() {
  // Nilai awal dibaca sinkron dari media query, jadi tidak perlu setState di effect.
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const listener = () => setReduced(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  return reduced;
}

/**
 * useInViewOnce — IntersectionObserver sekali jalan.
 *
 * Tujuan UX: bagian halaman yang sudah lewat tidak dianimasikan lagi saat
 * pengunjung scroll balik — mengurangi gerak yang tidak memberi informasi.
 * `enabled: false` (reduced-motion) langsung menandai terlihat tanpa observer.
 */
export function useInViewOnce<T extends HTMLElement>(enabled = true, threshold = 0.15) {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || seen) return;
    // Reduced-motion: tidak ada observer yang perlu dipasang; nilai turunan di
    // return sudah menganggap semuanya terlihat, jadi tidak ada setState di effect.
    if (!enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, threshold, seen]);

  return { ref, inView: seen || !enabled };
}
