import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserX, AlarmClock, CalendarClock, ArrowRight } from "lucide-react";
import { useMembers } from "@/hooks/useMembers";
import { fetchMembers, formatDate, type Member } from "@/lib/services/members";

interface Counts {
  aktif: number;
  akan_berakhir: number;
  kadaluarsa: number;
  nonaktif: number;
}

/**
 * AdminOverviewPage — ringkasan operasional dari data nyata.
 *
 * Angka di sini diambil dari `meta.total` setiap filter status pada endpoint yang sama
 * dengan layar /admin/members. Tidak ada pembayaran (PRD-001 K1b), jadi tidak ada kartu
 * pendapatan.
 */
export default function AdminOverviewPage() {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [recent, setRecent] = useState<Member[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const { items, isLoading } = useMembers();

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetchMembers({ status: "aktif", per_page: 1 }),
      fetchMembers({ status: "akan_berakhir", per_page: 1 }),
      fetchMembers({ status: "kadaluarsa", per_page: 1 }),
      fetchMembers({ status: "nonaktif", per_page: 1 }),
      fetchMembers({ per_page: 5 }),
    ])
      .then(([aktif, akanBerakhir, kadaluarsa, nonaktif, terbaru]) => {
        if (cancelled) return;
        setCounts({
          aktif: aktif.meta.total,
          akan_berakhir: akanBerakhir.meta.total,
          kadaluarsa: kadaluarsa.meta.total,
          nonaktif: nonaktif.meta.total,
        });
        setRecent(terbaru.items);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const stats = useMemo(
    () => [
      { label: "Member aktif", value: counts?.aktif, icon: Users, href: "/admin/members?status=aktif" },
      { label: "Akan berakhir (≤7 hari)", value: counts?.akan_berakhir, icon: AlarmClock, href: "/admin/members?status=akan_berakhir" },
      { label: "Kadaluarsa", value: counts?.kadaluarsa, icon: CalendarClock, href: "/admin/members?status=kadaluarsa" },
      { label: "Nonaktif", value: counts?.nonaktif, icon: UserX, href: "/admin/members?status=nonaktif" },
    ],
    [counts]
  );

  const daftar = recent ?? items.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Ringkasan Member</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Keadaan masa aktif seluruh member hari ini.
        </p>
      </div>

      {failed && (
        <div role="alert" className="flex flex-col gap-3 rounded-md border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-foreground">Ringkasan gagal dimuat. Periksa koneksi ke server.</p>
          <button
            type="button"
            onClick={() => {
              setFailed(false);
              setReloadKey((key) => key + 1);
            }}
            className="h-11 rounded border border-border px-4 text-sm text-foreground hover:bg-accent"
          >
            Coba lagi
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.href}>
            <Card className="h-full border-border/50 transition-colors hover:border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                    {stat.value === undefined ? (
                      <Skeleton className="h-8 w-14" />
                    ) : (
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                    <stat.icon size={20} className="text-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold">Masa aktif terdekat berakhir</CardTitle>
          <Link
            to="/admin/members"
            className="inline-flex min-h-11 items-center gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Semua member <ArrowRight size={14} />
          </Link>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading && daftar.length === 0 && <Skeleton className="h-14 w-full" />}
          {!isLoading && daftar.length === 0 && (
            <p className="text-sm text-muted-foreground">Belum ada member terdaftar.</p>
          )}
          {daftar.map((member) => (
            <Link
              key={member.id}
              to={`/admin/members?q=${encodeURIComponent(member.member_code ?? "")}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-border/50 p-3 transition-colors hover:border-border"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{member.name}</p>
                <p className="text-xs text-muted-foreground">
                  {member.member_code ?? "—"} · {member.phone ?? "—"}
                </p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatDate(member.membership_expires_at)}
              </span>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
