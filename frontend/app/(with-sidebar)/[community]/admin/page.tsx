"use client";

import { useParams } from "next/navigation";
import { features } from "@/config/features";
import { notFound } from "next/navigation";

export default function Page() {
  const { community } = useParams();
  if (!features.community.admin.enabled) {
    notFound();
  }
  return <div>Administration de la communauté {community}</div>;
}
