"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Banner3() {
  return (
    <aside 
      role="alert"
      aria-label="Cookie consent banner"
      className="bg-background py-4"
    >
      <div className="container mx-auto px-6 flex flex-col md:flex-row gap-6 items-center justify-between">
        <p 
          className="text-sm text-foreground max-w-xl text-center md:text-left"
          id="cookie-consent-description"
        >
          We use cookies to enhance your experience. By clicking "Accept," you
          consent to the use of all cookies. Learn more in our{" "}
          <Link 
            href="#" 
            className="underline"
            aria-label="View cookie policy"
          >
            cookie policy
          </Link>
          .
        </p>
        <div 
          className="flex w-full md:w-auto gap-2 flex-col md:flex-row"
          aria-describedby="cookie-consent-description"
        >
          <Button 
            onClick={() => {/* Add accept handler */}}
            className="order-1 md:order-2 w-full md:w-auto"
            aria-label="Accept all cookies"
          >
            Accept all
          </Button>
          <Button 
            onClick={() => {/* Add reject handler */}}
            className="order-2 md:order-1 w-full md:w-auto" 
            variant="outline"
            aria-label="Reject all cookies"
          >
            Reject all
          </Button>
        </div>
      </div>
    </aside>
  );
}
