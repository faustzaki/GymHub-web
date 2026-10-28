import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PLAN_OPTIONS,
  fetchMember,
  formatDate,
  planLabel,
  previewExpiry,
  renewMember,
  toISODate,
  setMemberActive,
  type Member,
  type MemberDetail,
  type PlanMonths,
} from "@/lib/services/members";
import { STATUS_CLASS, STATUS_LABEL } from "./status";
import { MonthStepper } from "./MonthStepper";

interface Props {
  memberId: number | null;
  onClose: () => void;
  /** Member berubah (perpanjang / nonaktif / aktif kembali) — daftar ikut diperbarui. */
  onChanged: (member: Member) => void;
}

/**
 * MemberDetail — panel detail + perpanjang + nonaktif/aktifkan (PRD US-3, US-4).
 *
 * Aturan perpanjangan ditulis di panel supaya admin tahu dasar hitungannya.
 */
export function MemberDetail({ memberId, onClose, onChanged }: Props) {
  const [detail, setDetail] = useState<MemberDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<PlanMonths | "toggle" | null>(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  // Durasi untuk mode "atur sendiri": dikumpulkan dulu, baru dikonfirmasi.
  const [customMonths, setCustomMonths] = useState(3);
  const [showCustom, setShowCustom] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (memberId === null) return;
    let cancelled = false;
    setDetail(null);
    setError(null);
    setConfirmDeactivate(false);

    fetchMember(memberId)
      .then((data) => {
        if (cancelled) return;
        setDetail(data);
        // Mode susun-sendiri mulai dari durasi yang terakhir dipakai member ini.
        setCustomMonths(data.plan_months ?? 3);
        setShowCustom(false);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err.response?.data?.message ??
              "Detail member gagal dimuat. Tutup panel lalu coba buka lagi."
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [memberId, reloadKey]);

  /**
   * Dasar hitung perpanjangan, sama dengan aturan backend: masih aktif -> dari tanggal berakhir
   * lama (sisa hari tidak hangus); sudah lewat -> dari hari ini. Dipakai untuk pratinjau saja.
   */
  const dasarPerpanjang =
    detail?.is_active && detail.membership_expires_at
      ? new Date(detail.membership_expires_at)
      : new Date();

  const perpanjang = async (months: PlanMonths) => {
    if (!detail || busy) return;
    setBusy(months);
    try {
      const updated = await renewMember(detail.id, months);
      toast.success("Masa aktif diperpanjang", {
        description: `Berakhir ${formatDate(updated.membership_expires_at)}.`,
      });
      onChanged(updated);
      setReloadKey((key) => key + 1);
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error("Perpanjangan gagal", {
        description: e.response?.data?.message ?? "Periksa koneksi lalu coba lagi.",
      });
    } finally {
      setBusy(null);
    }
  };

  const ubahStatus = async (active: boolean) => {
    if (!detail || busy) return;
    setBusy("toggle");
    try {
      const updated = await setMemberActive(detail.id, active);
      toast.success(active ? "Member diaktifkan kembali" : "Member dinonaktifkan");
      onChanged(updated);
      setConfirmDeactivate(false);
      setReloadKey((key) => key + 1);
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(active ? "Gagal mengaktifkan" : "Gagal menonaktifkan", {
        description: e.response?.data?.message ?? "Periksa koneksi lalu coba lagi.",
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <Sheet open={memberId !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto border-border bg-background sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Detail Member</SheetTitle>
          <SheetDescription>
            Masa aktif, riwayat perpanjangan, dan status akses login.
          </SheetDescription>
        </SheetHeader>

        {error && (
          <div role="alert" className="mt-4 space-y-2 rounded-md border border-border bg-card p-3">
            <p className="text-sm text-foreground">{error}</p>
          </div>
        )}

        {!error && !detail && (
          <div className="mt-4 space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {detail && (
          <div className="mt-4 space-y-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-foreground">{detail.name}</h3>
                <Badge variant="outline" className={STATUS_CLASS[detail.status]}>
                  {STATUS_LABEL[detail.status]}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{detail.phone}</p>
              <p className="text-xs text-muted-foreground">{detail.member_code ?? "—"}</p>
            </div>

            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Mulai</dt>
                <dd className="text-foreground">{formatDate(detail.membership_started_at)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Berakhir</dt>
                <dd className="text-foreground">{formatDate(detail.membership_expires_at)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Sisa hari</dt>
                <dd className="text-foreground">{detail.days_left}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Akses login</dt>
                <dd className="text-foreground">{detail.has_login ? "Sudah ada" : "Belum punya akses login"}</dd>
              </div>
            </dl>

            <Separator />

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Perpanjang</p>
              <p className="text-xs text-muted-foreground">
                Masih aktif: ditambahkan dari tanggal berakhir lama, sisa waktu tidak dipotong.
                Sudah lewat tenggat: dihitung dari hari ini.
              </p>
              {/* Tiap tombol sudah menyebut tanggal berakhir barunya, jadi tidak ada
                  perpanjangan yang diklik tanpa tahu hasilnya. */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {PLAN_OPTIONS.map((months) => (
                  <Button
                    key={months}
                    variant="outline"
                    className="h-auto flex-col items-start gap-0.5 rounded border-border py-2"
                    disabled={busy !== null}
                    onClick={() => perpanjang(months)}
                  >
                    <span className="text-sm">{busy === months ? "..." : `+${planLabel(months)}`}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {formatDate(toISODate(previewExpiry(months, dasarPerpanjang)))}
                    </span>
                  </Button>
                ))}
              </div>

              <Button
                variant="ghost"
                className="h-9 rounded px-2 text-xs"
                disabled={busy !== null}
                onClick={() => setShowCustom((nilai) => !nilai)}
              >
                {showCustom ? "Tutup susun sendiri" : "Atur sendiri (mis. 2 atau 7 bulan)"}
              </Button>

              {showCustom && (
                <div className="space-y-2 rounded-md border border-border bg-card p-3">
                  <MonthStepper value={customMonths} onChange={setCustomMonths} />
                  <p className="text-sm text-muted-foreground">
                    Total {planLabel(customMonths)} · berakhir{" "}
                    <span className="text-foreground">
                      {formatDate(toISODate(previewExpiry(customMonths, dasarPerpanjang)))}
                    </span>
                  </p>
                  <Button
                    className="h-11 w-full rounded"
                    disabled={busy !== null}
                    onClick={() => perpanjang(customMonths)}
                  >
                    {busy === customMonths ? "Menyimpan..." : `Konfirmasi +${planLabel(customMonths)}`}
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Status keanggotaan</p>
              {detail.is_active ? (
                confirmDeactivate ? (
                  <div className="space-y-2 rounded-md border border-border bg-card p-3">
                    <p className="text-sm text-foreground">
                      Nonaktifkan {detail.name}? Masa aktifnya masih sampai{" "}
                      {formatDate(detail.membership_expires_at)}.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="h-11 flex-1 rounded border-border"
                        onClick={() => setConfirmDeactivate(false)}
                      >
                        Batal
                      </Button>
                      <Button
                        className="h-11 flex-1 rounded bg-primary text-primary-foreground"
                        disabled={busy !== null}
                        onClick={() => ubahStatus(false)}
                      >
                        {busy === "toggle" ? "Memproses..." : "Ya, nonaktifkan"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="h-11 w-full rounded border-border"
                    onClick={() => setConfirmDeactivate(true)}
                  >
                    Nonaktifkan
                  </Button>
                )
              ) : (
                <Button
                  variant="outline"
                  className="h-11 w-full rounded border-border"
                  disabled={busy !== null}
                  onClick={() => ubahStatus(true)}
                >
                  {busy === "toggle" ? "Memproses..." : "Aktifkan kembali"}
                </Button>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Riwayat perpanjangan</p>
              {detail.riwayat.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum pernah diperpanjang.</p>
              ) : (
                <ul className="space-y-2">
                  {detail.riwayat.map((row, index) => (
                    <li key={index} className="rounded-md border border-border p-3 text-sm">
                      <p className="text-foreground">
                        +{row.added_months} bulan · berakhir {formatDate(row.expires_at_after)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Dari {formatDate(row.started_from)} · oleh {row.oleh ?? "—"}
                        {row.kapan ? ` · ${formatDate(row.kapan)}` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
