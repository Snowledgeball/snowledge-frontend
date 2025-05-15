"use client";
import { useParams } from "next/navigation";
import { features } from "@/config/features";
import { notFound } from "next/navigation";

export default function Page() {
  const { community } = useParams();
  if (!features.community.content.podcasts) {
    notFound();
  }
  return <div>Podcasts de la communauté {community}</div>;
}
