"use client";

import CreateVoteScreen from "@/components/voting/create-topic/CreateProposalScreen";
import React from "react";
import { useParams } from "next/navigation";

export default function CreateTopicPage() {
  const { slug } = useParams();
  return <CreateVoteScreen communitySlug={slug as string} />;
}
