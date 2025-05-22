"use client";

import { useParams } from "next/navigation";
import { features } from "@/config/features";
import { notFound } from "next/navigation";

export default function Page() {
  const { slug } = useParams();
  if (!features.community.contributor.contribute.myContributions) {
    notFound();
  }
  return <div>Mes contributions pour la communauté {slug}</div>;
}
