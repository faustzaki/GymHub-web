import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PLAN_OPTIONS,
  createMember,
  formatDate,
  planLabel,
  previewExpiry,
  toISODate,
  type Member,
  type PlanMonths,
} from "@/lib/services/members";
import { MonthStepper } from "./MonthStepper";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Dipanggil setelah tersimpan: daftar langsung diperbarui tanpa muat ulang halaman. */
  onCreated: (member: Member) => void;
  /** 409: nomor HP sudah dipakai. UI menawarkan membuka member itu. */
  onOpenExisting: (id: number) => void;
}

/**
 * MemberForm — pendaftaran member baru, tepat 2 field (nama + nomor HP).
 *
 * Tanggal berakhir dihitung di sini untuk pratinjau saja; server yang menyimpan.
 * Nomor HP TIDAK dinormalisasi di sini — server yang mengubah +62/8xx menjadi 08xx.
 */
export function MemberForm({ open, onOpenChange, onCreated, onOpenExisting }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [plan, setPlan] = useState<PlanMonths>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [existing, setExisting] = useState<{ id: number; name: string; member_code: string } | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const reset = () => {
    setName("");
    setPhone("");
    setPlan(1);
    setSavingState();
  };

  const setSavingState = () => {
    setIsSaving(false);
    setFieldErrors({});
    setExisting(null);
    setGeneralError(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next && isSaving) return;
    if (!next) reset();
    onOpenChange(next);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSaving) return;

    // Cegah kunci dobel: tombol langsung diganti teks "Menyimpan...".
    setIsSaving(true);
    setFieldErrors({});
    setExisting(null);
    setGeneralError(null);

    try {
      const member = await createMember({ name: name.trim(), phone: phone.trim(), plan_months: plan });
      toast.success("Member tersimpan", { description: `${member.name} · ${member.member_code}` });
      onCreated(member);
      reset();
      onOpenChange(false);
    } catch (err) {
      const error = err as {
        response?: {
          status?: number;
          data?: {
            message?: string;
            errors?: Record<string, string[]>;
            data?: { existing_member?: { id: number; name: string; member_code: string } | null };
          };
        };
      };
      const response = error.response;

      if (response?.status === 409 && response.data?.data?.existing_member) {
        setExisting(response.data.data.existing_member);
      } else if (response?.data?.errors) {
        setFieldErrors(
          Object.fromEntries(
            Object.entries(response.data.errors).map(([key, messages]) => [key, messages[0]])
          )
        );
      } else {
        setGeneralError(
          response?.data?.message ??
            "Member belum tersimpan. Isian Anda masih ada — periksa koneksi lalu tekan Simpan lagi."
        );
      }
      setIsSaving(false);
    }
  };

  const expiry = previewExpiry(plan);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md rounded-none border-border bg-background">
        <DialogHeader>
          <DialogTitle>Tambah Member</DialogTitle>
          <DialogDescription>
            Cukup nama dan nomor HP. Nomor HP menjadi identitas member.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="member-name" className="text-sm font-medium text-foreground">
              Nama
            </label>
            <Input
              id="member-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama member"
              className="h-11 rounded-md border-border"
              autoComplete="off"
              aria-invalid={!!fieldErrors.name}
              aria-describedby={fieldErrors.name ? "member-name-error" : undefined}
              required
            />
            {fieldErrors.name && (
              <p id="member-name-error" className="text-sm text-foreground">
                {fieldErrors.name}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="member-phone" className="text-sm font-medium text-foreground">
              Nomor HP
            </label>
            <Input
              id="member-phone"
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08123456789"
              className="h-11 rounded-md border-border"
              autoComplete="off"
              aria-invalid={!!fieldErrors.phone}
              aria-describedby={fieldErrors.phone ? "member-phone-error" : undefined}
              required
            />
            {fieldErrors.phone && (
              <p id="member-phone-error" className="text-sm text-foreground">
                {fieldErrors.phone}
              </p>
            )}
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-foreground">Durasi</legend>

            {/* Pilihan cepat. Angka yang tampil = total yang akan disimpan. */}
            <div
              className="grid grid-cols-2 gap-2 sm:grid-cols-4"
              role="radiogroup"
              aria-label="Durasi masa aktif"
            >
              {PLAN_OPTIONS.map((months) => (
                <Button
                  key={months}
                  type="button"
                  role="radio"
                  aria-checked={plan === months}
                  variant={plan === months ? "default" : "outline"}
                  onClick={() => setPlan(months)}
                  className="h-11 rounded border-border"
                >
                  {planLabel(months)}
                </Button>
              ))}
            </div>

            {/* Di luar pilihan cepat: susun sendiri, totalnya kelihatan sebelum disimpan. */}
            <div className="space-y-2 rounded-md border border-border p-3">
              <p className="text-xs text-muted-foreground">
                Durasi lain &mdash; tekan + untuk menambah satu bulan sampai totalnya pas.
              </p>
              <MonthStepper value={plan} onChange={setPlan} />
            </div>

            <p className="text-sm text-muted-foreground">
              Masa aktif {planLabel(plan)} · berakhir{" "}
              <span className="text-foreground">
                {formatDate(toISODate(expiry))}
              </span>
            </p>
          </fieldset>

          {existing && (
            <div role="alert" className="space-y-2 rounded-md border border-border bg-card p-3">
              <p className="text-sm text-foreground">
                Nomor ini sudah dipakai {existing.name} ({existing.member_code}).
              </p>
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded border-border"
                onClick={() => {
                  handleOpenChange(false);
                  onOpenExisting(existing.id);
                }}
              >
                Buka member itu
              </Button>
            </div>
          )}

          {generalError && (
            <p role="alert" className="rounded-md border border-border bg-card p-3 text-sm text-foreground">
              {generalError}
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded border-border"
              onClick={() => handleOpenChange(false)}
              disabled={isSaving}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="h-11 rounded bg-primary px-5 font-bold text-primary-foreground hover:bg-primary/90"
            >
              {isSaving ? "Menyimpan..." : "Simpan Member"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
