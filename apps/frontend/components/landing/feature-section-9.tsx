"use client";

import { Radar, BrainCircuit, Coins } from "lucide-react";
import { useTranslations } from "next-intl";

export function FeatureSection9() {
  const tFeatures = useTranslations("features");
  return (
    <section className="bg-background py-8 md:py-12">
      <div className="container mx-auto px-6 flex flex-col gap-12 md:gap-16">
        <div className="flex flex-col gap-4 md:gap-5 max-w-xl mx-auto text-center">
          <div id="features" className="scroll-mt-24" />
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            {tFeatures("title_start")} <span className="text-primary">{tFeatures("title_create")}</span> {tFeatures("title_and")} <span className="text-primary">{tFeatures("title_sell")}</span> {tFeatures("title_end")}
          </h2>
          <p className="text-base text-muted-foreground">
            {tFeatures("description")}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-6 justify-items-center items-start">
          <div className="flex flex-col items-center text-center">
            <div className="flex justify-center items-center w-10 h-10 shrink-0 rounded-md bg-background border shadow-sm mb-2">
              <Radar className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground min-h-[3rem] flex items-center justify-center text-lg md:text-xl mb-2 text-center">
              {tFeatures("card_1_title")}
            </h3>
            <p className="text-muted-foreground">
              {tFeatures("card_1_text")}
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex justify-center items-center w-10 h-10 shrink-0 rounded-md bg-background border shadow-sm mb-2">
              <BrainCircuit className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground min-h-[3rem] flex items-center justify-center text-lg md:text-xl mb-2 text-center">
              {tFeatures("card_2_title")}
            </h3>
            <p className="text-muted-foreground">
              {tFeatures("card_2_text")}
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex justify-center items-center w-10 h-10 shrink-0 rounded-md bg-background border shadow-sm mb-2">
              <Coins className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground min-h-[3rem] flex items-center justify-center text-lg md:text-xl mb-2 text-center">
              {tFeatures("card_3_title")}
            </h3>
            <p className="text-muted-foreground">
              {tFeatures("card_3_text")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
