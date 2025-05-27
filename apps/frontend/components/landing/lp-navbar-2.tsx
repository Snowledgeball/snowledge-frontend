"use client";

import { Logo } from "@repo/ui/components/logo";
import { Button } from "@repo/ui/components/button";
import { Menu, X, Zap } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  Credenza,
  CredenzaTrigger,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaBody,
  CredenzaFooter,
  CredenzaClose,
} from "@repo/ui/components/credenza";
import { SocialIcon } from "react-social-icons";
import { LanguageSwitcher } from "./shared/langage";
import { PocForm } from "./shared/pocform";
import { redirect, useRouter } from "next/navigation";
import { useUserCommunities } from "@/hooks/useUserCommunities";
import { Community } from "@/types/general";

interface NavMenuItemsProps {
  className?: string;
}

const NavMenuItems = ({ className }: NavMenuItemsProps) => {
  const t = useTranslations("menu");

  const items = [
    { label: t("snowledge"), href: "#" },
    { label: t("features"), href: "#features" },
    { label: t("faq"), href: "#faq" },
    { label: t("partners"), href: "#partners" },
  ];

  return (
    <div className={`flex flex-col md:flex-row gap-1 ${className ?? ""}`}>
      {items.map(({ label, href }) => (
        <Link key={label} href={href}>
          <Button variant="ghost" className="w-full md:w-auto hover:bg-primary">
            {label}
          </Button>
        </Link>
      ))}
    </div>
  );
};

export function LpNavbar2() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const tCTA = useTranslations("cta");
  const tForm = useTranslations("form");
  const tToggle = useTranslations("menu_toggle");

  const router = useRouter();
  const session = { user: { id: 2 } };
  const { data: communities, isLoading } = useUserCommunities(
    session?.user?.id || 0
  );

  // const isLoading = false;
  // const communities: Community[] = [];

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const handleGoTest = () => {
    // TODO: A modifier, quand user fonctionne (login...) Rajouter un bouton dans le header, pour rediriger vers soit les commu rejoint soit le post-sign-up. En grois le bouton onclick appellera la logique juste en dessous
    if (!isLoading && communities) {
      if (communities.length > 0) {
        router.push(`/${communities[0].slug}`);
      } else {
        // TODO:  A MODIFIER VERS SIGN-UP / LOGIN
        router.push("/post-sign-up");
      }
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-background py-3.5 md:py-4 isolate">
      <div className="container gap-4 md:gap-6 px-6 flex flex-col md:flex-row md:items-center md:relative m-auto">
        {/* Logo + réseaux sociaux */}
        <div className="flex justify-between w-full md:w-auto">
          <Link href="/">
            <Logo />
          </Link>
          <div className="flex flex-row items-center gap-3 ml-2">
            <SocialIcon
              url="https://www.linkedin.com/company/snowledge-eu"
              network="linkedin"
              style={{ height: 32, width: 32 }}
              bgColor="transparent"
              fgColor="#64748b"
              label="LinkedIn"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:scale-110 transition-transform"
            />
            <SocialIcon
              url="https://x.com/eusnowledge"
              network="x"
              style={{ height: 32, width: 32 }}
              bgColor="transparent"
              fgColor="#64748b"
              label="X (Twitter)"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:scale-110 transition-transform"
            />
            <SocialIcon
              url="https://discord.gg/ntQTyF6b"
              network="discord"
              style={{ height: 32, width: 32 }}
              bgColor="transparent"
              fgColor="#64748b"
              label="Discord"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:scale-110 transition-transform"
            />
          </div>
          <Button
            variant="ghost"
            className="size-9 flex items-center justify-center md:hidden"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? tToggle("close") : tToggle("open")}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {/* Menu desktop centré */}
        <div className="hidden md:flex md:absolute md:left-1/2 md:-translate-x-1/2 flex-row gap-5">
          <NavMenuItems />
        </div>

        {/* Menu mobile */}
        {isMenuOpen && (
          <div className="md:hidden flex flex-col gap-5 w-full justify-end pb-2.5">
            <NavMenuItems />
            <Credenza>
              <CredenzaTrigger asChild>
                <Button className="w-full">{tCTA("test")}</Button>
              </CredenzaTrigger>
              <CredenzaContent>
                <CredenzaHeader>
                  <CredenzaTitle>{tForm("title")}</CredenzaTitle>
                </CredenzaHeader>
                <CredenzaBody>
                  <PocForm />
                </CredenzaBody>
                <CredenzaFooter>
                  <CredenzaClose asChild>
                    <Button variant="secondary">{tForm("close")}</Button>
                  </CredenzaClose>
                </CredenzaFooter>
              </CredenzaContent>
            </Credenza>
          </div>
        )}

        {/* Bouton CTA + Language Switcher + Bouton éclair */}
        <div className="hidden md:flex md:ml-auto items-center gap-2">
          <Credenza>
            <CredenzaTrigger asChild>
              <Button>{tCTA("test")}</Button>
            </CredenzaTrigger>
            <CredenzaContent>
              <CredenzaHeader>
                <CredenzaTitle>{tForm("title")}</CredenzaTitle>
              </CredenzaHeader>
              <CredenzaBody>
                <PocForm />
              </CredenzaBody>
              <CredenzaFooter>
                <CredenzaClose asChild>
                  <Button variant="secondary">{tForm("close")}</Button>
                </CredenzaClose>
              </CredenzaFooter>
            </CredenzaContent>
          </Credenza>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleGoTest}
            aria-label="Go test"
          >
            <Zap className="w-5 h-5 text-yellow-400" />
          </Button>
          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );
}
