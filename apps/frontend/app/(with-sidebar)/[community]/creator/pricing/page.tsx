"use client";

import { useParams } from "next/navigation";
import { features } from "@/config/features";
import { notFound } from "next/navigation";

export default function Page() {
  const { community } = useParams();
  if (!features.community.creator.pricing) {
    notFound();
  }
  return <div>Tarifs d&apos;administration pour la communauté {community}</div>;
}
