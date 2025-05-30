"use client";

import VotingInProgressList from "@/components/voting/in-progress/voting-in-progress-list";
import { useParams } from "next/navigation";
import React from "react";

export default function InProgressPage() {
  const { slug } = useParams();
  return <VotingInProgressList communitySlug={slug as string} />;
}
