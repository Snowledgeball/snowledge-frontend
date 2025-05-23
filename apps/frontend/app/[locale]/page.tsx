"use client";

import { LpNavbar2 } from "@/components/landing/lp-navbar-2";
import { HeroSection7 } from "@/components/landing/hero-section-7";
import { FeatureSection9 } from "@/components/landing/feature-section-9";
import { FaqSection1 } from "@/components/landing/faq-section-1";
import PartnersSection from "@/components/landing/partners";
import { Footer2 } from "@/components/landing/footer-2";
import { UpgradeBanner } from "@repo/ui/components/upgrade-banner";
import { redirect } from "next/navigation";
import { useUserCommunities } from "@/hooks/use-user-communities";

export default function Home() {
  // const session = { user: { id: 2 } }; // TODO: remplacer par le user id

  // Appelle le hook directement dans le composant
  // const { data: communities, isLoading } = useUserCommunities(
  //   session?.user?.id || 0
  // );

  // Redirection selon le résultat
  // TODO: A modifier, quand user fonctionne (login...) Rajouter un bouton dans le header, pour rediriger vers soit les commu rejoint soit le post-sign-up. En grois le bouton onclick appellera la logique juste en dessous
  // if (!isLoading && communities) {
  //   if (communities.length > 0) {
  //     redirect(`/${communities[0].slug}`);
  //   } else {
  //     redirect("/post-sign-up");
  //   }
  // }

  // Si pas connecté : affiche la landing page
  // if (!session) {
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
  // }

  // return null;
}
