import { Navbar1 } from "@/components/pro-blocks/navbars/navbar-1";
import { HeroSection1 } from "@/components/pro-blocks/hero-sections/hero-section-1";
import { FeatureSection1 } from "@/components/pro-blocks/feature-sections/feature-section-1";
import { PricingSection1 } from "@/components/pro-blocks/pricing-sections/pricing-section-1";
import { TestimonialsSection1 } from "@/components/pro-blocks/testimonials-sections/testimonials-section-1";
import { Footer1 } from "@/components/pro-blocks/footers/footer-1";

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
