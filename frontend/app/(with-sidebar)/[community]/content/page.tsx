"use client";

import { useParams } from "next/navigation";
import { features } from "@/config/features";
import { notFound } from "next/navigation";

export default function Page() {
  const { community } = useParams();
  if (!features.community.content.enabled) {
    notFound();
  }
  return <div>Contenu de la communauté {community}</div>;
}
