"use client";
import { useParams } from "next/navigation";
import { features } from "@/config/features";
import { notFound } from "next/navigation";

export default function Page() {
  const { community } = useParams();
  if (!features.community.learner.discussions.chat) {
    notFound();
  }
  return <div>Chat général de la communauté {community}</div>;
}
