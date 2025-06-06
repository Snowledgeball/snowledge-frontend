"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export function ContactSection4() {
  return (
    <section 
      className="bg-background py-16 md:py-0"
      aria-labelledby="contact-heading"
    >
      <div className="flex flex-col md:flex-row gap-8 md:gap-0">
        {/* Left Column */}
        <div className="flex flex-1 items-center justify-center flex-1 px-6 py-0 md:py-24">
          <div className="flex flex-col gap-6 max-w-md">
            {/* Section Header */}
            <div className="flex flex-col gap-4">
              {/* Category Tag */}
              <p className="text-sm md:text-base font-semibold text-muted-foreground">
                Contact us
              </p>
              {/* Main Title */}
              <h2 
                id="contact-heading"
                className="text-3xl md:text-4xl font-bold text-foreground"
              >
                Get in touch
              </h2>
              {/* Section Description */}
              <p className="text-base text-muted-foreground">
                Write a welcoming sentence that encourage contact. Include your
                response time commitment and highlight your team's readiness to
                help.
              </p>
            </div>

            {/* Contact Links */}
            <div className="flex flex-col gap-4">
              {/* Phone Link */}
              <Link href="#" className="flex gap-3 items-start hover:underline">
                <div className="pt-0.5">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <span className="text-base font-medium text-card-foreground leading-6">
                  (406) 555-0120
                </span>
              </Link>

              {/* Email Link */}
              <Link href="#" className="flex gap-3 items-start hover:underline">
                <div className="pt-0.5">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <span className="text-base font-medium text-card-foreground leading-6">
                  hello@example.com
                </span>
              </Link>

              {/* Location Link */}
              <Link href="#" className="flex gap-3 items-start hover:underline">
                <div className="pt-0.5">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <span className="text-base font-medium text-card-foreground leading-6">
                  192 Griffin Street, Gilbert, AZ 32521
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Separator */}
        <Separator className="block md:hidden" />

        {/* Right Column */}
        <div className="md:bg-muted/40 flex flex-col items-center justify-center flex-1 px-6 py-0 md:py-24">
          {/* Contact Form */}
          <form 
            className="flex flex-col gap-5 md:gap-6 max-w-md w-full"
            onSubmit={(e) => e.preventDefault()}
            aria-label="Contact form"
          >
            {/* Name Input */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                placeholder="Name"
                required
                aria-required="true"
              />
            </div>

            {/* Email Input */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="Email"
                required
                aria-required="true"
              />
            </div>

            {/* Message Textarea */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Type your message"
                className="min-h-[106px]"
                required
                aria-required="true"
              />
            </div>

            {/* Privacy Policy Checkbox */}
            <div className="flex items-center gap-2">
              <Checkbox 
                id="privacy"
                required
                aria-required="true"
              />
              <Label
                htmlFor="privacy"
                className="font-normal leading-tight text-muted-foreground"
              >
                By selecting this you agree to our{" "}
                <Link href="#" className="underline text-foreground">
                  Privacy Policy
                </Link>
                .
              </Label>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full">
              Send message
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
