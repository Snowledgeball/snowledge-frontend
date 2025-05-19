"use client";

import { Button } from "@repo/ui/components/button";
import { ArrowRight } from "lucide-react";
import { AspectRatio } from "@repo/ui/components/aspect-ratio";
import Image from "next/image";
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
import Link from "next/link";
import { PocForm } from "./shared/pocform";
import { useTranslations } from "next-intl";

export function HeroSection7() {
  const tHero = useTranslations("hero");
  return (
    <section
      className="bg-background pt-8 lg:pt-12 pb-6 lg:pb-8"
      aria-labelledby="hero-heading"
    >
      <div className="container px-6 flex flex-col items-center gap-12 lg:gap-16 mx-auto">
        <div className="flex gap-12 lg:gap-16">
          <div className="flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-8">
            <h1
              id="hero-heading"
              className="text-foreground text-3xl lg:text-5xl font-bold flex-1"
            >
              {tHero("title_start")}
              <span className="text-primary"> {tHero("title_blind")}</span>{" "}
              {tHero("title_and")}
              <span className="text-primary"> {tHero("title_alone")}</span>
              {tHero("title_end")}
            </h1>
            <div className="flex-1 w-full flex flex-col gap-8">
              <p className="text-muted-foreground text-base lg:text-lg">
                {tHero("description")}
              </p>

              <div className="flex flex-col lg:flex-row gap-3">
                <Credenza>
                  <CredenzaTrigger asChild>
                    <Button>{tHero("cta")}</Button>
                  </CredenzaTrigger>
                  <CredenzaContent>
                    <CredenzaHeader>
                      <CredenzaTitle>Inscription POC Snowledge</CredenzaTitle>
                    </CredenzaHeader>
                    <CredenzaBody>
                      <PocForm />
                    </CredenzaBody>
                    <CredenzaFooter>
                      <CredenzaClose asChild>
                        <Button variant="secondary">Fermer</Button>
                      </CredenzaClose>
                    </CredenzaFooter>
                  </CredenzaContent>
                </Credenza>
                <Link href="#features">
                  <Button variant="ghost">
                    {tHero("discover")}
                    <ArrowRight />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <AspectRatio ratio={16 / 9}>
          <div className="relative w-full h-full bg-gradient-to-b from-background/80 to-transparent rounded-xl overflow-hidden">
            <Image
              src="/image.png"
              alt="Hero section visual"
              fill
              priority
              className="object-contain w-full h-full"
            />
          </div>
        </AspectRatio>
      </div>
    </section>
  );
}
