"use client";

import VotingInProgressList from "@/components/voting/in-progress/VotingInProgressList";
import { useParams } from "next/navigation";
import React from "react";

export default function InProgressPage() {
  const { slug } = useParams();
  return (
    <div className="px-12 py-4 ">
      <VotingInProgressList communitySlug={slug as string} />
    </div>
  );
}
