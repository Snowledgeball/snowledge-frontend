"use client";

import { useParams } from "next/navigation";
import { features } from "@/config/features";
import { notFound } from "next/navigation";

export default function Page() {
  const { id } = useParams();
  if (!features.community.learner.ideas.propose) {
    notFound();
  }
  return <div>Proposer une idée pour la communauté {id}</div>;
}
