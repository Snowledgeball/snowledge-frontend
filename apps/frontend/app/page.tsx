"use client";

import { Button } from "ui";
import Link from "next/link";
export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Link href="/create-community">
        <Button>Create Community</Button>
      </Link>
    </div>
  );
}
