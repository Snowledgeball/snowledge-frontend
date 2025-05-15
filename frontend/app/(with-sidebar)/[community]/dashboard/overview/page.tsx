"use client";
import { useParams } from "next/navigation";
import { features } from "@/config/features";
import { notFound } from "next/navigation";

export default function Page() {
  const { community } = useParams();
  if (!features.community.dashboard.overview) {
    notFound();
  }
  return <div>Vue globale du dashboard de la communauté {community}</div>;
}
