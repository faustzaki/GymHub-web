import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  BELUM_DIISI,
  SETTING_KEYS,
  fetchOwnerSettings,
  formatTanggal,
  saveOwnerSettings,
  settingsMap,
  type OwnerSettingsRow,
  type SettingsPayload,
} from "@/lib/services/owner";

type HargaKey = (typeof SETTING_KEYS)["registration"] | "price.monthly" | "price.months_3" | "price.months_6" | "price.months_12";

const HARGA: { key: HargaKey; label: string; bantuan: string }[] = [
  {
    key: SETTING_KEYS.registration,
    label: "Biaya pendaftaran",
    bantuan: "Sekali bayar saat anggota pertama kali masuk.",
  },
  { key: SETTING_KEYS.monthly, label: "1 bulan", bantuan: "Harga bulanan. Durasi lain bisa dihitung dari sini." },
  { key: SETTING_KEYS.months_3, label: "3 bulan", bantuan: "Kosongkan kalau memakai harga bulanan x 3." },
  { key: SETTING_KEYS.months_6, label: "6 bulan", bantuan: "Kosongkan kalau memakai harga bulanan x 6." },
  { key: SETTING_KEYS.months_12, label: "12 bulan", bantuan: "Kosongkan kalau memakai harga bulanan x 12." },
];

const TEKS: { key: string; label: string; bantuan: string }[] = [
  { key: SETTING_KEYS.name, label: "Nama gym", bantuan: "Tampil di landing dan pesan tagihan." },
  { key: SETTING_KEYS.address, label: "Alamat", bantuan: "Alamat yang ditampilkan ke calon anggota." },
  { key: SETTING_KEYS.hours, label: "Jam buka", bantuan: "Contoh: 06.00-22.00." },
  { key: SETTING_KEYS.whatsapp, label: "Nomor WhatsApp", bantuan: "Nomor yang dihubungi calon anggota." },
];

/**
 * WebSettingsPage — keputusan pemilik: harga dan identitas gym.
 *
 * Kosong berarti "belum diisi" dan dikirim sebagai `null`, bukan 0. Harga 0 punya arti lain
 * (gratis), jadi dua hal itu tidak boleh tercampur (P5). Yang mengubah tercatat di server.
 */
export default function WebSettingsPage() {
  const [baris, setBaris] = useState<OwnerSettingsRow[] | null>(null);
  const [nilai, setNilai] = useState<Record<string, string>>({});
  const [menyimpan, setMenyimpan] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const terapkan = (rows: OwnerSettingsRow[]) => {
    setBaris(rows);
    setNilai(
      Object.fromEntries(rows.map((row) => [row.key, row.value ?? ""])) as Record<string, string>
    );
  };

  useEffect(() => {
    let cancelled = false;
    fetchOwnerSettings()
      .then((rows) => !cancelled && terapkan(rows))
      .catch((err: unknown) => {
        if (cancelled) return;
        const e = err as { response?: { data?: { message?: string } } };
        setError(
          e.response?.data?.message ??
            "Pengaturan belum bisa dimuat. Periksa koneksi ke server lalu muat ulang halaman."
        );
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const ubah = (key: string, value: string) => {
    setNilai((lama) => ({ ...lama, [key]: value }));
  };

  const simpan = async () => {
    setMenyimpan(true);
    setError(null);
    try {
      // Hanya kunci yang dikenal backend; kosong -> null (belum diisi), bukan 0.
      const payload: SettingsPayload = {};
      for (const { key } of [...HARGA, ...TEKS]) {
        const isi = (nilai[key] ?? "").trim();
        payload[key] = isi === "" ? null : isi;
      }
      const rows = await saveOwnerSettings(payload);
      terapkan(rows);
      toast.success("Pengaturan tersimpan");
    } catch (err) {
      const e = err as {
        response?: { data?: { message?: string; errors?: Record<string, string[]> } };
      };
      const pesan =
        Object.values(e.response?.data?.errors ?? {})
          .flat()
          .join(" ") ||
        e.response?.data?.message ||
        "Pengaturan gagal disimpan. Coba lagi.";
      setError(pesan);
    } finally {
      setMenyimpan(false);
    }
  };

  const peta = baris ? settingsMap(baris) : {};
  const terakhir = baris
    ?.filter((row) => row.updated_at)
    .sort((a, b) => (a.updated_at! < b.updated_at! ? 1 : -1))[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold uppercase tracking-tight text-foreground">
            Pengaturan Web
          </h1>
          <p className="text-sm text-muted-foreground">
            Harga dan identitas gym. Kolom yang dikosongkan tampil sebagai
            &ldquo;belum diisi&rdquo;, bukan Rp 0.
          </p>
        </div>
        <Button
          onClick={simpan}
          disabled={menyimpan || !baris}
          className="h-11 rounded bg-foreground px-5 text-background hover:bg-foreground/90"
        >
          {menyimpan ? "Menyimpan..." : "Simpan perubahan"}
        </Button>
      </div>

      {error && (
        <p role="alert" className="rounded-md border border-border bg-card p-4 text-sm text-foreground">
          {error}
        </p>
      )}

      {!baris ? (
        <Skeleton className="h-72 w-full rounded-xl" />
      ) : (
        <Tabs defaultValue="harga" className="space-y-4">
          <TabsList className="h-11 rounded border border-border bg-card p-1">
            <TabsTrigger value="harga" className="h-9 rounded px-4 text-sm">
              Harga
            </TabsTrigger>
            <TabsTrigger value="info" className="h-9 rounded px-4 text-sm">
              Info Gym
            </TabsTrigger>
          </TabsList>

          <TabsContent value="harga">
            <Card className="rounded-xl border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Harga keanggotaan</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Nominal ini mengisi kolom pembayaran di panel petugas, dan tetap boleh diubah
                  saat transaksi.
                </p>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {HARGA.map(({ key, label, bantuan }) => (
                  <div key={key} className="space-y-1.5">
                    <label htmlFor={key} className="text-sm font-medium text-foreground">
                      {label}
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Rp</span>
                      <Input
                        id={key}
                        inputMode="numeric"
                        value={nilai[key] ?? ""}
                        onChange={(e) => ubah(key, e.target.value.replace(/\D/g, ""))}
                        placeholder={BELUM_DIISI}
                        className="h-11 rounded-md border-border tabular-nums"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{bantuan}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="info">
            <Card className="rounded-xl border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Identitas gym</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Dipakai landing publik dan pesan WhatsApp ke anggota.
                </p>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {TEKS.map(({ key, label, bantuan }) => (
                  <div key={key} className="space-y-1.5">
                    <label htmlFor={key} className="text-sm font-medium text-foreground">
                      {label}
                    </label>
                    <Input
                      id={key}
                      value={nilai[key] ?? ""}
                      onChange={(e) => ubah(key, e.target.value)}
                      maxLength={200}
                      placeholder="Belum diisi"
                      className="h-11 rounded-md border-border"
                    />
                    <p className="text-xs text-muted-foreground">{bantuan}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {terakhir && (
        <p className="text-xs text-muted-foreground">
          Terakhir diubah {formatTanggal(terakhir.updated_at)}
          {terakhir.updated_by ? ` oleh ${terakhir.updated_by}` : ""}.
        </p>
      )}

      {baris && Object.keys(peta).length === 0 && (
        <p className="text-sm text-muted-foreground">
          Belum ada pengaturan tersimpan. Isi harga di atas supaya kolom pembayaran di panel
          petugas bisa terisi sendiri.
        </p>
      )}
    </div>
  );
}
