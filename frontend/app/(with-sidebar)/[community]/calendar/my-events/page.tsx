"use client";
import { useParams } from "next/navigation";
import { features } from "@/config/features";
import { notFound } from "next/navigation";

export default function Page() {
  const { community } = useParams();
  if (!features.community.calendar.myEvents) {
    notFound();
  }
  return <div>Mes rendez-vous de la communauté {community}</div>;
}
