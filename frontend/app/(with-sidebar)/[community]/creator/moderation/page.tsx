"use client";
import { useParams } from "next/navigation";
import { features } from "@/config/features";
import { notFound } from "next/navigation";

export default function Page() {
  const { community } = useParams();
  if (!features.community.creator.moderation) {
    notFound();
  }
  return <div>Modération pour la communauté {community}</div>;
}
