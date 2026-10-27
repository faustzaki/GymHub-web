import { Activity, Minus, Plus } from "lucide-react";
import { useBMICalculator } from "@/hooks/useBMICalculator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CustomNumberInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  min?: number;
  max?: number;
}

function CustomNumberInput({ id, value, onChange, placeholder, min, max }: CustomNumberInputProps) {
  const handleIncrement = () => {
    const current = value === "" ? (min ?? 0) : Number(value);
    const next = current + 1;
    if (max !== undefined && next > max) return;
    onChange(String(next));
  };

  const handleDecrement = () => {
    const current = value === "" ? (min ?? 0) : Number(value);
    const next = current - 1;
    if (min !== undefined && next < min) return;
    onChange(String(next));
  };

  return (
    <div className="relative">
      <Input
        id={id}
        type="number"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full border-border bg-background pr-[84px] text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
        required
      />
      <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center gap-1">
        <button
          type="button"
          onClick={handleDecrement}
          className="flex size-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Kurangi"
        >
          <Minus className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={handleIncrement}
          className="flex size-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Tambah"
        >
          <Plus className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

/**
 * BMICalculator — kalkulator indeks massa tubuh memakai `useBMICalculator`.
 *
 * Dipindahkan dari `PricingBMISection` (landing) karena mencampur kalkulator
 * dengan harga. Dipakai di area dashboard member; tidak dipasang di landing.
 * Saran paket mengikuti pemetaan bawaan hook (`recommendedPlan`).
 */
export default function BMICalculator({ className }: { className?: string }) {
  const { weight, height, result, setWeight, setHeight, calculate, isValid } = useBMICalculator();

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    calculate();
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-primary/15">
          <Activity className="size-5 text-primary" aria-hidden="true" />
        </div>
        <CardTitle className="text-xl font-bold text-foreground">Cek indeks massa tubuh</CardTitle>
        <CardDescription className="text-muted-foreground">
          Masukkan tinggi dan berat badanmu untuk melihat kategori dan saran program.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCalculate} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="bmi-tinggi" className="text-sm font-medium text-foreground">
                Tinggi badan (cm)
              </label>
              <CustomNumberInput id="bmi-tinggi" placeholder="Contoh: 170" value={height} onChange={setHeight} min={100} max={250} />
            </div>
            <div className="space-y-2">
              <label htmlFor="bmi-berat" className="text-sm font-medium text-foreground">
                Berat badan (kg)
              </label>
              <CustomNumberInput id="bmi-berat" placeholder="Contoh: 65" value={weight} onChange={setWeight} min={20} max={300} />
            </div>
          </div>
          <Button
            type="submit"
            disabled={!isValid}
            className="h-11 w-full rounded bg-primary font-bold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Hitung sekarang
          </Button>
        </form>

        {result && (
          <div className="mt-6 space-y-2 rounded-xl border border-border bg-card p-5" role="status">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Skor BMI kamu</p>
            <p className="text-3xl font-extrabold text-foreground">{result.value}</p>
            <Badge
              className={
                result.category === "normal"
                  ? "bg-emerald-500/15 text-emerald-400"
                  : result.category === "underweight"
                    ? "bg-amber-500/15 text-amber-400"
                    : "bg-primary/15 text-primary-text"
              }
            >
              {result.label}
            </Badge>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{result.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
