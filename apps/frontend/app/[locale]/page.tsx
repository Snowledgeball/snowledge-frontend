import { LpNavbar2 } from "@/components/landing/lp-navbar-2";
import { HeroSection7 } from "@/components/landing/hero-section-7";
import { FeatureSection9 } from "@/components/landing/feature-section-9";
import { FaqSection1 } from "@/components/landing/faq-section-1";
import PartnersSection from "@/components/landing/partners";
import { Footer2 } from "@/components/landing/footer-2";
import { UpgradeBanner } from "@repo/ui/components/upgrade-banner";

export default function Home() {
  return (
    <>
      <LpNavbar2 />
      <div className="mt-4 md:mt-6 mb-0">
        <UpgradeBanner />
      </div>
      <div className="bg-hero-gradient">
        <HeroSection7 />
      </div>
      <section id="features" className="scroll-mt-24 bg-features">
        <FeatureSection9 />
      </section>
      <section className="bg-faq">
        <FaqSection1 />
      </section>
      <PartnersSection />
      <div className="bg-footer-gradient">
        <Footer2 />
      </div>
    </>
  );
}
