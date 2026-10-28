import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { STATUS_CLASS, STATUS_LABEL } from "@/pages/admin/members/status";
import {
  fetchAdminDashboard,
  formatDate,
  type AdminDashboard,
  type Member,
} from "@/lib/services/members";
import { BELUM_DIISI, formatRupiah, waLink } from "@/lib/services/owner";
import { useAngkaMemutar } from "@/hooks/useAngkaMemutar";
import {
  AlarmClock,
  ArrowRight,
  Banknote,
  MessageCircle,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";

/**
 * AdminDashboardPage — layar pertama petugas: pekerjaan MEJA hari ini.
 *
 * Bedanya dengan dashboard owner: owner melihat keadaan gym sebulan (tren, prioritas tagih,
 * harga). Petugas butuh jawaban untuk tiga pertanyaan yang muncul di depan meja:
 * berapa uang yang masuk hari ini, siapa yang masa aktifnya habis, dan siapa yang baru daftar.
 *
 * Satu permintaan untuk seluruh layar (`/admin/dashboard`) -- alasan sama dengan panel owner.
 */
export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [coba, setCoba] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchAdminDashboard()
      .then((hasil) => !cancelled && setData(hasil))
      .catch((err: unknown) => {
        if (cancelled) return;
        const e = err as { response?: { data?: { message?: string } } };
        setError(
          e.response?.data?.message ??
            "Dashboard belum bisa dimuat. Periksa koneksi ke server lalu coba lagi."
        );
      });
    return () => {
      cancelled = true;
    };
  }, [coba]);

  const memuat = !data && !error;
  // P5: tanpa transaksi hari ini DAN harga belum diisi -> uangnya tidak diketahui, bukan Rp 0.
  const uangBelumTercatat = data !== null && data.transaksi_bulan_ini === 0 && !data.harga_terisi;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold uppercase tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Keadaan meja hari ini. Tambah anggota, perpanjang, atau cari yang sudah ada di menu
            Anggota Gym.
          </p>
        </div>
        <Button asChild className="h-11 rounded bg-primary px-5 font-bold text-primary-foreground">
          <Link to="/admin/members">
            <UserPlus size={16} className="mr-2" />
            Tambah member
          </Link>
        </Button>
      </div>

      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-md border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-sm text-foreground">{error}</p>
          <Button
            variant="outline"
            className="h-11 rounded border-border"
            onClick={() => {
              setError(null);
              setCoba((n) => n + 1);
            }}
          >
            Coba lagi
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kartu
          label="Uang masuk hari ini"
          value={data ? (uangBelumTercatat ? "–" : formatRupiah(data.uang_hari_ini)) : undefined}
          catatan={
            data
              ? uangBelumTercatat
                ? BELUM_DIISI
                : `${data.transaksi_hari_ini} transaksi · cash ${formatRupiah(data.cash_hari_ini)} · qris ${formatRupiah(data.qris_hari_ini)}`
              : undefined
          }
          icon={Wallet}
          loading={memuat}
          nada="uang"
          angka={data && !uangBelumTercatat ? data.uang_hari_ini : undefined}
          uang
        />
        <Kartu
          label="Uang masuk bulan ini"
          value={data ? formatRupiah(data.uang_bulan_ini) : undefined}
          angka={data?.uang_bulan_ini}
          uang
          nada="uang"
          catatan={data ? `${data.transaksi_bulan_ini} transaksi` : undefined}
          icon={Banknote}
          loading={memuat}
        />
        <Kartu
          label="Akan berakhir"
          value={data?.hitung.akan_berakhir}
          catatan={data ? `${data.hitung.aktif} aktif dari ${data.hitung.total} anggota` : undefined}
          icon={AlarmClock}
          loading={memuat}
          href="/admin/members?status=akan_berakhir"
          nada="soon"
        />
        <Kartu
          label="Daftar hari ini"
          value={data?.baru_hari_ini}
          catatan={data ? "anggota baru masuk hari ini" : undefined}
          icon={Users}
          loading={memuat}
          nada="baru"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-xl border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Perlu dihubungi</CardTitle>
            <Link
              to="/admin/members?status=akan_berakhir"
              className="inline-flex min-h-11 items-center gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Semua <ArrowRight size={14} />
            </Link>
          </CardHeader>
          <CardContent>
            {memuat ? (
              <Skeleton className="h-40 w-full" />
            ) : !data || data.segera_habis.length === 0 ? (
              <p className="py-6 text-sm text-muted-foreground">
                Tidak ada anggota yang masa aktifnya habis dalam 7 hari ke depan.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {data.segera_habis.map((member) => (
                  <BarisMember key={member.id} member={member} tautanWa />
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Anggota terbaru</CardTitle>
            <Link
              to="/admin/members"
              className="inline-flex min-h-11 items-center gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Semua <ArrowRight size={14} />
            </Link>
          </CardHeader>
          <CardContent>
            {memuat ? (
              <Skeleton className="h-40 w-full" />
            ) : !data || data.terbaru.length === 0 ? (
              <p className="py-6 text-sm text-muted-foreground">Belum ada anggota terdaftar.</p>
            ) : (
              <ul className="divide-y divide-border">
                {data.terbaru.map((member) => (
                  <BarisMember key={member.id} member={member} />
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BarisMember({ member, tautanWa }: { member: Member; tautanWa?: boolean }) {
  const href = tautanWa ? waLink({ ...member, harga_paket: null }, null) : null;

  return (
    <li className="flex flex-wrap items-center gap-3 py-3">
      <div className="min-w-0 flex-1">
        <Link
          to={`/admin/members?q=${encodeURIComponent(member.member_code ?? "")}`}
          className="truncate text-sm font-medium text-foreground hover:underline"
        >
          {member.name ?? member.member_code}
        </Link>
        <p className="text-xs text-muted-foreground">
          {member.member_code} · {member.phone ?? "nomor belum ada"} · berakhir{" "}
          {formatDate(member.membership_expires_at)}
          {member.days_left >= 0 ? ` · ${member.days_left} hari lagi` : ` · lewat ${Math.abs(member.days_left)} hari`}
        </p>
      </div>
      <span
        className={`rounded border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STATUS_CLASS[member.status]}`}
      >
        {STATUS_LABEL[member.status]}
      </span>
      {href && (
        <Button asChild variant="outline" className="h-11 rounded border-border">
          <a href={href} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={16} className="mr-2" />
            WhatsApp
          </a>
        </Button>
      )}
    </li>
  );
}

/** Nada kartu: garis tipis + ikon berwarna, angkanya tetap netral. Sama dengan panel owner. */
const NADA: Record<string, { garis: string; teks: string }> = {
  uang: { garis: "bg-primary", teks: "text-primary" },
  soon: { garis: "bg-amber-500", teks: "text-amber-500" },
  baru: { garis: "bg-sky-500", teks: "text-sky-500" },
};

function Kartu({
  label,
  value,
  angka,
  uang,
  catatan,
  icon: Icon,
  loading,
  href,
  nada,
}: {
  label: string;
  value?: number | string;
  /** Nilai mentah untuk animasi angka; `undefined` = tidak dianimasikan. */
  angka?: number;
  uang?: boolean;
  catatan?: string;
  icon: typeof Users;
  loading: boolean;
  href?: string;
  nada?: keyof typeof NADA;
}) {
  const warna = nada ? NADA[nada] : null;
  const mentah = angka ?? (typeof value === "number" ? value : null);
  const berputar = useAngkaMemutar(mentah, label);
  const tampil = mentah !== null && berputar !== null ? (uang ? formatRupiah(berputar) : berputar) : (value ?? "–");

  const isi = (
    <Card className="relative h-full overflow-hidden rounded-xl border-border transition-colors hover:border-foreground/30">
      {warna && <span className={`absolute inset-x-0 top-0 h-0.5 ${warna.garis}`} aria-hidden="true" />}
      <CardContent className="space-y-1 p-4">
        <div className={`flex items-center gap-2 ${warna?.teks ?? "text-muted-foreground"}`}>
          <Icon size={16} />
          <span className="text-[11px] font-bold uppercase tracking-widest">{label}</span>
        </div>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <p className="text-2xl font-extrabold tracking-tight text-foreground tabular-nums">
            {tampil}
          </p>
        )}
        {catatan && <p className="text-xs text-muted-foreground">{catatan}</p>}
      </CardContent>
    </Card>
  );

  return href ? <Link to={href}>{isi}</Link> : isi;
}
