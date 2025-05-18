import { Navbar1 } from "@/components/landing/navbar-1";
import { HeroSection1 } from "@/components/landing/hero-section-1";
import { FeatureSection1 } from "@/components/landing/feature-section-1";
import { PricingSection1 } from "@/components/landing/pricing-section-1";
import { TestimonialsSection1 } from "@/components/landing/testimonials-section-1";
import { Footer1 } from "@/components/landing/footer-1";

// TODO: Ajouter la landing faite par léo
export default function Home() {
  return (
    <>
      <Navbar1 />
      <HeroSection1 />
      <FeatureSection1 />
      <PricingSection1 />
      <TestimonialsSection1 />
      <Footer1 />
    </>
  );
}
