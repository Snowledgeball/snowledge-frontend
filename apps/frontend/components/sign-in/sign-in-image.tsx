"use client";

import { Logo, Button, Checkbox, Input, Label } from "@repo/ui";
import Image from "next/image";
import Link from "next/link";

export default function SignInImage() {
  return (
    <>
      {/* Right side: Image (hidden on mobile) */}
      {/* Remplacer le img par un Image de next/image, dès qu'on met une image custom*/}
      <img
        src="https://ui.shadcn.com/placeholder.svg"
        alt="Image"
        width="1800"
        height="1800"
        className="w-1/2 rounded-xl object-cover md:block hidden"
      />
    </>
  );
}
