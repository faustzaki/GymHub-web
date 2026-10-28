import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchRevenue, formatRupiah, monthLabel, type MonthPoint } from "@/lib/services/owner";

/**
 * RevenuePage — uang masuk per bulan, dipisah cash & QRIS.
 *
 * Sumbernya baris `payments` yang benar-benar dicatat petugas (P2). Tidak ada angka karangan:
 * bulan tanpa transaksi tampil Rp 0 karena memang nol transaksi, sedangkan harga yang belum
 * diisi tampil "–" (P5).
 */
export default function RevenuePage() {
  const [tren, setTren] = useState<MonthPoint[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchRevenue()
      .then((hasil) => !cancelled && setTren(hasil))
      .catch((err: unknown) => {
        if (cancelled) return;
        const e = err as { response?: { data?: { message?: string } } };
        setError(
          e.response?.data?.message ??
            "Uang masuk belum bisa dimuat. Periksa koneksi ke server lalu muat ulang halaman."
        );
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const bulanIni = tren?.[tren.length - 1];
  const max = Math.max(1, ...(tren ?? []).map((p) => p.total ?? 0));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold uppercase tracking-tight text-foreground">
          Uang Masuk
        </h1>
        <p className="text-sm text-muted-foreground">
          Nominal yang tercatat saat petugas mendaftarkan atau memperpanjang anggota.
        </p>
      </div>

      {error && (
        <p role="alert" className="rounded-md border border-border bg-card p-4 text-sm text-foreground">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Angka label="Bulan ini" value={bulanIni?.total} loading={!tren} />
        <Angka label="Cash" value={bulanIni?.cash} loading={!tren} />
        <Angka label="QRIS" value={bulanIni?.qris} loading={!tren} />
        <Angka label="Transaksi" value={bulanIni?.transaksi} satuan="transaksi" loading={!tren} />
      </div>

      <Card className="rounded-xl border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Uang masuk 6 bulan terakhir</CardTitle>
        </CardHeader>
        <CardContent>
          {!tren ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <div
              className="flex h-40 items-end gap-2"
              role="img"
              aria-label="Grafik uang masuk per bulan"
            >
              {tren.map((point) => (
                <div
                  key={point.bulan}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-1"
                  title={`${monthLabel(point.bulan)}: ${formatRupiah(point.total ?? 0)}`}
                >
                  <span className="text-[11px] tabular-nums text-muted-foreground">
                    {point.total ? formatRupiah(point.total) : "0"}
                  </span>
                  <div
                    className="w-full rounded-t bg-foreground"
                    style={{ height: `${Math.max(2, ((point.total ?? 0) / max) * 100)}%` }}
                  />
                  <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    {monthLabel(point.bulan)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-xl border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Rincian per bulan</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {!tren ? (
            <Skeleton className="mx-4 h-40 w-auto" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[11px] uppercase tracking-widest text-muted-foreground">
                    <th className="px-4 py-2 font-bold">Bulan</th>
                    <th className="px-4 py-2 text-right font-bold">Cash</th>
                    <th className="px-4 py-2 text-right font-bold">QRIS</th>
                    <th className="px-4 py-2 text-right font-bold">Transaksi</th>
                    <th className="px-4 py-2 text-right font-bold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {[...tren].reverse().map((point) => (
                    <tr key={point.bulan} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 text-foreground">
                        {monthLabel(point.bulan)} {point.bulan.slice(0, 4)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-foreground">
                        {formatRupiah(point.cash ?? 0)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-foreground">
                        {formatRupiah(point.qris ?? 0)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-foreground">
                        {point.transaksi ?? 0}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums text-foreground">
                        {formatRupiah(point.total ?? 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Hanya transaksi yang dicatat petugas yang masuk ke sini. Kalau seorang anggota
        didaftarkan tanpa nominal, uangnya tidak dihitung &mdash; catat ulang saat pembayaran
        benar-benar diterima.
      </p>
    </div>
  );
}

function Angka({
  label,
  value,
  satuan,
  loading,
}: {
  label: string;
  value?: number;
  satuan?: string;
  loading: boolean;
}) {
  return (
    <Card className="rounded-xl border-border">
      <CardContent className="space-y-1 p-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <p className="text-2xl font-extrabold tracking-tight text-foreground tabular-nums">
            {satuan ? (value ?? 0) : formatRupiah(value ?? 0)}
            {satuan && <span className="ml-1 text-sm font-normal text-muted-foreground">{satuan}</span>}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
