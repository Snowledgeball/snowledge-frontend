"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui";
import { Button } from "@repo/ui/components/button";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function FaqSection1() {
  const tFaq = useTranslations("faq");
  const faqItems = [
    {
      question: tFaq("item_1_question"),
      answer: tFaq("item_1_answer"),
    },
    {
      question: tFaq("item_2_question"),
      answer: tFaq("item_2_answer"),
    },
    {
      question: tFaq("item_3_question"),
      answer: tFaq("item_3_answer"),
    },
    {
      question: tFaq("item_4_question"),
      answer: tFaq("item_4_answer"),
    },
  ];
  return (
    <section
      className="bg-background py-8 md:py-12"
      aria-labelledby="faq-heading"
    >
      <div className="max-w-2xl gap-12 mx-auto px-6 flex flex-col">
        {/* Section Header */}
        <div className="flex flex-col text-center gap-5">
          {/* Category Tag */}
          <div id="faq" className="scroll-mt-24" />
          {/* Main Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {tFaq("title")}
          </h1>
          {/* Section Description */}
          <p className="text-muted-foreground">
            {tFaq("description")} {tFaq("not_found")}{" "}
            <Link
              href="mailto:contact@snowledge.eu"
              className="text-primary underline"
            >
              {tFaq("contact")}
            </Link>
          </p>
        </div>

        {/* FAQ Accordion */}
        <Accordion type="single" defaultValue="item-1" aria-label="FAQ items">
          {/* FAQ Item 1 */}
          {faqItems.map((item, idx) => (
            <AccordionItem value={`item-${idx + 1}`} key={idx}>
              <AccordionTrigger className="text-base font-medium text-left">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* CTA Card */}
        <div className="bg-muted/60 w-full rounded-xl p-6 md:p-8 flex flex-col items-center gap-6">
          <div className="flex flex-col text-center gap-2">
            <h2 className="text-2xl font-bold text-foreground">
              {tFaq("cta_title")}
            </h2>
            <p className="text-base text-muted-foreground">
              {tFaq("cta_description")}
            </p>
          </div>
          <Button asChild aria-label="Contact our support team">
            <a href="mailto:contact@snowledge.eu">{tFaq("cta_button")}</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
