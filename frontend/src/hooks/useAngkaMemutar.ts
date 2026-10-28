import { useEffect, useState } from "react";

/**
 * Angka yang "berputar" naik ke nilai akhirnya saat pindah halaman atau ganti kelompok waktu.
 *
 * Keputusan josjis 2026-10-29: animasi ini dipakai saat PINDAH HALAMAN dulu. Nanti, begitu halaman
 * masuk sudah hidup, animasi yang sama dipakai pada muat pertama.
 *
 * Aturan yang dipegang:
 * - Nilai awal 0, bukan nilai lama. "Berputar dari angka lama" di layar uang masuk berarti angka
 *   dari kelompok waktu lain ikut terbaca sekilas -- salah baca, bukan animasi.
 * - `prefers-reduced-motion` -> langsung nilai akhir. Animasi tidak boleh jadi syarat membaca nominal.
 * - Tidak ada `setState` di badan effect (ditolak `react-hooks/set-state-in-effect` di repo ini).
 *   Nilai akhir DITURUNKAN saat render; state hanya menyimpan bingkai animasi yang sedang jalan.
 *   Kuncinya `kunci|target`, jadi begitu target atau kelompoknya berganti, angka lama otomatis
 *   tidak dipakai lagi tanpa perlu direset.
 */
const DURASI_MS = 620;

function kurangiGerak(): boolean {
  return (
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Ease-out quint: cepat di awal, mendarat pelan. Sama dengan `--ease-out-quint` di index.css. */
function ease(t: number): number {
  return 1 - Math.pow(1 - t, 5);
}

export function useAngkaMemutar(target: number | null | undefined, kunci?: string): number | null {
  const kunciAnimasi = `${kunci ?? ""}|${target ?? ""}`;
  const [bingkai, setBingkai] = useState<{ kunci: string; nilai: number } | null>(null);
  // Dibaca sekali: `matchMedia` di dalam render adalah pembacaan lingkungan, bukan efek samping,
  // tapi hasilnya harus stabil supaya tidak memicu render berbeda tiap kali.
  const [kurangi] = useState(kurangiGerak);

  useEffect(() => {
    if (target === null || target === undefined || target === 0 || kurangi) return;

    const akhir = target;
    const mulai = performance.now();
    let frame = 0;

    const langkah = (sekarang: number) => {
      const t = Math.min(1, (sekarang - mulai) / DURASI_MS);
      setBingkai({ kunci: kunciAnimasi, nilai: Math.round(akhir * ease(t)) });
      if (t < 1) frame = requestAnimationFrame(langkah);
    };

    frame = requestAnimationFrame(langkah);
    return () => cancelAnimationFrame(frame);
  }, [kunciAnimasi, target, kurangi]);

  if (target === null || target === undefined) return null;
  // Bingkai animasi hanya berlaku untuk target yang sedang dianimasikan.
  if (bingkai && bingkai.kunci === kunciAnimasi) return bingkai.nilai;
  // Animasi akan dimulai: mulai dari 0, bukan dari angka akhir (kalau tidak, angkanya sempat
  // melompat ke nilai akhir satu bingkai sebelum animasinya jalan).
  if (target !== 0 && !kurangi) return 0;
  return target;
}
