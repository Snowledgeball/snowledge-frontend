"use client";

import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Input } from "@/components/ui/input";
import Image from "next/image";

export function CtaSection4() {
  return (
    <section 
      className="bg-background py-16 lg:py-24"
      aria-labelledby="cta-heading"
    >
      <div className="container px-6 flex flex-col lg:flex-row items-center gap-12 lg:gap-16 mx-auto">
        {/* Left Column - Content */}
        <div className="flex flex-col gap-6 lg:gap-8 flex-1">
          {/* Section Header */}
          <div className="flex flex-col gap-4 lg:gap-5">
            {/* Category Tag */}
            <p className="text-muted-foreground text-sm lg:text-base font-semibold">
              CTA section
            </p>
            {/* Main Title */}
            <h2 
              id="cta-heading"
              className="text-foreground text-3xl md:text-4xl font-bold"
            >
              Action-driving headline that creates urgency
            </h2>
            {/* Section Description */}
            <p className="text-muted-foreground text-base">
              Add one or two compelling sentences that reinforce your main value
              proposition and overcome final objections. End with a clear reason
              to act now. Align this copy with your CTA button text.
            </p>
          </div>
          {/* Email Form */}
          <form 
            className="flex flex-col md:flex-row gap-3 w-full md:max-w-sm"
            onSubmit={(e) => e.preventDefault()}
            aria-label="Email signup form"
          >
            <Input 
              placeholder="Email" 
              type="email"
              required
              aria-required="true"
              aria-label="Enter your email"
            />
            <Button 
              type="submit"
              aria-label="Start using our service for free"
            >
              Start for free
            </Button>
          </form>
        </div>
        {/* Right Column - Image */}
        <div className="flex-1 w-full">
          <AspectRatio ratio={4 / 3}>
            <Image
              src="https://ui.shadcn.com/placeholder.svg"
              alt="CTA section image"
              fill
              className="rounded-xl object-cover w-full h-full"
            />
          </AspectRatio>
        </div>
      </div>
    </section>
  );
}
