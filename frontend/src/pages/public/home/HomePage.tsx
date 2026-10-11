import Hero from "./components/Hero";
import FeaturesSection from "./components/FeaturesSection";
import { ClassesTrainersSection } from "./components/ClassesTrainersSection";
import PricingBMISection from "./components/PricingBMISection";
import ContactSection from "./components/ContactSection";

/**
 * HomePage — Halaman utama (beranda) website.
 *
 * Semua section yang sebelumnya ada di App.tsx dipindahkan ke sini.
 * Dengan begitu, App.tsx hanya bertugas sebagai "router hub"
 * dan halaman ini menjadi satu unit yang mandiri.
 */
export default function HomePage() {
  return (
    <>
      {/* Section 1 — Hero */}
      <Hero />

      {/* Section 2 — Features / App Benefits */}
      <FeaturesSection />

      {/* Section 3 — Classes & Trainers */}
      <ClassesTrainersSection />

      {/* Section 4 — Pricing & BMI Calculator */}
      <PricingBMISection />

      {/* Section 5 — Contact / CTA */}
      <ContactSection />
    </>
  );
}
