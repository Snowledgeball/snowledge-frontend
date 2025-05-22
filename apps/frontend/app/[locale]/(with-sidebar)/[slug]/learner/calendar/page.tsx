"use client";
import { useParams } from "next/navigation";
import { features } from "@/config/features";
import { notFound } from "next/navigation";

export default function Page() {
  const { slug } = useParams();
  if (!features.community.learner.calendar.enabled) {
    notFound();
  }
  return <div>Calendrier de la communauté {slug}</div>;
}
