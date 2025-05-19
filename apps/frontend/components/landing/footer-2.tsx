"use client";

import { Logo } from "@repo/ui/components/logo";
import Link from "next/link";
import { Separator } from "@repo/ui/components/separator";
import { SocialIcon } from "react-social-icons";
import { useTranslations } from "next-intl";

export function Footer2() {
  const tFooter = useTranslations("footer");
  return (
    <footer
      className="bg-background py-16 lg:py-24"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="container px-6 mx-auto flex flex-col gap-12 lg:gap-16">
        <div className="flex flex-col gap-12">
          {/* Top Section */}
          <div className="flex flex-col lg:flex-row md:justify-between md:items-center gap-12">
            {/* Logo and Navigation */}
            <div className="flex flex-col items-center lg:flex-row gap-12 w-full justify-between">
              {/* Logo + Nav */}
              <div className="flex flex-col items-center lg:flex-row gap-12">
                {/* Logo */}
                <Link href="/" aria-label="Go to homepage">
                  <Logo />
                </Link>
                {/* Main Navigation */}
                <nav
                  className="flex flex-col md:flex-row items-center gap-6 md:gap-8 text-center"
                  aria-label="Footer navigation"
                >
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {tFooter("home")}
                  </Link>
                  <Link
                    href="https://www.linkedin.com/company/snowledge-eu"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {tFooter("about")}
                  </Link>
                  <Link
                    href="mailto:contact@snowledge.eu"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {tFooter("contact")}
                  </Link>
                </nav>
              </div>
              {/* Social Icons */}
              <div className="flex flex-row items-center gap-6 mt-8 lg:mt-0">
                {/* Ajout de la classe custom-social-hover pour appliquer la couleur klch au hover */}
                <SocialIcon
                  url="https://www.linkedin.com/company/snowledge-eu"
                  network="linkedin"
                  style={{ height: 32, width: 32 }}
                  bgColor="transparent"
                  fgColor="#64748b"
                  label="LinkedIn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:scale-110 transition-transform custom-social-hover"
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
                  className="hover:scale-110 transition-transform custom-social-hover"
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
                  className="hover:scale-110 transition-transform custom-social-hover"
                />
              </div>
            </div>
          </div>

          {/* Section Divider */}
          <Separator role="presentation" />

          {/* Bottom Section */}
          <div className="flex flex-col lg:flex-row justify-between items-center gap-12 text-center">
            {/* Copyright Text */}
            <p className="text-muted-foreground order-2 md:order-1">
              <span>Copyright © {new Date().getFullYear()}</span>{" "}
              <Link href="/" className="hover:underline">
                snowledge.eu
              </Link>
              . {tFooter("copyright")}
            </p>
            {/* Legal Navigation */}
            <nav
              className="flex flex-col md:flex-row items-center gap-6 md:gap-8 order-1 md:order-2"
              aria-label="Legal links"
            >
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {tFooter("privacy")}
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {tFooter("terms")}
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
