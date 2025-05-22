"use client";
import { useParams } from "next/navigation";
import { features } from "@/config/features";
import { notFound } from "next/navigation";

export default function Page() {
  const { slug } = useParams();
  if (!features.community.learner.dashboard.enabled) {
    notFound();
  }
  return <div>Tableau de bord de la communauté {slug}</div>;
}
