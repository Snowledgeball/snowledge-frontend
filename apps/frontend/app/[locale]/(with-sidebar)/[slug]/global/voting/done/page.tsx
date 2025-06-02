"use client";

import { useParams } from "next/navigation";
import VotingDoneList from "@/components/voting/done/VotingDoneList";
import React from "react";

export default function DonePage() {
  const { slug } = useParams();
  return (
    <div className="px-12 py-4 ">
      <VotingDoneList communitySlug={slug as string} />
    </div>
  );
}
