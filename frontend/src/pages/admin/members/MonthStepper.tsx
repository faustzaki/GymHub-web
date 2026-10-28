import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLAN_MAX_MONTHS, planLabel } from "@/lib/services/members";

interface Props {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

/**
 * MonthStepper — penyusun durasi untuk angka di luar pilihan cepat.
 *
 * Dipakai bersama oleh form pendaftaran dan panel perpanjangan supaya aturan batasnya hanya
 * ditulis sekali. Tombolnya besar (h-11) karena dipakai berdiri di depan anggota di meja gym.
 */
export function MonthStepper({ value, onChange, min = 1, max = PLAN_MAX_MONTHS }: Props) {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        aria-label="Kurangi satu bulan"
        className="h-11 w-11 rounded border-border"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus className="h-4 w-4" />
      </Button>

      <div className="flex h-11 min-w-28 items-center justify-center rounded border border-border px-3 text-sm font-medium text-foreground">
        {planLabel(value)}
      </div>

      <Button
        type="button"
        variant="outline"
        aria-label="Tambah satu bulan"
        className="h-11 w-11 rounded border-border"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Plus className="h-4 w-4" />
      </Button>

      <span className="text-xs text-muted-foreground">maks {planLabel(max)}</span>
    </div>
  );
}
