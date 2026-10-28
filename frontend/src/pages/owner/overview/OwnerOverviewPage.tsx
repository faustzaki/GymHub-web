import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { STATUS_CLASS, STATUS_LABEL } from "@/pages/admin/members/status";
import {
  BELUM_DIISI,
  fetchOwnerDashboard,
  formatRupiah,
  formatTanggal,
  monthLabel,
  waLink,
  type MoneyPoint,
  type MonthPoint,
  type OwnerSummary,
  type PriorityMember,
} from "@/lib/services/owner";
import { MessageCircle, Users, Clock, UserX, Wallet, UserPlus } from "lucide-react";
import { RevenueChart } from "./components/RevenueChart";

/**
 * OwnerOverviewPage — "bagaimana keadaan gym", bukan pekerjaan meja.
 *
 * Panel ini tidak menyalin tabel anggota: yang tampil cuma angka, grafik, dan 10 nama untuk
 * ditagih. Uang yang harga sumbernya belum diisi tampil "–" + keterangan (P5).
 */
export default function OwnerOverviewPage() {
  const [ringkasan, setRingkasan] = useState<OwnerSummary | null>(null);
  const [tren, setTren] = useState<MonthPoint[] | null>(null);
  const [uang, setUang] = useState<MoneyPoint[] | null>(null);
  const [prioritas, setPrioritas] = useState<PriorityMember[] | null>(null);
  const [namaGym, setNamaGym] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const gagal = (err: unknown) => {
      if (cancelled) return;
      const e = err as { response?: { data?: { message?: string } } };
      setError(
        e.response?.data?.message ??
          "Dashboard belum bisa dimuat. Periksa koneksi ke server lalu muat ulang halaman."
      );
    };

    // Satu permintaan untuk seluruh layar: server dev melayani satu permintaan sekaligus, jadi
    // empat permintaan berbaris membuat kartu menunggu yang paling belakang (±1,3 detik jadi ±0,1).
    fetchOwnerDashboard()
      .then((hasil) => {
        if (cancelled) return;
        setRingkasan(hasil.summary);
        setTren(hasil.growth);
        setUang(hasil.revenue);
        setPrioritas(hasil.priorities);
        // Nama gym tidak lagi bisa diubah pemilik (brand tetap "GymHub"), jadi jatuh ke situ.
        setNamaGym(hasil.settings["gym.name"] ?? "GymHub");
      })
      .catch(gagal);

    return () => {
      cancelled = true;
    };
  }, []);

  const memuat = !ringkasan && !error;
  // P5: tanpa transaksi DAN harga belum diisi -> uangnya tidak diketahui, tampil "–" bukan Rp 0.
  const uangBelumTercatat =
    ringkasan !== null && ringkasan.transaksi_bulan_ini === 0 && !ringkasan.harga_terisi;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold uppercase tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Keadaan gym bulan ini. Untuk melayani anggota, buka Panel Petugas.
          </p>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-md border border-border bg-card p-4 text-sm text-foreground">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <AngkaCard label="Aktif" value={ringkasan?.aktif} icon={Users} loading={memuat} />
        <AngkaCard
          label="Akan berakhir"
          value={ringkasan?.akan_berakhir}
          icon={Clock}
          loading={memuat}
        />
        <AngkaCard label="Nonaktif" value={ringkasan?.nonaktif} icon={UserX} loading={memuat} />
        <AngkaCard
          label="Uang masuk bulan ini"
          value={
            ringkasan ? (uangBelumTercatat ? "–" : formatRupiah(ringkasan.uang_bulan_ini)) : undefined
          }
          note={uangBelumTercatat ? BELUM_DIISI : undefined}
          icon={Wallet}
          loading={memuat}
        />
        <AngkaCard
          label="Anggota baru bulan ini"
          value={ringkasan?.baru_bulan_ini}
          icon={UserPlus}
          loading={memuat}
        />
      </div>

      <Card className="rounded-xl border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Uang masuk 12 bulan terakhir</CardTitle>
          <p className="text-sm text-muted-foreground">
            Geser kursor di atas grafik untuk melihat nominal dan jumlah transaksi tiap bulan.
          </p>
        </CardHeader>
        <CardContent>
          {!uang ? <Skeleton className="h-56 w-full" /> : <RevenueChart points={uang} />}
        </CardContent>
      </Card>

      {/* Grafik batang dari <div>: tanpa pustaka chart (aturan repo). */}
      <Card className="rounded-xl border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Anggota baru 6 bulan terakhir</CardTitle>
        </CardHeader>
        <CardContent>
          {!tren ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <div
              className="flex h-40 items-end gap-2"
              role="img"
              aria-label="Grafik anggota baru per bulan"
            >
              {tren.map((point) => {
                const nilai = point.anggota_baru ?? 0;
                const max = Math.max(1, ...tren.map((p) => p.anggota_baru ?? 0));
                return (
                  <div
                    key={point.bulan}
                    className="flex h-full flex-1 flex-col items-center justify-end gap-1"
                  >
                    <span className="text-xs font-semibold tabular-nums text-foreground">
                      {nilai}
                    </span>
                    <div
                      className="w-full rounded-t bg-foreground"
                      style={{ height: `${Math.max(2, (nilai / max) * 100)}%` }}
                    />
                    <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      {monthLabel(point.bulan)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-xl border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Prioritas Tagih</CardTitle>
          <p className="text-sm text-muted-foreground">
            Sepuluh anggota yang paling perlu dihubungi. Tombol WhatsApp membuka pesan yang sudah
            ditulis; Anda tinggal menekan kirim.
          </p>
        </CardHeader>
        <CardContent>
          {!prioritas ? (
            <Skeleton className="h-40 w-full" />
          ) : prioritas.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Tidak ada anggota yang perlu ditagih sekarang.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {prioritas.map((member) => {
                const href = waLink(member, namaGym);
                return (
                  <li key={member.id} className="flex flex-wrap items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {member.name ?? member.member_code}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.member_code} · berakhir{" "}
                        {formatTanggal(member.membership_expires_at)} ·{" "}
                        {member.days_left < 0
                          ? `lewat ${Math.abs(member.days_left)} hari`
                          : `${member.days_left} hari lagi`}
                        {" · "}
                        {formatRupiah(member.harga_paket)}
                      </p>
                    </div>
                    <span
                      className={`rounded border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STATUS_CLASS[member.status]}`}
                    >
                      {STATUS_LABEL[member.status]}
                    </span>
                    {href ? (
                      <Button asChild variant="outline" className="h-11 rounded border-border">
                        <a href={href} target="_blank" rel="noopener noreferrer">
                          <MessageCircle size={16} className="mr-2" />
                          WhatsApp
                        </a>
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">Nomor HP belum ada</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AngkaCard({
  label,
  value,
  note,
  icon: Icon,
  loading,
}: {
  label: string;
  value?: number | string;
  note?: string;
  icon: typeof Users;
  loading?: boolean;
}) {
  return (
    <Card className="rounded-xl border-border">
      <CardContent className="space-y-1 p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon size={16} />
          <span className="text-[11px] font-bold uppercase tracking-widest">{label}</span>
        </div>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <p className="text-2xl font-extrabold tracking-tight text-foreground tabular-nums">
            {value ?? "–"}
          </p>
        )}
        {note && <p className="text-xs text-muted-foreground">{note}</p>}
      </CardContent>
    </Card>
  );
}
