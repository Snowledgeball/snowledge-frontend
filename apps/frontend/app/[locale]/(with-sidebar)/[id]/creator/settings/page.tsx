"use client";

import { features } from "@/config/features";
import { notFound } from "next/navigation";
import { CommunityManager } from "@/components/manage-community/community-manager";

export default function Page() {
  if (!features.community.creator.settings.enabled) {
    notFound();
  }
  return <CommunityManager />;
}
