import { DisciplineBlock, Reveal } from "@/components/brand/DisciplineBlock";
import BridgeSpan from "@/components/brand/BridgeSpan";

// [angka nyata] — rasio & jam operasional mengikuti PRODUCT.md; kuota kelas ditunggu data backend.
const REASONS = [
  {
    title: "Satu atap, tiga ruang",
    body: "Angkat beban, yoga, dan muaythai ada di gedung yang sama. Satu kartu member, satu jadwal, satu riwayat latihan.",
    proof: "Tidak perlu tiga membership terpisah.",
  },
  {
    title: "Jadwal yang bisa dilihat sebelum datang",
    body: "Setiap kelas punya jam, coach, dan sisa kuota. Jadwal mingguan dipublikasikan, perubahan tercatat.",
    proof: "24 orang per kelas — terasa penuh tanpa berdesakan.",
  },
  {
    title: "Coach bersertifikat, bukan instruktur lepas",
    body: "Coach menangani kelas berkelompok dan sesi 1-on-1. Sertifikasi tercantum di profil masing-masing.",
    proof: "4 coach tetap yang kamu temui berulang.",
  },
  {
    title: "Progres tercatat di akunmu",
    body: "Beban, durasi, dan kehadiran dicatat per sesi. Kamu tahu kapan angkanya naik, bukan hanya merasa lebih baik.",
    proof: "Riwayat latihan tetap ada meski ganti HP.",
  },
];

/**
 * Blok 04 — Kenapa di sini, bukan gym lain.
 * Angka besar 01–04 menggantikan ikon generik; satu garis jembatan di atas
 * daftar (pemakaian BridgeSpan #1 dari maksimal 2).
 */
export default function FeaturesSection() {
  return (
    <DisciplineBlock
      id="kenapa"
      rhythm={2}
      title="Empat alasan yang bisa kamu periksa"
      lead="Kami tidak menjanjikan tubuh baru dalam sebulan. Yang kami janjikan: alat lengkap, jadwal jelas, dan angka latihan yang bisa kamu bandingkan sendiri."
    >
      <BridgeSpan edge="top" className="mb-12 text-primary" />

      <ol className="grid gap-px border border-border bg-border md:grid-cols-2">
        {REASONS.map((reason, index) => (
          <li key={reason.title} className="bg-background">
            <Reveal delay={index * 60} className="h-full">
              <div className="flex h-full flex-col gap-4 p-8 lg:p-10">
                <div className="flex items-baseline gap-4">
                  <span className="font-extrabold text-6xl leading-none tracking-tighter text-primary tabular-nums lg:text-7xl">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-xl font-extrabold uppercase leading-tight tracking-tight text-foreground lg:text-2xl">
                    {reason.title}
                  </h3>
                </div>
                <p className="text-base font-light leading-relaxed text-muted-foreground">{reason.body}</p>
                <p className="mt-auto flex items-center gap-3 border-t border-border pt-4 text-sm text-foreground">
                  <span aria-hidden="true" className="h-px w-6 shrink-0 bg-primary" />
                  {reason.proof}
                </p>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </DisciplineBlock>
  );
}
