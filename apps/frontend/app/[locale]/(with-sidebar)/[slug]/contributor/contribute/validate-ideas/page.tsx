"use client";

import { useParams } from "next/navigation";
import { features } from "@/config/features";
import { notFound } from "next/navigation";

export default function Page() {
  const { slug } = useParams();
  if (!features.community.contributor.contribute.validateIdeas) {
    notFound();
  }
  return <div>Idées à valider pour la communauté {slug}</div>;
}
