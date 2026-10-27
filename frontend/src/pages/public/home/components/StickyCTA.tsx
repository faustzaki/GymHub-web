import { useEffect, useState } from "react";

/**
 * Mobile-only fixed bottom bar. Appears after hero exits viewport,
 * hides when contact section enters. z-[90] sits below navbar z-[100].
 */
export default function StickyCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("home");
    const contact = document.getElementById("contact");
    if (!hero || !contact) return;

    let pastHero = false;
    let contactVisible = false;

    const update = () => setVisible(pastHero && !contactVisible);

    // Separate observer for hero — fires when hero leaves viewport.
    const heroObs = new IntersectionObserver(([entry]) => {
      pastHero = !entry.isIntersecting;
      update();
    });

    // Contact observer: rootMargin bottom detects entry 80px early so the
    // CTA hides before it overlaps the contact form. threshold 0.01 forces
    // a callback even when content-visibility: auto delays paint.
    const contactObs = new IntersectionObserver(
      ([entry]) => {
        contactVisible = entry.isIntersecting;
        update();
      },
      { rootMargin: "0px 0px 80px 0px", threshold: 0.01 },
    );

    heroObs.observe(hero);
    contactObs.observe(contact);
    return () => {
      heroObs.disconnect();
      contactObs.disconnect();
    };
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-[90] border-t border-border bg-primary shadow-lg shadow-black/30 transition-transform duration-300 sm:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex min-h-12 items-center justify-center px-4 py-2">
        <a
          href="#membership"
          className="flex h-11 w-full items-center justify-center rounded text-sm font-bold uppercase tracking-widest text-primary-foreground"
        >
          Mulai Latihanmu
        </a>
      </div>
    </div>
  );
}
