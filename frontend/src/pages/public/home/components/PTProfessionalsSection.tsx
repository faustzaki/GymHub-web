import { DisciplineBlock, Reveal } from "@/components/brand/DisciplineBlock";
import { Button } from "@/components/ui/button";
import { DISCIPLINES, useDisciplineStore } from "@/store/useDisciplineStore";

const WHATSAPP_NUMBER = "6281234567890";
const waLink = (text: string) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

// dummy — nama & hasil contoh; ganti setelah paket PT final di backend.
const PROFESSIONALS = [
  {
    name: "Rangga Pratama",
    focus: "Kekuatan & teknik angkat",
    outcome: "Menyusun siklus 8 minggu sampai beban kerjamu naik tanpa cedera punggung.",
    photo: "/assets/pt-1.jpg",
    alt: "Potret coach kekuatan pria berusia tiga puluhan di latar gelap",
  },
  {
    name: "Nadia Kusuma",
    focus: "Mobilitas & muaythai pemula",
    outcome: "Membenahi pijakan dan rentang gerak sebelum ronde pertama, satu sesi per minggu.",
    photo: "/assets/pt-2.jpg",
    alt: "Potret coach perempuan dengan balutan tangan tinju di latar gelap",
  },
  {
    name: "Damar Wijaya",
    focus: "Muaythai & kondisi",
    outcome: "Membawa member dari pad work dasar ke sparing terkendali dalam 12 sesi.",
    photo: "/assets/pt-3.jpg",
    alt: "Potret coach muaythai pria berusia empat puluhan di latar gelap",
  },
];

/** Blok 07 — Sesi 1-on-1. */
export default function PTProfessionalsSection() {
  const discipline = useDisciplineStore((s) => s.discipline);

  return (
    <DisciplineBlock
      id="pt"
      rhythm={3}
      tone="raised"

      title="Kalau butuh didampingi satu orang"
      lead="Sesi personal 60 menit, dijadwalkan lewat WhatsApp. Coach menyusun program berdasarkan catatan latihanmu, bukan template umum."
      className="border-y border-border"
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {PROFESSIONALS.map((person, index) => (
          <Reveal key={person.name} delay={index * 70} className="h-full">
            <article className="flex h-full flex-col border border-border bg-background">
              <img
                src={person.photo}
                alt={person.alt}
                loading="lazy"
                decoding="async"
                className="aspect-[3/4] w-full object-cover brightness-[0.82] contrast-[1.08]"
              />
              <div className="flex flex-1 flex-col gap-3 p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary-text">{person.focus}</p>
                <h3 className="text-xl font-extrabold uppercase tracking-tight text-foreground">{person.name}</h3>
                <p className="text-sm font-light leading-relaxed text-muted-foreground">{person.outcome}</p>
                <Button
                  asChild
                  variant="outline"
                  className="mt-auto h-11 rounded border-border bg-transparent text-sm font-bold uppercase tracking-widest text-foreground hover:bg-card hover:text-foreground focus-visible:ring-ring"
                >
                  <a
                    href={waLink(`Halo Bifrost, saya ingin jadwal sesi PT dengan ${person.name} (${DISCIPLINES[discipline].name}).`)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Tanya jadwal {person.name.split(" ")[0]}
                  </a>
                </Button>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        Sesi PT berlaku di ruang {DISCIPLINES[discipline].name} maupun ruang lain, sesuai program yang disusun coach.
      </p>
    </DisciplineBlock>
  );
}
