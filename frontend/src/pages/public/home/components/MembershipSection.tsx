import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { DisciplineBlock, Reveal } from "@/components/brand/DisciplineBlock";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  SETTING_KEYS,
  fetchPublicSettings,
  formatRupiah,
  priceCards,
  waNumber,
  type PublicSettings,
} from "@/lib/services/owner";

/**
 * Blok 08 — Biaya.
 *
 * Harga TIDAK lagi ditanam di kode: semuanya dari `GET /settings/public`, yang diisi pemilik di
 * Pengaturan Web. Kolom yang belum diisi tidak dirender sama sekali -- kartu "Rp –" lebih buruk
 * daripada kartu yang tidak ada.
 *
 * Kelas & fasilitas tetap teks di sini: itu deskripsi gym, bukan angka yang berubah.
 */
const FASILITAS_BULANAN = [
  "Akses tanpa batas selama jam operasional",
  "Loker dan ruang ganti",
  "Air minum isi ulang",
];

export default function MembershipSection() {
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [gagal, setGagal] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchPublicSettings()
      .then((hasil) => !cancelled && setSettings(hasil))
      .catch(() => !cancelled && setGagal(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const kartu = priceCards(settings);
  const nomorWa = waNumber(settings?.[SETTING_KEYS.whatsapp] ?? null);
  const alamat = settings?.[SETTING_KEYS.address] ?? null;
  const wa = (pesan: string) =>
    nomorWa
      ? `https://wa.me/${nomorWa}?text=${encodeURIComponent(pesan)}`
      : alamat
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(alamat)}`
        : null;

  return (
    <DisciplineBlock
      id="membership"
      rhythm={2}
      title="Biaya"
      lead={
        settings?.[SETTING_KEYS.registration] === null
          ? "Harga di bawah ini diisi langsung oleh pengelola gym, jadi selalu yang berlaku hari ini."
          : "Sekali bayar pendaftaran, lalu pilih durasi. Semua harga di bawah sudah termasuk akses penuh."
      }
    >
      {gagal ? (
        <p className="border border-border p-6 text-sm text-muted-foreground">
          Daftar harga belum bisa dimuat. Hubungi gym lewat WhatsApp untuk harga terbaru.
        </p>
      ) : !settings ? (
        <div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bg-background p-7">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="mt-4 h-9 w-32" />
              <Skeleton className="mt-3 h-3 w-24" />
            </div>
          ))}
        </div>
      ) : kartu.length === 0 ? (
        <p className="border border-border p-6 text-sm text-muted-foreground">
          Harga belum diisi pengelola. Silakan tanya lewat WhatsApp atau datang langsung.
        </p>
      ) : (
        <div
          className={cn(
            "grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2",
            kartu.length >= 4 ? "lg:grid-cols-4" : kartu.length === 3 ? "lg:grid-cols-3" : ""
          )}
        >
          {kartu.map((kartuHarga, index) => (
            <Reveal key={kartuHarga.key} delay={index * 60} className="h-full">
              <article
                className={cn(
                  "flex h-full flex-col gap-5 p-7 lg:p-8",
                  // Satu kartu ditonjolkan: paket 1 bulan adalah yang paling sering diambil.
                  kartuHarga.key === "monthly" ? "bg-card" : "bg-background"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                    {kartuHarga.label}
                  </h3>
                  {kartuHarga.key === "monthly" && (
                    <span className="border border-primary px-2 py-0.5 text-[11px] font-bold uppercase tracking-widest text-primary-text">
                      Paling sering diambil
                    </span>
                  )}
                </div>

                <div>
                  <p className="font-extrabold text-4xl tracking-tight text-foreground">
                    {formatRupiah(kartuHarga.amount)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{kartuHarga.note}</p>
                </div>

                {kartuHarga.key === "monthly" && (
                  <ul className="space-y-3 border-t border-border pt-5">
                    {FASILITAS_BULANAN.map((item) => (
                      <li key={item} className="flex gap-3 text-sm text-foreground">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                <Button
                  asChild={wa(`Halo, saya ingin bertanya soal biaya ${kartuHarga.label}.`) !== null}
                  disabled={wa(`Halo, saya ingin bertanya soal biaya ${kartuHarga.label}.`) === null}
                  className={cn(
                    "mt-auto h-12 rounded text-sm font-bold uppercase tracking-widest",
                    kartuHarga.key === "monthly"
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  {wa(`Halo, saya ingin bertanya soal biaya ${kartuHarga.label}.`) !== null ? (
                    <a
                      href={wa(`Halo, saya ingin bertanya soal biaya ${kartuHarga.label}.`)!}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Tanya biaya
                    </a>
                  ) : (
                    <span>Datang langsung</span>
                  )}
                </Button>
              </article>
            </Reveal>
          ))}
        </div>
      )}

      <div className="mt-10 grid gap-6 border border-border p-6 sm:grid-cols-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Sudah termasuk
          </p>
          <p className="mt-2 text-sm text-foreground">
            Loker, ruang ganti, dan air minum isi ulang.
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Belum termasuk
          </p>
          <p className="mt-2 text-sm text-foreground">Sesi personal 1-on-1 dan sewa loker bulanan.</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Cara daftar
          </p>
          <p className="mt-2 text-sm text-foreground">
            Datang langsung atau tanya lewat WhatsApp; pembayaran di lokasi.
          </p>
        </div>
      </div>
    </DisciplineBlock>
  );
}
