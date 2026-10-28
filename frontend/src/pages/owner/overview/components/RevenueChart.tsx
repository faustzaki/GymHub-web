import { useMemo, useState } from "react";
import { formatRupiah, monthLabel, type MoneyPoint } from "@/lib/services/owner";

/**
 * RevenueChart — uang masuk 12 bulan, digambar seperti grafik harga di terminal trading.
 *
 * Kenapa begini dan bukan batang biasa: yang dicari pemilik bukan "bulan mana paling tinggi",
 * tapi "sedang naik atau turun". Garis + area membuat arah terbaca sekali lihat; batang membuat
 * mata membandingkan tinggi, bukan lereng.
 *
 * Yang SENGAJA tidak ditiru dari chart trading: candlestick (open/high/low/close). Angka kita
 * cuma satu per bulan — memecahnya jadi empat batang berarti mengarang high/low yang tidak pernah
 * ada. Yang ditiru cuma bahasa visualnya: kisi tipis, sumbu kanan, garis putus-putus di nilai
 * terakhir, penanda titik terakhir, dan balok volume di bawah.
 *
 * Digambar dengan SVG langsung, tanpa pustaka chart: `recharts` sudah ada di package.json tapi
 * tidak pernah dirujuk, dan satu grafik tidak sepadan dengan 400 KB tambahan.
 */

const W = 900;
const H = 300;
const PAD = { atas: 18, kanan: 74, bawah: 34, kiri: 14 };
const TINGGI_VOLUME = 26;

/** 1_250_000 -> "1,25 jt". Sumbu uang tidak perlu tiga angka nol. */
function ringkasUang(nilai: number): string {
  if (nilai >= 1_000_000) {
    const juta = nilai / 1_000_000;
    return `${juta.toFixed(juta >= 10 ? 0 : 1).replace(".", ",")} jt`;
  }
  if (nilai >= 1_000) return `${Math.round(nilai / 1_000)} rb`;
  return String(Math.round(nilai));
}

export function RevenueChart({ points }: { points: MoneyPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);

  const { jalur, area, koordinat, maxTotal, maxTransaksi, langkah } = useMemo(() => {
    const n = points.length;
    const lebarPlot = W - PAD.kiri - PAD.kanan;
    const tinggiPlot = H - PAD.atas - PAD.bawah - TINGGI_VOLUME - 10;
    // Puncak dibulatkan ke atas supaya garis tertinggi tidak menempel di tepi atas.
    const puncak = Math.max(1, ...points.map((p) => p.total ?? 0));

    const titik = points.map((p, i) => ({
      x: PAD.kiri + (n <= 1 ? lebarPlot / 2 : (i / (n - 1)) * lebarPlot),
      y: PAD.atas + (1 - (p.total ?? 0) / puncak) * tinggiPlot,
      volume:
        PAD.atas +
        tinggiPlot +
        10 +
        (1 - (p.transaksi ?? 0) / Math.max(1, ...points.map((q) => q.transaksi ?? 0))) * TINGGI_VOLUME,
      point: p,
    }));

    const garis = titik.map((t, i) => `${i === 0 ? "M" : "L"}${t.x.toFixed(1)},${t.y.toFixed(1)}`).join(" ");
    const tutup =
      titik.length > 0
        ? `${garis} L${titik[titik.length - 1].x.toFixed(1)},${(PAD.atas + tinggiPlot).toFixed(1)} L${titik[0].x.toFixed(1)},${(PAD.atas + tinggiPlot).toFixed(1)} Z`
        : "";

    return {
      jalur: garis,
      area: tutup,
      koordinat: titik,
      maxTotal: puncak,
      maxTransaksi: Math.max(1, ...points.map((p) => p.transaksi ?? 0)),
      langkah: n <= 1 ? lebarPlot : lebarPlot / (n - 1),
    };
  }, [points]);

  if (points.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Belum ada data uang masuk.</p>;
  }

  const terakhir = koordinat[koordinat.length - 1];
  const aktif = hover !== null ? koordinat[hover] : null;
  const dasarPlot = PAD.atas + (H - PAD.atas - PAD.bawah - TINGGI_VOLUME - 10);

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label="Grafik uang masuk per bulan"
        onMouseLeave={() => setHover(null)}
        onMouseMove={(event) => {
          // Posisi kursor dipetakan ke viewBox, bukan ke piksel layar: SVG-nya diskalakan
          // mengikuti lebar kartu, jadi koordinat layar tidak sama dengan koordinat gambar.
          const kotak = event.currentTarget.getBoundingClientRect();
          const x = ((event.clientX - kotak.left) / kotak.width) * W;
          const indeks = Math.round((x - PAD.kiri) / langkah);
          setHover(Math.max(0, Math.min(koordinat.length - 1, indeks)));
        }}
      >
        <defs>
          <linearGradient id="isiUang" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Kisi + sumbu kanan: angka uang dibaca di kanan seperti terminal, bukan di kiri. */}
        {[0, 0.25, 0.5, 0.75, 1].map((porsi) => {
          const y = PAD.atas + porsi * (dasarPlot - PAD.atas);
          const nilai = maxTotal * (1 - porsi);
          return (
            <g key={porsi}>
              <line
                x1={PAD.kiri}
                x2={W - PAD.kanan}
                y1={y}
                y2={y}
                className="stroke-border"
                strokeDasharray={porsi === 1 ? undefined : "3 4"}
                strokeWidth={1}
              />
              <text
                x={W - PAD.kanan + 8}
                y={y + 4}
                className="fill-muted-foreground text-[11px] tabular-nums"
              >
                {ringkasUang(nilai)}
              </text>
            </g>
          );
        })}

        <g className="text-foreground">
          <path d={area} fill="url(#isiUang)" />
          <path d={jalur} fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" />
        </g>

        {/* Balok volume = jumlah transaksi. Tinggi, bukan uang: yang dicari di sini adalah
            "ramai atau sepi", dan itu tidak selalu sejalan dengan nominalnya. */}
        {koordinat.map((t) => (
          <rect
            key={`v-${t.point.periode}`}
            x={t.x - Math.min(9, langkah * 0.32)}
            y={t.volume}
            width={Math.min(18, langkah * 0.64)}
            height={Math.max(1, PAD.atas + (H - PAD.atas - PAD.bawah) - t.volume)}
            className="fill-foreground"
            opacity={hover === null || hover === koordinat.indexOf(t) ? 0.42 : 0.2}
          />
        ))}

        {/* Garis putus-putus di nilai terakhir + penanda: kebiasaan chart harga. */}
        <line
          x1={PAD.kiri}
          x2={W - PAD.kanan}
          y1={terakhir.y}
          y2={terakhir.y}
          className="stroke-foreground"
          strokeDasharray="4 4"
          strokeWidth={1}
          opacity={0.45}
        />
        <circle cx={terakhir.x} cy={terakhir.y} r={4} className="fill-foreground" />

        {/* Label bulan: 12 titik masih longgar di lebar 900 (jarak ~70px), jadi semuanya tampil.
            Dulu dua bulan sekali -- hasilnya cuma 7 label untuk grafik yang judulnya "12 bulan". */}
        {koordinat.map((t, i) => (
          <text
            key={`x-${t.point.periode}`}
            x={t.x}
            y={H - PAD.bawah + 16}
            textAnchor={i === 0 ? "start" : i === koordinat.length - 1 ? "end" : "middle"}
            className="fill-muted-foreground text-[10px] uppercase"
          >
            {monthLabel(t.point.periode)}
          </text>
        ))}

        {aktif && (
          <>
            <line
              x1={aktif.x}
              x2={aktif.x}
              y1={PAD.atas}
              y2={H - PAD.bawah}
              className="stroke-foreground"
              strokeDasharray="2 3"
              strokeWidth={1}
              opacity={0.5}
            />
            <circle cx={aktif.x} cy={aktif.y} r={4.5} className="fill-foreground" />
          </>
        )}
      </svg>

      {/* Nilai terakhir ditempel di ujung garis (di DALAM plot), bukan di gutter sumbu kanan:
          di gutter ia menimpa label 13 jt/6,6 jt begitu nilainya berdekatan. */}
      <span
        className="pointer-events-none absolute rounded bg-foreground px-2 py-0.5 text-[11px] font-bold tabular-nums text-background"
        style={{
          left: `${((W - PAD.kanan) / W) * 100}%`,
          top: `${(terakhir.y / H) * 100}%`,
          transform: "translate(calc(-100% - 6px), -50%)",
        }}
      >
        {ringkasUang(terakhir.point.total ?? 0)}
      </span>

      {aktif && (
        <div
          className="pointer-events-none absolute z-10 min-w-40 rounded-md border border-border bg-card p-2.5 text-xs shadow-lg"
          style={{
            // Tooltip dijauhkan dari tepi supaya tidak terpotong kartu di titik paling kiri/kanan.
            left: `${Math.min(72, Math.max(0, (aktif.x / W) * 100))}%`,
            top: 0,
          }}
        >
          <p className="font-bold uppercase tracking-wide text-foreground">
            {monthLabel(aktif.point.periode)} {aktif.point.periode.slice(0, 4)}
          </p>
          <p className="mt-1 tabular-nums text-foreground">{formatRupiah(aktif.point.total ?? 0)}</p>
          <p className="tabular-nums text-muted-foreground">
            {aktif.point.transaksi ?? 0} transaksi · cash {formatRupiah(aktif.point.cash ?? 0)}
          </p>
          <p className="tabular-nums text-muted-foreground">qris {formatRupiah(aktif.point.qris ?? 0)}</p>
        </div>
      )}

      <p className="mt-1 text-[11px] text-muted-foreground">
        Garis = uang masuk · balok di bawah = jumlah transaksi · puncak {formatRupiah(maxTotal)}
        {maxTransaksi > 0 ? ` · ${maxTransaksi} transaksi terbanyak` : ""}
      </p>
    </div>
  );
}
