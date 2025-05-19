"use client";

import { AspectRatio } from "@repo/ui/components/aspect-ratio";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function PartnersSection() {
  const tPartners = useTranslations("partners");
  return (
    <section className="flex flex-col items-center py-8 md:py-12 bg-background">
      <div className="flex flex-col items-center gap-5 max-w-xl">
        <div id="partners" className="scroll-mt-24" />
        <h2 className="text-foreground text-4xl font-bold text-center leading-10">
          {tPartners("title")}
        </h2>
        <p className="text-muted-foreground text-base text-center">
          {tPartners("description")}
        </p>
      </div>

      <div className="container flex flex-row flex-nowrap justify-center gap-16 px-6 mt-6 overflow-x-auto">
        {[
          { src: "/logo-ovh.png", alt: "OVHcloud Startup Program" },
          { src: "/logo-pdl.png", alt: "Région Pays de la Loire" },
          { src: "/logo-starknet.png", alt: "Starknet" },
          { src: "/logo-xrp.png", alt: "Commons XRPL" },
          { src: "/logo-cube3.png", alt: "Cube3" },
        ].map((logo, index) => (
          <div key={index} className="w-[260px] rounded-xl">
            <AspectRatio ratio={1 / 1}>
              <div className="w-full h-full flex items-center justify-center bg-background">
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={160}
                  height={160}
                  className="w-40 h-40 object-contain"
                  priority={index === 0}
                  sizes="(max-width: 768px) 50vw, 160px"
                />
              </div>
            </AspectRatio>
          </div>
        ))}
      </div>
    </section>
  );
}
