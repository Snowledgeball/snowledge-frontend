"use client";
import { useParams } from "next/navigation";
import { features } from "@/config/features";
import { notFound } from "next/navigation";

export default function Page() {
  const { slug } = useParams();
  if (!features.community.learner.dashboard.overview) {
    notFound();
  }
  return <div>Vue globale du dashboard de la communauté {slug}</div>;
}
