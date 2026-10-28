import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Building2, MapPin, Share2, Tag } from "lucide-react";
import {
  BELUM_DIISI,
  SETTING_KEYS,
  fetchOwnerSettings,
  formatTanggal,
  petaEmbed,
  saveOwnerSettings,
  settingsMap,
  type OwnerSettingsRow,
  type SettingsPayload,
} from "@/lib/services/owner";

/** Nominal rupiah yang disimpan sebagai teks angka ("200000"), bukan "Rp 200.000". */
/** Satu warna per jenis biaya: harga gampang dibedakan sekilas, bukan satu blok abu-abu panjang. */
const HARGA: { key: string; label: string; bantuan: string; nada: string }[] = [
  {
    key: SETTING_KEYS.registration,
    label: "Biaya pendaftaran",
    nada: "border-l-2 border-l-amber-500",
    bantuan: "Sekali bayar saat anggota pertama kali masuk.",
  },
  {
    key: SETTING_KEYS.daily,
    label: "Biaya harian / visit",
    nada: "border-l-2 border-l-sky-500",
    bantuan: "Sekali kunjungan untuk yang tidak berlangganan. Tidak menambah masa aktif.",
  },
  {
    key: SETTING_KEYS.monthly,
    label: "1 bulan",
    bantuan: "Harga bulanan. Durasi 2–5 bulan dihitung dari sini.",
    nada: "border-l-2 border-l-emerald-500",
  },
  {
    key: SETTING_KEYS.months_6,
    label: "6 bulan",
    bantuan: "Kosongkan kalau memakai harga bulanan × 6.",
    nada: "border-l-2 border-l-violet-500",
  },
  {
    key: SETTING_KEYS.months_12,
    label: "1 tahun",
    bantuan: "Kosongkan kalau memakai harga bulanan × 12.",
    nada: "border-l-2 border-l-rose-500",
  },
];

/**
 * Info gym. Nama gym SENGAJA tidak ada di sini (permintaan josjis 2026-10-28): brand sudah tetap
 * "GymHub", dan kolom nama yang bisa diubah cuma menambah tempat untuk salah ketik.
 */
const TEKS: { key: string; label: string; bantuan: string; placeholder: string }[] = [
  {
    key: SETTING_KEYS.address,
    label: "Alamat",
    bantuan: "Tampil di landing, dan dipakai tombol \"Buka di Google Maps\".",
    placeholder: "Jl. ... No. ..., Kota",
  },
  {
    key: SETTING_KEYS.hours,
    label: "Jam buka",
    bantuan: "Contoh: Setiap hari, 06.00–22.00.",
    placeholder: "Setiap hari, 06.00–22.00",
  },
  {
    key: SETTING_KEYS.whatsapp,
    label: "Nomor WhatsApp",
    bantuan: "Nomor yang dihubungi calon anggota. Tombol WhatsApp di landing memakai nomor ini.",
    placeholder: "08123456789",
  },
];

/** Semua opsional: yang kosong tidak ditampilkan di landing sama sekali. */
const SOSIAL: { key: string; label: string; contoh: string }[] = [
  { key: SETTING_KEYS.instagram, label: "Instagram", contoh: "https://instagram.com/namagym" },
  { key: SETTING_KEYS.tiktok, label: "TikTok", contoh: "https://tiktok.com/@namagym" },
  { key: SETTING_KEYS.facebook, label: "Facebook", contoh: "https://facebook.com/namagym" },
  { key: SETTING_KEYS.youtube, label: "YouTube", contoh: "https://youtube.com/@namagym" },
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
      const semua = [
        ...HARGA.map((h) => h.key),
        ...TEKS.map((t) => t.key),
        SETTING_KEYS.maps_embed,
        ...SOSIAL.map((s) => s.key),
      ];
      for (const key of semua) {
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

  const embed = (nilai[SETTING_KEYS.maps_embed] ?? "").trim();
  const alamat = (nilai[SETTING_KEYS.address] ?? "").trim();
  // Selalu ada pratinjau selama alamat terisi, walau kolom sematan kosong: alamat saja sudah
  // cukup untuk peta yang benar.
  const pratinjau = petaEmbed(embed === "" ? null : embed, alamat === "" ? null : alamat);

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
            <TabsTrigger
              value="harga"
              className="h-9 rounded px-4 text-sm data-[state=active]:bg-primary/15 data-[state=active]:text-primary-text"
            >
              Harga
            </TabsTrigger>
            <TabsTrigger
              value="info"
              className="h-9 rounded px-4 text-sm data-[state=active]:bg-sky-500/15 data-[state=active]:text-sky-500"
            >
              Info Gym
            </TabsTrigger>
            <TabsTrigger
              value="sosial"
              className="h-9 rounded px-4 text-sm data-[state=active]:bg-amber-500/15 data-[state=active]:text-amber-500"
            >
              Media Sosial
            </TabsTrigger>
          </TabsList>

          <TabsContent value="harga">
            <Card className="overflow-hidden rounded-xl border-border">
              <div className="h-0.5 w-full bg-primary" aria-hidden="true" />
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className="flex size-7 items-center justify-center rounded bg-primary/10 text-primary">
                    <Tag size={15} aria-hidden="true" />
                  </span>
                  Harga Member
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Nominal ini mengisi kolom pembayaran di panel petugas, dan tetap boleh diubah
                  saat transaksi.
                </p>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {HARGA.map(({ key, label, bantuan, nada }) => (
                  <div key={key} className="space-y-1.5">
                    <label htmlFor={key} className="text-sm font-medium text-foreground">
                      {label}
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-primary/10 px-2 py-1 text-xs font-bold text-primary-text">Rp</span>
                      <Input
                        id={key}
                        inputMode="numeric"
                        value={nilai[key] ?? ""}
                        onChange={(e) => ubah(key, e.target.value.replace(/\D/g, ""))}
                        placeholder={BELUM_DIISI}
                        className={`h-11 rounded-md border-border tabular-nums ${nada}`}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{bantuan}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="info" className="space-y-4">
            <Card className="overflow-hidden rounded-xl border-border">
              <div className="h-0.5 w-full bg-sky-500" aria-hidden="true" />
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className="flex size-7 items-center justify-center rounded bg-sky-500/10 text-sky-500">
                    <Building2 size={15} aria-hidden="true" />
                  </span>
                  Identitas gym
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Dipakai landing publik dan pesan WhatsApp ke anggota.
                </p>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {TEKS.map(({ key, label, bantuan, placeholder }) => (
                  <div key={key} className="space-y-1.5">
                    <label htmlFor={key} className="text-sm font-medium text-foreground">
                      {label}
                    </label>
                    <Input
                      id={key}
                      value={nilai[key] ?? ""}
                      onChange={(e) => ubah(key, e.target.value)}
                      maxLength={200}
                      placeholder={placeholder}
                      className="h-11 rounded-md border-border"
                    />
                    <p className="text-xs text-muted-foreground">{bantuan}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="overflow-hidden rounded-xl border-border">
              <div className="h-0.5 w-full bg-emerald-500" aria-hidden="true" />
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className="flex size-7 items-center justify-center rounded bg-emerald-500/10 text-emerald-500">
                    <MapPin size={15} aria-hidden="true" />
                  </span>
                  Peta lokasi
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Buka Google Maps &rarr; cari lokasi gym &rarr; Bagikan &rarr; Sematkan peta
                  &rarr; salin kodenya, tempel di sini. Yang disimpan hanya alamat peta-nya.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <label htmlFor={SETTING_KEYS.maps_embed} className="text-sm font-medium text-foreground">
                    Kode sematan / tautan peta
                  </label>
                  <Input
                    id={SETTING_KEYS.maps_embed}
                    value={nilai[SETTING_KEYS.maps_embed] ?? ""}
                    onChange={(e) => ubah(SETTING_KEYS.maps_embed, e.target.value)}
                    placeholder="<iframe src=&quot;https://www.google.com/maps/embed?pb=...&quot;>"
                    className="h-11 rounded-md border-border"
                  />
                  <p className="text-xs text-muted-foreground">
                    Kosongkan kalau peta belum mau ditampilkan. Peta hanya muncul di landing kalau
                    kolom ini terisi.
                  </p>
                </div>

                {/* Pratinjau memakai aturan yang SAMA dengan landing (`petaEmbed`): kalau owner
                    menempel tautan peta biasa, yang tampil di sini sudah versi yang benar-benar
                    menunjuk alamat -- bukan peta kosong yang baru ketahuan salah di landing. */}
                {pratinjau && (
                  <div className="overflow-hidden rounded-md border border-border">
                    <iframe
                      src={pratinjau}
                      title="Pratinjau peta lokasi gym"
                      className="h-56 w-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                )}

                {alamat !== "" && (
                  <p className="text-xs text-muted-foreground">
                    Tombol &ldquo;Buka di Google Maps&rdquo; di landing memakai alamat:{" "}
                    <span className="text-foreground">{alamat}</span>
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sosial">
            <Card className="overflow-hidden rounded-xl border-border">
              <div className="h-0.5 w-full bg-amber-500" aria-hidden="true" />
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className="flex size-7 items-center justify-center rounded bg-amber-500/10 text-amber-500">
                    <Share2 size={15} aria-hidden="true" />
                  </span>
                  Media sosial
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Ikon hanya muncul di landing kalau kolomnya diisi. Kolom kosong tidak
                  menampilkan apa pun &mdash; bukan tautan mati.
                </p>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {SOSIAL.map(({ key, label, contoh }) => (
                  <div key={key} className="space-y-1.5">
                    <label htmlFor={key} className="text-sm font-medium text-foreground">
                      {label}
                    </label>
                    <Input
                      id={key}
                      value={nilai[key] ?? ""}
                      onChange={(e) => ubah(key, e.target.value)}
                      placeholder={contoh}
                      className="h-11 rounded-md border-border"
                    />
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
