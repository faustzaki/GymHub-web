import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchRevenue,
  formatRupiah,
  periodeJudul,
  periodeLabel,
  type GrupWaktu,
  type MoneyPoint,
} from "@/lib/services/owner";

/**
 * RevenuePage — uang masuk, bisa dilihat harian, mingguan, atau bulanan.
 *
 * Sumbernya baris `payments` yang benar-benar dicatat petugas (P2). Tidak ada angka karangan:
 * periode tanpa transaksi tampil Rp 0 karena memang nol transaksi (P5).
 *
 * Kenapa harian & mingguan ada: uang masuk harian itu yang dipakai membayar listrik dan gaji
 * harian. Menunggu rekap akhir bulan berarti tahu telat.
 */
export default function RevenuePage() {
  const [grup, setGrup] = useState<GrupWaktu>("bulanan");

  // Hasil disimpan bersama nama kelompok waktunya. Saat tombolnya ditekan, data lama otomatis
  // dianggap belum ada (bukan direset lewat setState di dalam effect, yang memicu render berantai).
  const [hasil, setHasil] = useState<{ grup: GrupWaktu; items: MoneyPoint[] } | null>(null);
  const [masalah, setMasalah] = useState<{ grup: GrupWaktu; pesan: string } | null>(null);

  const tren = hasil?.grup === grup ? hasil.items : null;
  const error = masalah?.grup === grup ? masalah.pesan : null;

  useEffect(() => {
    let cancelled = false;

    fetchRevenue(grup)
      .then((items) => !cancelled && setHasil({ grup, items }))
      .catch((err: unknown) => {
        if (cancelled) return;
        const e = err as { response?: { data?: { message?: string } } };
        setMasalah({
          grup,
          pesan:
            e.response?.data?.message ??
            "Uang masuk belum bisa dimuat. Periksa koneksi ke server lalu muat ulang halaman.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [grup]);

  const pilihan = PILIHAN.find((p) => p.grup === grup) ?? PILIHAN[2];
  const periodeIni = tren?.[tren.length - 1];
  const max = Math.max(1, ...(tren ?? []).map((p) => p.total ?? 0));
  const semuaNol = (tren ?? []).every((p) => !p.total);

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

      <div className="flex flex-wrap gap-2" role="group" aria-label="Kelompok waktu">
        {PILIHAN.map((p) => (
          <Button
            key={p.grup}
            size="sm"
            variant={p.grup === grup ? "default" : "outline"}
            aria-pressed={p.grup === grup}
            onClick={() => setGrup(p.grup)}
          >
            {p.label}
          </Button>
        ))}
      </div>

      {error && (
        <p role="alert" className="rounded-md border border-border bg-card p-4 text-sm text-foreground">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Angka label={pilihan.sekarang} value={periodeIni?.total} loading={!tren} />
        <Angka label="Cash" value={periodeIni?.cash} loading={!tren} />
        <Angka label="QRIS" value={periodeIni?.qris} loading={!tren} />
        <Angka
          label="Transaksi"
          value={periodeIni?.transaksi}
          satuan="transaksi"
          loading={!tren}
        />
      </div>

      <Card className="rounded-xl border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Uang masuk {pilihan.panjang}</CardTitle>
        </CardHeader>
        <CardContent>
          {!tren ? (
            <Skeleton className="h-40 w-full" />
          ) : semuaNol ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Belum ada transaksi di {pilihan.panjang}. Angka akan muncul begitu petugas mencatat
              pembayaran.
            </p>
          ) : (
            <div
              className="flex h-40 items-end gap-1"
              role="img"
              aria-label={`Grafik uang masuk ${pilihan.panjang}`}
            >
              {tren.map((point, i) => (
                <div
                  key={point.periode}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-1"
                  title={`${periodeJudul(point.periode, grup)}: ${formatRupiah(point.total ?? 0)}`}
                >
                  {point.total > 0 && (
                    <span className="text-[10px] tabular-nums text-muted-foreground">
                      {formatRupiah(point.total)}
                    </span>
                  )}
                  <div
                    className="w-full rounded-t bg-foreground"
                    style={{ height: `${Math.max(2, ((point.total ?? 0) / max) * 100)}%` }}
                  />
                  {/* 14 batang harian membuat labelnya bertumpuk: tampilkan tiap tiga hari saja. */}
                  <span className="text-[10px] uppercase tracking-tight text-muted-foreground">
                    {grup === "harian" && i % 3 !== 0 && i !== tren.length - 1
                      ? ""
                      : periodeLabel(point.periode, grup)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-xl border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Rincian per {pilihan.satuan}</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {!tren ? (
            <Skeleton className="mx-4 h-40 w-auto" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[11px] uppercase tracking-widest text-muted-foreground">
                    <th className="px-4 py-2 font-bold">{pilihan.kolom}</th>
                    <th className="px-4 py-2 text-right font-bold">Cash</th>
                    <th className="px-4 py-2 text-right font-bold">QRIS</th>
                    <th className="px-4 py-2 text-right font-bold">Transaksi</th>
                    <th className="px-4 py-2 text-right font-bold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {[...tren].reverse().map((point) => (
                    <tr key={point.periode} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 text-foreground">
                        {periodeJudul(point.periode, grup)}
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

/**
 * Pilihan kelompok waktu. `sekarang`/`satuan`/`kolom` cuma sebutan yang ikut berubah supaya
 * layarnya tetap berbahasa manusia ("Hari ini", "per minggu") tanpa if-else bertebaran.
 */
const PILIHAN: {
  grup: GrupWaktu;
  label: string;
  panjang: string;
  sekarang: string;
  satuan: string;
  kolom: string;
}[] = [
  {
    grup: "harian",
    label: "Harian",
    panjang: "14 hari terakhir",
    sekarang: "Hari ini",
    satuan: "hari",
    kolom: "Hari",
  },
  {
    grup: "mingguan",
    label: "Mingguan",
    panjang: "8 minggu terakhir",
    sekarang: "Minggu ini",
    satuan: "minggu",
    kolom: "Minggu",
  },
  {
    grup: "bulanan",
    label: "Bulanan",
    panjang: "6 bulan terakhir",
    sekarang: "Bulan ini",
    satuan: "bulan",
    kolom: "Bulan",
  },
];

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
