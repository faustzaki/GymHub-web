import Hero from "./components/Hero";
import EquipmentSection from "./components/EquipmentSection";
import FeaturesSection from "./components/FeaturesSection";
import DisciplineSection from "./components/DisciplineSection";
import CoachesSection from "./components/CoachesSection";
import PTProfessionalsSection from "./components/PTProfessionalsSection";
import MembershipSection from "./components/MembershipSection";
import TestimonialsSection from "./components/TestimonialsSection";
import CommunitySection from "./components/CommunitySection";
import ContactSection from "./components/ContactSection";
import StickyCTA from "./components/StickyCTA";
import SectionScrollLanding from "./components/SectionScrollLanding";

/**
 * HomePage — landing GymHub.
 *
 * Urutan mengikuti docs/landing-direction.md §5: pemilih ruang di hero mengubah
 * seluruh halaman di bawahnya (grade foto, ritme tipografi, isi jadwal), lalu
 * bukti bertambah dari alat → alasan → ruang → jadwal → sesi 1-on-1 → biaya →
 * kata member → komunitas. Kalkulator BMI sengaja tidak dipasang di sini.
 */
export default function HomePage() {
  return (
    <>
      {/* 01 — Hero: video per ruang + pemilih disiplin */}
      <Hero />
      {/* 03 — Alat yang ada */}
      <EquipmentSection />
      {/* 04 — Kenapa di sini */}
      <FeaturesSection />
      {/* 05 — Tiga ruang itu nyata */}
      <DisciplineSection />
      {/* 06 — Jadwal & coach */}
      <CoachesSection />
      {/* 07 — Sesi 1-on-1 */}
      <PTProfessionalsSection />
      {/* 08 — Biaya */}
      <MembershipSection />
      {/* 09 — Kata member */}
      <TestimonialsSection />
      {/* 10 — Komunitas */}
      <CommunitySection />
      {/* Penutup — lokasi, jam buka, kontak */}
      <ContactSection />
      <StickyCTA />
      {/* Pendaratan anchor saat muat dingin; scroll biasa tetap tanpa JavaScript. */}
      <SectionScrollLanding />
    </>
  );
}
