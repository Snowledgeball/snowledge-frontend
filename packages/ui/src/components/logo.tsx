// components/logo.tsx
import * as React from "react";
import Image from "next/image";

export function Logo() {
  return (
    <Image
      src="/Logo - bleu.png"
      alt="Snowledge logo"
      width={48}
      height={48}
      priority
      className="h-12 w-12 object-contain"
    />
  );
}