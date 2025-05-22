"use client";
import { useParams } from "next/navigation";
import { features } from "@/config/features";
import { notFound } from "next/navigation";

export default function Page() {
  const { slug } = useParams();
  if (!features.community.contributor.contribute.collaborations) {
    notFound();
  }
  return <div>Collaborations pour la communauté {slug}</div>;
}
