"use client";
import { useParams } from "next/navigation";
import { features } from "@/config/features";
import { notFound } from "next/navigation";

export default function Page() {
  const { slug } = useParams();
  if (!features.community.myCommunity.trendsAnalytics) {
    notFound();
  }
  return <div>Tendances et analytics pour la communauté {slug}</div>;
}
