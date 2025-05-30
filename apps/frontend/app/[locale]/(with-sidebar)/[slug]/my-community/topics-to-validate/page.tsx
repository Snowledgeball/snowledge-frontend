"use client";
import { useParams } from "next/navigation";
import { features } from "@/config/features";
import { notFound } from "next/navigation";

export default function Page() {
  const { slug } = useParams();
  if (!features.community.myCommunity.topicsToValidate) {
    notFound();
  }
  return <div>Thèmes à valider pour la communauté {slug}</div>;
}
