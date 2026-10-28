import { Fragment, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchRevenue,
  fetchRevenueDetail,
  formatRupiah,
  periodeJudul,
  periodeLabel,
  type GrupWaktu,
  type MoneyPoint,
  type RevenueDetail,
} from "@/lib/services/owner";
import { useAngkaMemutar } from "@/hooks/useAngkaMemutar";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * RevenuePage — uang masuk, bisa dilihat harian, mingguan, atau bulanan.
 *
 * Sumbernya baris `payments` yang benar-benar dicatat petugas (P2). Tidak ada angka karangan:
 * periode tanpa transaksi tampil Rp 0 karena memang nol transaksi (P5).
 *
 * Kenapa harian & mingguan ada: uang masuk harian itu yang dipakai membayar listrik dan gaji
 * harian. Menunggu rekap akhir bulan berarti tahu telat.
 *
 * Warna (permintaan josjis 2026-10-29): CASH hijau, QRIS biru, total memakai aksen merah brand.
 * Ini warna SEMANTIK, bukan palet baru -- DESIGN.md mengizinkan hijau sukses/penanda metode
 * selama tidak dipakai untuk body text. Nominal tetap terbaca sebagai teks netral; warnanya
 * menempel di batang dan label metode, bukan di angka.
 */

/** Baris per halaman tabel rincian. Di atas 10 baris, tabel jadi daftar panjang tanpa ujung. */
const PER_HALAMAN = 10;

export default function RevenuePage() {
  const [grup, setGrup] = useState<GrupWaktu>("bulanan");

  // Hasil disimpan bersama nama kelompok waktunya. Saat tombolnya ditekan, data lama otomatis
  // dianggap belum ada (bukan direset lewat setState di dalam effect, yang memicu render berantai).
  const [hasil, setHasil] = useState<{ grup: GrupWaktu; items: MoneyPoint[] } | null>(null);
  const [masalah, setMasalah] = useState<{ grup: GrupWaktu; pesan: string } | null>(null);

  // Satu periode yang sedang dibuka, disimpan BERSAMA kelompok waktunya. Saat tombol kelompok
  // ditekan, baris terbuka otomatis dianggap tertutup tanpa perlu setState di dalam effect.
  const [buka, setBuka] = useState<{ grup: GrupWaktu; periode: string } | null>(null);
  const [rincian, setRincian] = useState<{
    periode: string;
    data?: RevenueDetail;
    error?: string;
  } | null>(null);

  // Halaman tabel rincian, juga disimpan bersama kelompok waktunya: pindah dari "bulanan hal. 3"
  // ke "harian" tidak boleh mendarat di halaman yang tidak ada.
  const [halaman, setHalaman] = useState<{ grup: GrupWaktu; nomor: number } | null>(null);

  const tren = hasil?.grup === grup ? hasil.items : null;
  const error = masalah?.grup === grup ? masalah.pesan : null;
  const periodeTerbuka = buka?.grup === grup ? buka.periode : null;
  const halamanIni = halaman?.grup === grup ? halaman.nomor : 1;

  const gantiBuka = (periode: string) => {
    if (periodeTerbuka === periode) {
      setBuka(null);
      return;
    }

    setBuka({ grup, periode });
    // Rincian periode yang sudah pernah dimuat dipakai lagi -- menutup lalu membuka baris yang
    // sama tidak perlu memanggil server untuk kedua kalinya.
    if (rincian?.periode === periode) return;

    fetchRevenueDetail(grup, periode)
      .then((data) => setRincian({ periode, data }))
      .catch((err: unknown) => {
        const e = err as { response?: { data?: { message?: string } } };
        setRincian({
          periode,
          error:
            e.response?.data?.message ??
            "Rincian transaksi belum bisa dimuat. Periksa koneksi ke server.",
        });
      });
  };

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

  // Terbaru di atas. Dipecah per halaman supaya 24 baris bulanan tidak jadi satu daftar panjang.
  const terbalik = useMemo(() => [...(tren ?? [])].reverse(), [tren]);
  const totalHalaman = Math.max(1, Math.ceil(terbalik.length / PER_HALAMAN));
  const potong = terbalik.slice((halamanIni - 1) * PER_HALAMAN, halamanIni * PER_HALAMAN);

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
        <Angka label={pilihan.sekarang} value={periodeIni?.total} loading={!tren} kunci={`${grup}-total`} />
        <Angka label="Cash" value={periodeIni?.cash} loading={!tren} kunci={`${grup}-cash`} nada="cash" />
        <Angka label="QRIS" value={periodeIni?.qris} loading={!tren} kunci={`${grup}-qris`} nada="qris" />
        <Angka
          label="Transaksi"
          value={periodeIni?.transaksi}
          satuan="transaksi"
          loading={!tren}
          kunci={`${grup}-trx`}
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
              {tren.map((point) => (
                <div
                  key={point.periode}
                  className="group/batang flex h-full flex-1 flex-col items-center justify-end gap-1"
                  title={`${periodeJudul(point.periode, grup)}: ${formatRupiah(point.total ?? 0)}`}
                >
                  {point.total > 0 && (
                    <span className="text-[10px] tabular-nums text-muted-foreground">
                      {formatRupiah(point.total)}
                    </span>
                  )}
                  {/* Batang dipecah dua: porsi cash di bawah, QRIS di atas. Satu batang abu-abu
                      menyembunyikan cara bayar, padahal itu yang ditanya pemilik. */}
                  <div
                    className="flex w-full flex-col justify-end overflow-hidden rounded-t transition-all duration-300 ease-out group-hover/batang:opacity-90"
                    style={{ height: `${Math.max(2, ((point.total ?? 0) / max) * 100)}%` }}
                  >
                    <div
                      className="w-full bg-sky-500/90"
                      style={{
                        height: `${point.total ? ((point.qris ?? 0) / point.total) * 100 : 0}%`,
                      }}
                    />
                    <div
                      className="w-full flex-1 bg-emerald-500/90"
                      style={{ minHeight: point.cash ? 2 : 0 }}
                    />
                  </div>
                  {/* Semua label tanggal tampil (permintaan josjis 2026-10-29): dulu tiap tiga
                      hari, jadi orang tidak bisa tahu batang mana tanggal berapa. Teksnya
                      dibuat satu baris `whitespace-nowrap` + 9px supaya 14 label masih muat. */}
                  <span className="max-w-full truncate whitespace-nowrap text-[9px] uppercase tracking-tight text-muted-foreground">
                    {periodeLabel(point.periode, grup)}
                  </span>
                </div>
              ))}
            </div>
          )}
          {tren && !semuaNol && (
            <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-sm bg-emerald-500" aria-hidden="true" /> Cash
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-sm bg-sky-500" aria-hidden="true" /> QRIS
              </span>
              <span>Tinggi batang = nominal. Porsi warna = cara bayarnya.</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-xl border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Rincian per {pilihan.satuan}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Klik satu baris untuk melihat transaksi di dalamnya &mdash; siapa, kapan, dan berapa.
          </p>
        </CardHeader>
        <CardContent className="px-0">
          {!tren ? (
            <Skeleton className="mx-4 h-40 w-auto" />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-[11px] uppercase tracking-widest text-muted-foreground">
                      <th className="w-8 px-2 py-2 font-bold">
                        <span className="sr-only">Buka rincian</span>
                      </th>
                      <th className="px-4 py-2 font-bold">{pilihan.kolom}</th>
                      <th className="px-4 py-2 text-right font-bold text-emerald-500">Cash</th>
                      <th className="px-4 py-2 text-right font-bold text-sky-500">QRIS</th>
                      <th className="px-4 py-2 text-right font-bold">Transaksi</th>
                      <th className="px-4 py-2 text-right font-bold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {potong.map((point) => {
                      const terbuka = periodeTerbuka === point.periode;
                      const tanpaTransaksi = (point.transaksi ?? 0) === 0;

                      return (
                        <Fragment key={point.periode}>
                          <tr
                            // Baris tanpa transaksi tetap bisa diklik: isinya kosong, dan itu
                            // jawaban yang sah ("memang tidak ada yang bayar hari itu").
                            onClick={() => gantiBuka(point.periode)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                gantiBuka(point.periode);
                              }
                            }}
                            tabIndex={0}
                            role="button"
                            aria-expanded={terbuka}
                            className={`cursor-pointer border-b border-border last:border-0 transition-colors hover:bg-accent/40 focus-visible:bg-accent/40 focus-visible:outline-none ${
                              terbuka ? "bg-accent/30" : ""
                            }`}
                          >
                            <td className="px-2 py-3 text-muted-foreground">
                              <ChevronDown
                                size={15}
                                className={`transition-transform duration-200 ${terbuka ? "" : "-rotate-90"}`}
                              />
                            </td>
                            <td className="px-4 py-3 text-foreground">
                              {periodeJudul(point.periode, grup)}
                            </td>
                            {/* Nominal diwarnai per cara bayar: kolom Cash dan QRIS gampang
                                dibedakan tanpa membaca judulnya (permintaan josjis 2026-10-29). */}
                            <td className="px-4 py-3 text-right tabular-nums text-emerald-500/90">
                              {formatRupiah(point.cash ?? 0)}
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums text-sky-500/90">
                              {formatRupiah(point.qris ?? 0)}
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums text-foreground">
                              {point.transaksi ?? 0}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold tabular-nums text-foreground">
                              {formatRupiah(point.total ?? 0)}
                            </td>
                          </tr>

                          {terbuka && (
                            // `animate-in` + slide: rincian tidak muncul mendadak dan menggeser
                            // baris di bawahnya tanpa aba-aba. 180ms cukup untuk mata mengikuti.
                            <tr className="border-b border-border bg-card/60">
                              <td />
                              <td colSpan={5} className="px-4 py-3">
                                <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                                  {tanpaTransaksi ? (
                                    <p className="text-sm text-muted-foreground">
                                      Tidak ada transaksi di {periodeJudul(point.periode, grup)}.
                                    </p>
                                  ) : rincian && rincian.periode === point.periode && rincian.error ? (
                                    <p role="alert" className="text-sm text-foreground">
                                      {rincian.error}
                                    </p>
                                  ) : rincian && rincian.periode === point.periode && rincian.data ? (
                                    <RincianTransaksi data={rincian.data} />
                                  ) : (
                                    <Skeleton className="h-20 w-full" />
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {totalHalaman > 1 && (
                <div className="flex items-center justify-between gap-3 px-4 pt-4">
                  <p className="text-sm text-muted-foreground">
                    Hal. {halamanIni} dari {totalHalaman} · {terbalik.length} {pilihan.satuan}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="h-10 rounded border-border"
                      disabled={halamanIni <= 1}
                      onClick={() => setHalaman({ grup, nomor: Math.max(1, halamanIni - 1) })}
                    >
                      <ChevronLeft size={16} className="mr-1" />
                      Sebelumnya
                    </Button>
                    <Button
                      variant="outline"
                      className="h-10 rounded border-border"
                      disabled={halamanIni >= totalHalaman}
                      onClick={() =>
                        setHalaman({ grup, nomor: Math.min(totalHalaman, halamanIni + 1) })
                      }
                    >
                      Berikutnya
                      <ChevronRight size={16} className="ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
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
 * Isi satu periode yang dibuka: daftar transaksi, bukan ringkasan.
 *
 * Kolomnya dipilih supaya pertanyaan "siapa yang bayar tadi" terjawab tanpa membuka panel
 * petugas: nama + kode anggota, jenis (pendaftaran/perpanjangan) + durasi, cara bayar, nominal,
 * dan siapa petugas yang mencatatnya.
 */
function RincianTransaksi({ data }: { data: RevenueDetail }) {
  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-widest text-muted-foreground">
              <th className="py-1.5 pr-3 font-bold">Anggota</th>
              <th className="py-1.5 pr-3 font-bold">Jenis</th>
              <th className="py-1.5 pr-3 font-bold">Bayar</th>
              <th className="py-1.5 pr-3 text-right font-bold">Nominal</th>
              <th className="py-1.5 font-bold">Dicatat</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((row) => (
              <tr key={row.id} className="border-t border-border/60">
                <td className="py-2 pr-3">
                  <p className="text-foreground">{row.nama ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">{row.member_code ?? "—"}</p>
                </td>
                <td className="py-2 pr-3 text-foreground">
                  {row.kind}
                  {row.months ? ` · ${row.months} bln` : ""}
                </td>
                <td className="py-2 pr-3">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      row.method === "qris"
                        ? "bg-sky-500/15 text-sky-500"
                        : "bg-emerald-500/15 text-emerald-500"
                    }`}
                  >
                    {row.method}
                  </span>
                </td>
                <td className="py-2 pr-3 text-right font-semibold tabular-nums text-foreground">
                  {formatRupiah(row.amount)}
                </td>
                <td className="py-2 text-xs text-muted-foreground">
                  {row.dicatat ? row.dicatat.slice(11, 16) : "—"}
                  {row.oleh ? ` · ${row.oleh}` : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        {data.jumlah} transaksi · total {formatRupiah(data.total)}
        {data.dipotong ? " · hanya 500 transaksi pertama yang ditampilkan" : ""}
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

/**
 * Satu kartu angka. Nominalnya berputar naik saat pindah halaman/kelompok waktu (permintaan
 * josjis 2026-10-29). `nada` hanya mewarnai garis atas kartu, bukan angkanya -- nominal tetap
 * teks netral supaya terbaca.
 */
function Angka({
  label,
  value,
  satuan,
  loading,
  kunci,
  nada,
}: {
  label: string;
  value?: number;
  satuan?: string;
  loading: boolean;
  kunci?: string;
  nada?: "cash" | "qris";
}) {
  const berputar = useAngkaMemutar(value ?? null, kunci);
  const garis =
    nada === "cash" ? "bg-emerald-500" : nada === "qris" ? "bg-sky-500" : "bg-primary";

  return (
    <Card className="relative overflow-hidden rounded-xl border-border">
      <span className={`absolute inset-x-0 top-0 h-0.5 ${garis}`} aria-hidden="true" />
      <CardContent className="space-y-1 p-4">
        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {nada && <span className={`size-1.5 rounded-full ${garis}`} aria-hidden="true" />}
          {label}
        </p>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <p className="text-2xl font-extrabold tracking-tight text-foreground tabular-nums">
            {satuan ? (berputar ?? 0) : formatRupiah(berputar ?? 0)}
            {satuan && <span className="ml-1 text-sm font-normal text-muted-foreground">{satuan}</span>}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
