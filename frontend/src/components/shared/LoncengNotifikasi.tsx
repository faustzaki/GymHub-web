import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Inbox, Mail } from "lucide-react";
import { fetchLonceng, type Lonceng } from "@/lib/services/messages";

/**
 * Lonceng notifikasi header panel.
 *
 * Keputusan josjis 2026-10-29: notifikasi diambil dari form kontak landing, dan klik pesannya
 * mengarah ke halaman daftar pesan. Dulu lonceng di header cuma hiasan dengan titik merah mati --
 * angka yang tidak pernah berubah lebih buruk daripada tidak ada lonceng.
 *
 * Satu halaman pesan untuk dua panel: owner bertingkat boleh membuka `/admin/messages`, jadi
 * lonceng di header owner menuju alamat yang sama -- bukan halaman kembar yang isinya sama.
 *
 * Angka disegarkan tiap 30 detik, bukan lewat websocket: pesan kontak gym datang beberapa kali
 * sehari, dan satu polling ringan lebih murah daripada kanal siaran yang harus dijaga hidup.
 */
const JEDA_MS = 30_000;

/** Tujuan klik pesan. Ditentukan panel tempat lonceng dipasang, bukan dipaku ke satu alamat:
 *  lonceng di header owner harus membuka halaman pesan DI panel owner, bukan melempar pemilik ke
 *  panel petugas. */
function halamanPesanSekarang(): string {
  return window.location.pathname.startsWith("/owner") ? "/owner/messages" : "/admin/messages";
}

export function LoncengNotifikasi() {
  const [data, setData] = useState<Lonceng | null>(null);
  const [buka, setBuka] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const halamanPesan = halamanPesanSekarang();

  const segarkan = useCallback(() => {
    fetchLonceng()
      .then(setData)
      .catch(() => {
        // Panel gagal memuat notifikasi bukan alasan menampilkan galat di header setiap 30 detik.
      });
  }, []);

  useEffect(() => {
    segarkan();
    const timer = window.setInterval(segarkan, JEDA_MS);
    return () => window.clearInterval(timer);
  }, [segarkan]);

  // Klik di luar menutup panel. Tanpa ini panel menutupi tombol lain dan tidak bisa ditutup
  // dengan keyboard.
  useEffect(() => {
    if (!buka) return;
    const tutup = (event: MouseEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) setBuka(false);
    };
    const esc = (event: KeyboardEvent) => event.key === "Escape" && setBuka(false);
    document.addEventListener("mousedown", tutup);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", tutup);
      document.removeEventListener("keydown", esc);
    };
  }, [buka]);

  const belum = data?.belum_dibaca ?? 0;
  const adaBaru = belum > 0;

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setBuka((v) => !v)}
        aria-label={adaBaru ? `${belum} pesan belum dibaca` : "Notifikasi"}
        aria-expanded={buka}
        className="relative flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Bell size={18} />
        {adaBaru && (
          <>
            {/* Denyut halus: satu-satunya gerak di header, dan hanya kalau memang ada pesan baru. */}
            <span className="absolute right-1 top-1 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
            </span>
            <span className="sr-only">{belum} pesan belum dibaca</span>
          </>
        )}
      </button>

      {buka && (
        <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-lg border border-border bg-card shadow-xl animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-bold text-foreground">Notifikasi</p>
            {adaBaru && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold tabular-nums text-primary-foreground">
                {belum} baru
              </span>
            )}
          </div>

          {!data || data.terbaru.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
              <Inbox size={22} className="text-muted-foreground" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">Belum ada pesan baru.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {data.terbaru.map((pesan) => (
                <li key={pesan.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setBuka(false);
                      navigate(`${halamanPesan}?buka=${pesan.id}`);
                    }}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50"
                  >
                    <Mail size={15} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-foreground">{pesan.nama}</span>
                      <span className="mt-0.5 block line-clamp-2 text-xs text-muted-foreground">{pesan.ringkas}</span>
                      <span className="mt-1 block text-[11px] text-muted-foreground">{pesan.kapan}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <Link
            to={halamanPesan}
            onClick={() => setBuka(false)}
            className="block border-t border-border px-4 py-3 text-center text-sm font-semibold text-foreground transition-colors hover:bg-accent/50"
          >
            Lihat semua pesan
          </Link>
        </div>
      )}
    </div>
  );
}
