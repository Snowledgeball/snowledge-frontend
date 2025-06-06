"use client";

import { Button } from "@/components/ui/button";

export function CtaSection6() {
  return (
    <section 
      className="bg-background"
      aria-labelledby="cta-heading"
    >
      <div className="container mx-auto">
        <div className="px-6 py-16 md:p-16 bg-primary sm:rounded-xl">
          <div className="w-full flex flex-col md:flex-row gap-8 items-center text-center md:text-left justify-between">
            <div className="flex flex-col gap-4 max-w-xl">
              <h2 
                id="cta-heading"
                className="text-2xl font-bold text-primary-foreground"
              >
                Action-driving headline that creates urgency
              </h2>
              <p className="text-primary-foreground/80">
                Add one or two compelling sentences that reinforce your main
                value proposition and overcome final objections.
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-3 align-right">
              <Button 
                className="bg-primary-foreground hover:bg-primary-foreground/80 text-primary"
                aria-label="Get started with our service"
              >
                Get started
              </Button>
              <Button
                variant="ghost"
                className="text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/10"
                aria-label="Learn more about our service"
              >
                Learn more
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
