"use client";

import { useParams } from "next/navigation";
import { features } from "@/config/features";
import { notFound } from "next/navigation";

export default function Page() {
  const { community } = useParams();
  if (!features.community.learner.ideas.myIdeas) {
    notFound();
  }
  return <div>Mes idées pour la communauté {community}</div>;
}
