"use client";

import { useParams } from "next/navigation";
import { features } from "@/config/features";
import { notFound } from "next/navigation";
import { CommunityManager } from "@/components/manage-community/community-manager";

export default function Page() {
  const { community } = useParams();
  if (!features.community.creator.settings) {
    notFound();
  }
  return <CommunityManager />;
}
