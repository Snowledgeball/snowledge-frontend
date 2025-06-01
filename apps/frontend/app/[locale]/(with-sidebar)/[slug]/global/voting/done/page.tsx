"use client";

import { useParams } from "next/navigation";
import VotingDoneList from "@/components/voting/done/voting-done-list";
import React from "react";

export default function DonePage() {
  const { slug } = useParams();
  return <VotingDoneList communitySlug={slug as string} />;
}
