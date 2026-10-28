import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Camera, CameraOff, CheckCircle2, Keyboard, ScanLine, XCircle } from "lucide-react";
import { catatAbsen, fetchAbsenHariIni, type AbsenHariIni, type AbsenHasil } from "@/lib/services/attendance";
import { STATUS_CLASS, STATUS_LABEL } from "@/pages/admin/members/status";
import { formatDate } from "@/lib/services/members";

/**
 * AbsenPage — absen masuk anggota lewat kamera HP petugas.
 *
 * Keputusan josjis 2026-10-29: "pakai scan dari hp, alat dari hp langsung konek absen di manajemen
 * member". Tidak ada perangkat keras, tidak ada aplikasi tambahan: halaman ini membuka kamera HP,
 * membaca QR kartu anggota, dan menulis satu baris `attendances`.
 *
 * Pemindai memakai `BarcodeDetector` kalau peramban punya (Chrome Android/ChromeOS), dan jatuh ke
 * `jsqr` (23 KB, dimuat malas saat kamera dinyalakan) kalau tidak. Ternyata `BarcodeDetector`
 * TIDAK ada di Chrome desktop -- percobaan di Chromium 156 & Edge 156 keduanya `false` -- jadi
 * mengandalkan API bawaan saja berarti pemindai mati di laptop, tempat petugas paling sering
 * membukanya. Kolom ketik kode tetap ada sebagai jalan terakhir.
 *
 * Kamera dimatikan secara bawaan. Petugas menekan "Nyalakan kamera" sendiri: meminta izin kamera
 * tanpa diminta membuat orang menolak sebelum tahu untuk apa.
 */
export default function AbsenPage() {
  const [hasil, setHasil] = useState<AbsenHasil | null>(null);
  const [hariIni, setHariIni] = useState<AbsenHariIni | null>(null);
  const [kode, setKode] = useState("");
  const [mengirim, setMengirim] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [kamera, setKamera] = useState<"mati" | "menyala" | "ditolak">("mati");
  // Kamera + jsQR jalan di semua peramban modern; tidak ada lagi layar "tidak didukung".
  const didukung = true;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number>(0);
  // Kode terakhir yang sudah dikirim, supaya satu QR yang masih di depan kamera tidak dikirim
  // berulang tiap frame. Direset saat kode itu hilang dari pandangan cukup lama.
  const kodeTerakhir = useRef<{ isi: string; waktu: number } | null>(null);

  const segarkan = useCallback((segar = false) => {
    fetchAbsenHariIni(8, segar)
      .then(setHariIni)
      .catch(() => {
        // Daftar kanan gagal dimuat bukan alasan mematikan pemindai: absen tetap bisa dicatat.
      });
  }, []);

  useEffect(() => {
    segarkan();
  }, [segarkan]);

  const kirim = useCallback(
    async (isi: string, method: "scan" | "manual") => {
      const bersih = isi.trim();
      if (bersih === "" || mengirim) return;

      setMengirim(true);
      setGalat(null);
      try {
        const data = await catatAbsen(bersih, method);
        setHasil(data);
        setKode("");
        segarkan(true);

        if (data.duplikat) {
          toast.info(`${data.anggota.name ?? data.anggota.member_code} sudah absen ${data.absen.jam}.`);
        } else if (data.anggota.status === "nonaktif") {
          // Tetap tercatat, tapi petugas harus tahu sebelum orangnya masuk: ini yang ditagih di tempat.
          toast.warning(
            `${data.anggota.name ?? data.anggota.member_code} absen tercatat, tapi masa aktifnya tidak berlaku.`
          );
        } else {
          toast.success(`${data.anggota.name ?? data.anggota.member_code} — absen ${data.absen.jam}.`);
        }
      } catch (err) {
        const e = err as { response?: { data?: { message?: string } } };
        setGalat(e.response?.data?.message ?? "Absen gagal dicatat. Periksa koneksi ke server.");
      } finally {
        setMengirim(false);
      }
    },
    [mengirim, segarkan]
  );

  // ---- Kamera: hanya hidup saat petugas menyalakannya -------------------------------
  const matikanKamera = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setKamera("mati");
  }, []);

  useEffect(() => matikanKamera, [matikanKamera]);

  const nyalakanKamera = useCallback(async () => {
    setGalat(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setKamera("menyala");

      // Detector dibuat setelah stream hidup: sebagian peramban menolak membuatnya lebih awal.
      const Detector = (
        window as unknown as {
          BarcodeDetector?: new (opsi: { formats: string[] }) => {
            detect: (sumber: HTMLVideoElement) => Promise<{ rawValue: string }[]>;
          };
        }
      ).BarcodeDetector;
      const detektor = Detector ? new Detector({ formats: ["qr_code"] }) : null;

      // jsQR: cadangan untuk peramban tanpa BarcodeDetector. Dimuat malas -- kalau kamera tidak
      // pernah dinyalakan, 23 KB ini tidak ikut terunduh.
      const bacaJsQr = detektor
        ? null
        : (await import("jsqr")).default;

      const kanvas = document.createElement("canvas");
      const konteks = kanvas.getContext("2d", { willReadFrequently: true });

      /** Ambil kode dari satu bingkai video. Ukuran diperkecil: QR kartu tetap terbaca, CPU jauh lebih ringan. */
      const bacaBingkai = async (video: HTMLVideoElement): Promise<string | null> => {
        if (detektor) {
          const hasil = await detektor.detect(video);
          return hasil[0]?.rawValue?.trim() ?? null;
        }
        if (!bacaJsQr || !konteks) return null;
        const sisi = 480;
        kanvas.width = sisi;
        kanvas.height = sisi;
        konteks.drawImage(video, 0, 0, sisi, sisi);
        const piksel = konteks.getImageData(0, 0, sisi, sisi);
        return bacaJsQr(piksel.data, sisi, sisi, { inversionAttempts: "dontInvert" })?.data?.trim() ?? null;
      };

      let terakhirPindai = 0;

      const pindai = async () => {
        const video = videoRef.current;
        if (!video || video.readyState < 2) {
          frameRef.current = requestAnimationFrame(pindai);
          return;
        }

        // jsQR tidak boleh jalan 60x per detik -- itu memblokir main thread dan membuat video
        // tersendat. Empat kali per detik sudah lebih dari cukup untuk kartu yang diarahkan.
        if (detektor || Date.now() - terakhirPindai > 250) {
          terakhirPindai = Date.now();
          try {
            const isi = await bacaBingkai(video);
            if (isi) {
              const lalu = kodeTerakhir.current;
              const baru = !lalu || lalu.isi !== isi || Date.now() - lalu.waktu > 4000;
              if (baru) {
                kodeTerakhir.current = { isi, waktu: Date.now() };
                void kirim(isi, "scan");
              } else if (lalu) {
                // Masih QR yang sama di depan kamera: segarkan waktunya, jangan kirim ulang.
                lalu.waktu = Date.now();
              }
            }
          } catch {
            // Bingkai ini gagal dibaca (buram, gelap). Bukan galat: lanjut ke bingkai berikutnya.
          }
        }
        frameRef.current = requestAnimationFrame(pindai);
      };
      frameRef.current = requestAnimationFrame(pindai);
    } catch {
      setKamera("ditolak");
      setGalat("Kamera tidak bisa dibuka. Izinkan akses kamera, atau ketik kode anggota di bawah.");
    }
  }, [kirim]);

  const anggota = hasil?.anggota;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold uppercase tracking-tight text-foreground">Absen Masuk</h1>
          <p className="text-sm text-muted-foreground">
            Arahkan kamera HP ke QR di kartu anggota. Kode yang sama bisa diketik kalau kamera
            tidak bisa dipakai.
          </p>
        </div>
        <Button asChild variant="outline" className="h-11 rounded border-border">
          <Link to="/admin/members">
            <ArrowLeft size={16} className="mr-2" />
            Anggota Gym
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ---- Pemindai ---- */}
        <Card className="rounded-xl border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Pemindai</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-border bg-black">
              <video
                ref={videoRef}
                className={`h-full w-full object-cover ${kamera === "menyala" ? "" : "hidden"}`}
                muted
                playsInline
              />
              {kamera !== "menyala" && (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  {kamera === "ditolak" ? (
                    <CameraOff className="text-muted-foreground" size={28} aria-hidden="true" />
                  ) : (
                    <ScanLine className="text-muted-foreground" size={28} aria-hidden="true" />
                  )}
                  <p className="max-w-56 text-xs text-muted-foreground">
                    {didukung
                      ? "Kamera mati. Nyalakan untuk memindai QR kartu anggota."
                      : "Peramban ini belum bisa memindai QR. Ketik kode anggota di kolom bawah."}
                  </p>
                  {didukung && (
                    <Button onClick={nyalakanKamera} className="h-10 rounded bg-primary px-4 text-xs font-bold uppercase tracking-widest text-primary-foreground">
                      <Camera size={15} className="mr-2" />
                      Nyalakan kamera
                    </Button>
                  )}
                </div>
              )}
              {kamera === "menyala" && (
                <>
                  {/* Bingkai bidik: menandakan di mana QR harus berada, bukan ornamen. */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="h-40 w-40 rounded border-2 border-white/70" />
                  </div>
                  <Button
                    onClick={matikanKamera}
                    variant="outline"
                    className="absolute bottom-2 right-2 h-9 rounded border-white/30 bg-black/50 px-3 text-xs text-white hover:bg-black/70"
                  >
                    Matikan
                  </Button>
                </>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="kode-absen" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Atau ketik kode anggota
              </label>
              <div className="flex gap-2">
                <Input
                  id="kode-absen"
                  value={kode}
                  onChange={(e) => setKode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && void kirim(kode, "manual")}
                  placeholder="GH-0001"
                  className="h-11 rounded-md border-border font-mono tabular-nums"
                  autoComplete="off"
                />
                <Button
                  onClick={() => void kirim(kode, "manual")}
                  disabled={mengirim || kode.trim() === ""}
                  className="h-11 shrink-0 rounded bg-foreground px-4 text-background hover:bg-foreground/90"
                >
                  <Keyboard size={16} className="mr-2" />
                  Absen
                </Button>
              </div>
            </div>

            {galat && (
              <p role="alert" className="flex items-start gap-2 rounded-md border border-border bg-card p-3 text-sm text-foreground">
                <XCircle size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                {galat}
              </p>
            )}
          </CardContent>
        </Card>

        {/* ---- Hasil absen terakhir ---- */}
        <Card className="rounded-xl border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Hasil terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            {!anggota ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Belum ada absen di sesi ini. Hasil pemindaian muncul di sini.
              </p>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    size={22}
                    className={anggota.status === "nonaktif" ? "mt-0.5 shrink-0 text-primary" : "mt-0.5 shrink-0 text-emerald-500"}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="text-lg font-bold leading-tight text-foreground">
                      {anggota.name ?? "Tanpa nama"}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground">{anggota.member_code}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className={STATUS_CLASS[anggota.status]}>
                    {STATUS_LABEL[anggota.status]}
                  </Badge>
                  {hasil?.duplikat && (
                    <Badge variant="outline" className="border-border text-muted-foreground">
                      sudah tercatat
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    absen ke-{hasil?.absen_hari_ini ?? 1} hari ini · jam {hasil?.absen.jam ?? "—"}
                  </span>
                </div>

                <dl className="divide-y divide-border border-y border-border text-sm">
                  <div className="flex justify-between gap-3 py-2">
                    <dt className="text-muted-foreground">Masa aktif sampai</dt>
                    <dd className="text-foreground">{formatDate(anggota.membership_expires_at)}</dd>
                  </div>
                  <div className="flex justify-between gap-3 py-2">
                    <dt className="text-muted-foreground">Sisa hari</dt>
                    <dd className="tabular-nums text-foreground">
                      {anggota.days_left < 0 ? `lewat ${Math.abs(anggota.days_left)} hari` : `${anggota.days_left} hari`}
                    </dd>
                  </div>
                </dl>

                {anggota.status === "nonaktif" && (
                  <p className="rounded-md border border-primary/40 bg-primary/5 p-3 text-sm text-foreground">
                    Absennya tercatat, tapi masa aktifnya tidak berlaku. Tagih perpanjangan sebelum
                    dia masuk{anggota.nonaktif_karena_akun ? " — akunnya juga sudah dimatikan petugas" : ""}.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ---- Kunjungan hari ini ---- */}
      <Card className="rounded-xl border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Absen hari ini</CardTitle>
          <p className="text-sm text-muted-foreground">
            {hariIni ? `${hariIni.hari_ini} kunjungan · ${hariIni.anggota_unik} anggota` : "—"}
          </p>
        </CardHeader>
        <CardContent className="px-0">
          {!hariIni ? (
            <Skeleton className="mx-4 h-32 w-auto" />
          ) : hariIni.items.length === 0 ? (
            <p className="px-4 pb-2 text-sm text-muted-foreground">
              Belum ada yang absen hari ini.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[11px] uppercase tracking-widest text-muted-foreground">
                    <th className="px-4 py-2 font-bold">Jam</th>
                    <th className="px-4 py-2 font-bold">Anggota</th>
                    <th className="px-4 py-2 font-bold">Kode</th>
                    <th className="px-4 py-2 font-bold">Cara</th>
                    <th className="px-4 py-2 font-bold">Dicatat</th>
                  </tr>
                </thead>
                <tbody>
                  {hariIni.items.map((row) => (
                    <tr key={row.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-2.5 font-mono tabular-nums text-foreground">{row.jam ?? "—"}</td>
                      <td className="px-4 py-2.5 text-foreground">{row.nama ?? "—"}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{row.member_code ?? "—"}</td>
                      <td className="px-4 py-2.5 text-xs uppercase text-muted-foreground">{row.method}</td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">{row.oleh ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
