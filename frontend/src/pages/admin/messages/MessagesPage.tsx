import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { CheckCheck, Mail, MailOpen, Reply } from "lucide-react";
import {
  STATUS_PESAN,
  fetchPesan,
  ubahStatusPesan,
  type MessageStatus,
  type Pesan,
  type PesanList,
} from "@/lib/services/messages";

/**
 * MessagesPage — pesan dari form kontak landing.
 *
 * Keputusan josjis 2026-10-29: klik notifikasi di header membuka halaman ini, dan tiap pesan
 * punya detail. `?buka=<id>` dipakai lonceng supaya pesan yang diklik langsung terbuka -- bukan
 * cuma mendarat di daftar dan menyuruh orang mencarinya lagi.
 *
 * Satu halaman dipakai petugas dan owner (`/admin/messages`); owner bertingkat boleh masuk
 * semua halaman petugas, jadi tidak perlu halaman kembar.
 */
export default function MessagesPage() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState<PesanList | null>(null);
  const [filter, setFilter] = useState<MessageStatus | "">("");
  const [error, setError] = useState<string | null>(null);
  const [sibuk, setSibuk] = useState<number | null>(null);

  const terbukaId = Number(params.get("buka") ?? 0) || null;

  const muat = useCallback(() => {
    fetchPesan({ status: filter })
      .then(setData)
      .catch((err: unknown) => {
        const e = err as { response?: { data?: { message?: string } } };
        setError(e.response?.data?.message ?? "Pesan belum bisa dimuat. Periksa koneksi ke server.");
      });
  }, [filter]);

  useEffect(() => {
    muat();
  }, [muat]);

  // Membuka pesan = membacanya. Tanpa ini, lonceng terus berbunyi untuk pesan yang sudah dibaca
  // di layar ini -- angka yang tidak pernah turun membuat orang berhenti mempercayainya.
  useEffect(() => {
    if (terbukaId === null || !data) return;
    const pesan = data.items.find((p) => p.id === terbukaId);
    if (!pesan || pesan.status !== "baru") return;

    ubahStatusPesan(pesan.id, "dibaca")
      .then(() => muat())
      .catch(() => {
        // Gagal menandai bukan alasan menutup pesannya; statusnya bisa diubah manual.
      });
  }, [terbukaId, data, muat]);

  const ubah = async (pesan: Pesan, status: MessageStatus) => {
    setSibuk(pesan.id);
    try {
      await ubahStatusPesan(pesan.id, status);
      muat();
      toast.success(status === "dibalas" ? "Ditandai sudah dibalas." : "Pesan diperbarui.");
    } catch {
      toast.error("Status pesan gagal diubah.");
    } finally {
      setSibuk(null);
    }
  };

  const pilih = (id: number | null) => {
    const next = new URLSearchParams(params);
    if (id === null) next.delete("buka");
    else next.set("buka", String(id));
    setParams(next, { replace: true });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold uppercase tracking-tight text-foreground">Pesan</h1>
        <p className="text-sm text-muted-foreground">
          Pertanyaan yang dikirim pengunjung lewat form kontak di halaman depan.
        </p>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Saring pesan">
        {([
          { nilai: "" as const, label: "Semua" },
          { nilai: "baru" as const, label: "Belum dibaca" },
          { nilai: "dibaca" as const, label: "Dibaca" },
          { nilai: "dibalas" as const, label: "Dibalas" },
        ]).map((p) => (
          <Button
            key={p.nilai || "semua"}
            size="sm"
            variant={filter === p.nilai ? "default" : "outline"}
            aria-pressed={filter === p.nilai}
            onClick={() => setFilter(p.nilai)}
          >
            {p.label}
            {p.nilai === "baru" && data && data.belum_dibaca > 0 && (
              <span className="ml-2 rounded-full bg-primary px-1.5 text-[10px] font-bold tabular-nums text-primary-foreground">
                {data.belum_dibaca}
              </span>
            )}
          </Button>
        ))}
      </div>

      {error && (
        <p role="alert" className="rounded-md border border-border bg-card p-4 text-sm text-foreground">
          {error}
        </p>
      )}

      {!data ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : data.items.length === 0 ? (
        <Card className="rounded-xl border-border">
          <CardContent className="flex flex-col items-center gap-2 py-14 text-center">
            <Mail size={26} className="text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-foreground">
              {filter === "" ? "Belum ada pesan masuk." : "Tidak ada pesan dengan status ini."}
            </p>
            <p className="text-xs text-muted-foreground">
              Pesan muncul di sini begitu pengunjung mengirim lewat form kontak di halaman depan.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-12">
          {/* Daftar: kiri. */}
          <ul className="space-y-2 lg:col-span-5">
            {data.items.map((pesan) => {
              const aktif = terbukaId === pesan.id;
              return (
                <li key={pesan.id}>
                  <button
                    type="button"
                    onClick={() => pilih(aktif ? null : pesan.id)}
                    aria-expanded={aktif}
                    className={`w-full rounded-lg border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      aktif
                        ? "border-primary/50 bg-primary/5"
                        : "border-border bg-card hover:bg-accent/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{pesan.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{pesan.email}</p>
                      </div>
                      <Badge variant="outline" className={STATUS_PESAN[pesan.status].kelas}>
                        {STATUS_PESAN[pesan.status].label}
                      </Badge>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{pesan.message}</p>
                    <p className="mt-1.5 text-[11px] text-muted-foreground">{pesan.kapan}</p>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Detail: kanan. */}
          <div className="lg:col-span-7">
            {terbukaId === null ? (
              <Card className="rounded-xl border-border">
                <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
                  <MailOpen size={26} className="text-muted-foreground" aria-hidden="true" />
                  <p className="text-sm text-muted-foreground">
                    Pilih satu pesan di kiri untuk membaca isinya.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <DetailPesan
                pesan={data.items.find((p) => p.id === terbukaId) ?? null}
                sibuk={sibuk === terbukaId}
                onStatus={ubah}
              />
            )}
          </div>
        </div>
      )}

      {data && data.meta.last_page > 1 && (
        <p className="text-center text-xs text-muted-foreground">
          Menampilkan {data.items.length} dari {data.meta.total} pesan · halaman{" "}
          {data.meta.current_page}/{data.meta.last_page}
        </p>
      )}
    </div>
  );
}

/** Isi lengkap satu pesan + aksi. Email dibalas lewat aplikasi surat, bukan dari dalam panel. */
function DetailPesan({
  pesan,
  sibuk,
  onStatus,
}: {
  pesan: Pesan | null;
  sibuk: boolean;
  onStatus: (pesan: Pesan, status: MessageStatus) => void;
}) {
  if (!pesan) {
    return (
      <Card className="rounded-xl border-border">
        <CardContent className="py-16 text-center text-sm text-muted-foreground">
          Pesan itu tidak ada di halaman ini. Pilih pesan lain di kiri.
        </CardContent>
      </Card>
    );
  }

  const tanggal = pesan.created_at
    ? new Date(pesan.created_at).toLocaleString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  return (
    <Card className="rounded-xl border-border">
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-lg font-bold leading-tight text-foreground">{pesan.name}</p>
            <a
              href={`mailto:${pesan.email}?subject=${encodeURIComponent("Balasan GymHub")}`}
              className="text-sm text-primary-text underline-offset-4 hover:underline"
            >
              {pesan.email}
            </a>
            <p className="mt-1 text-xs text-muted-foreground">{tanggal}</p>
          </div>
          <Badge variant="outline" className={STATUS_PESAN[pesan.status].kelas}>
            {STATUS_PESAN[pesan.status].label}
          </Badge>
        </div>

        <div className="whitespace-pre-wrap rounded-md border border-border bg-background p-4 text-sm leading-relaxed text-foreground">
          {pesan.message}
        </div>

        {pesan.handled_by && pesan.status === "dibalas" && (
          <p className="text-xs text-muted-foreground">Ditandai dibalas oleh {pesan.handled_by}.</p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            asChild
            className="h-11 rounded bg-primary font-bold text-primary-foreground hover:bg-primary/90"
          >
            <a href={`mailto:${pesan.email}?subject=${encodeURIComponent("Balasan GymHub")}`}>
              <Reply size={16} className="mr-2" />
              Balas lewat email
            </a>
          </Button>
          {pesan.status !== "dibalas" && (
            <Button
              variant="outline"
              disabled={sibuk}
              onClick={() => onStatus(pesan, "dibalas")}
              className="h-11 rounded border-border"
            >
              <CheckCheck size={16} className="mr-2" />
              Tandai sudah dibalas
            </Button>
          )}
          {pesan.status !== "baru" && (
            <Button
              variant="ghost"
              disabled={sibuk}
              onClick={() => onStatus(pesan, "baru")}
              className="h-11 rounded"
            >
              Tandai belum dibaca
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
