"use client";

import { useParams } from "next/navigation";
import { features } from "@/config/features";
import { notFound } from "next/navigation";

export default function Page() {
  const { community } = useParams();
  if (!features.community.contribute.myContributions) {
    notFound();
  }
  return <div>Mes contributions pour la communauté {community}</div>;
}
