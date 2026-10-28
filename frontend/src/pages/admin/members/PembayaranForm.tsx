import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  BELUM_DIISI,
  PAYMENT_METHOD_LABEL,
  fetchPublicSettings,
  priceForMonths,
  type PaymentMethod,
  type PublicSettings,
} from "@/lib/services/owner";

interface Props {
  /** Durasi terpilih dalam bulan; nominal mengikuti durasi ini. */
  months: number;
  method: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  amount: string;
  onAmountChange: (amount: string) => void;
  disabled?: boolean;
}

/**
 * PembayaranForm — pilihan CASH/QRIS (bawaan CASH) + nominal yang terisi sendiri (P2, P3).
 *
 * Nominal diisi dari harga di Pengaturan Web saat durasi berganti, lalu boleh diubah petugas
 * (diskon, bayar sebagian). Kalau harga belum diisi, kolom dibiarkan kosong dan boleh diketik
 * manual — jangan pernah mengisi "0" untuk sesuatu yang belum diisi (P5).
 */
export function PembayaranForm({
  months,
  method,
  onMethodChange,
  amount,
  onAmountChange,
  disabled,
}: Props) {
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [gagal, setGagal] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchPublicSettings()
      .then((hasil) => {
        if (!cancelled) setSettings(hasil);
      })
      .catch(() => {
        if (!cancelled) setGagal(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Durasi berubah: nominal ikut harga baru. Harga kosong -> kolom kosong, bukan "0".
  useEffect(() => {
    if (!settings) return;
    const harga = priceForMonths(settings, months);
    onAmountChange(harga === null ? "" : String(harga));
    // onAmountChange sengaja tidak jadi dependensi: hanya durasi & harga yang mengisi ulang nominal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, months]);

  const hargaPatokan = priceForMonths(settings, months);

  return (
    <fieldset className="space-y-2" disabled={disabled}>
      <legend className="text-sm font-medium text-foreground">Pembayaran</legend>

      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Cara bayar">
        {(Object.keys(PAYMENT_METHOD_LABEL) as PaymentMethod[]).map((cara) => (
          <Button
            key={cara}
            type="button"
            role="radio"
            aria-checked={method === cara}
            variant={method === cara ? "default" : "outline"}
            onClick={() => onMethodChange(cara)}
            className="h-11 rounded border-border"
          >
            {PAYMENT_METHOD_LABEL[cara]}
          </Button>
        ))}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="payment-amount" className="text-sm font-medium text-foreground">
          Nominal diterima
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rp</span>
          <Input
            id="payment-amount"
            inputMode="numeric"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value.replace(/\D/g, ""))}
            placeholder="Belum diisi"
            className="h-11 rounded-md border-border tabular-nums"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {gagal
            ? "Harga belum bisa dibaca dari server. Ketik nominal yang benar-benar diterima."
            : hargaPatokan === null
              ? BELUM_DIISI
              : "Terisi dari harga di Pengaturan Web. Boleh diubah sesuai uang yang diterima."}
        </p>
      </div>
    </fieldset>
  );
}
