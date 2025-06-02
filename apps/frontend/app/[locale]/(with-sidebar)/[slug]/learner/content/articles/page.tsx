"use client";
import { useParams } from "next/navigation";
import { features } from "@/config/features";
import { notFound } from "next/navigation";

export default function Page() {
  const { slug } = useParams();
  if (!features.community.learner.content.articles) {
    notFound();
  }
  return <div>Articles de la communauté {slug}</div>;
}
