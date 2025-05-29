"use client";

import { LpNavbar2 } from "@/components/landing/lp-navbar-2";
import { HeroSection7 } from "@/components/landing/hero-section-7";
import { FeatureSection9 } from "@/components/landing/feature-section-9";
import { FaqSection1 } from "@/components/landing/faq-section-1";
import PartnersSection from "@/components/landing/partners";
import { Footer2 } from "@/components/landing/footer-2";
import { UpgradeBanner } from "@repo/ui/components/upgrade-banner";
import { redirect, useSearchParams, useRouter } from "next/navigation";
import { useUserCommunities } from "@/hooks/useUserCommunities";
import { useAuth } from "@/contexts/auth-context";
import { useEffect } from "react";

export default function Home() {
  const { user, fetchDataUser } = useAuth();
  const noRedirect = useSearchParams().get("no-redirect");
  const router = useRouter();
  // Appelle le hook directement dans le composant
  const { data: communities, isLoading } = useUserCommunities(user?.id || 0);

  useEffect(() => {
    fetchDataUser();
    if (!isLoading && communities && !noRedirect && user) {
      if (communities.length > 0) {
        router.push(`/${communities[0].slug}`);
      } else {
        router.push("/post-sign-up");
      }
    }
  }, [isLoading, communities, noRedirect, router]);

  // Si pas connecté : affiche la landing page
  if (!user || noRedirect) {
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

  return null;
}
