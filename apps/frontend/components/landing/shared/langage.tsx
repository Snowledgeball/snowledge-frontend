"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@repo/ui/components/popover";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import { Globe } from "lucide-react";
import ReactCountryFlag from "react-country-flag";

const languages = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
];

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname.split("/")[1];

  const switchLocale = (locale: string) => {
    const segments = pathname.split("/");
    segments[1] = locale;
    router.push(segments.join("/"));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="text-xl">
          <Globe className="w-6 h-6" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-2">
        {languages.map(({ code, label }) => (
          <Button
            key={code}
            variant="ghost"
            className={cn(
              "w-full justify-start",
              code === currentLocale && "bg-muted font-bold"
            )}
            onClick={() => switchLocale(code)}
          >
            <ReactCountryFlag
              countryCode={code === "fr" ? "FR" : "GB"}
              svg
              className="mr-2"
            />{" "}
            {label}
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
