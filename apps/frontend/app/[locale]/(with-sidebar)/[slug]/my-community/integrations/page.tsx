"use client";
import { useParams } from "next/navigation";
import { features } from "@/config/features";
import { notFound } from "next/navigation";
import { ManageIntegrations } from "@/components/manage-integrations/ManageIntegrations";
import { useCurrentCommunity } from "@/hooks/useCurrentCommunity";

export default function Page() {
  const { slug } = useParams();
  if (!features.community.myCommunity.integrations) {
    notFound();
  }

  const { activeCommunity } = useCurrentCommunity();
  console.log(activeCommunity);
  return (
    <div>
      <div>Intégrations pour la communauté {activeCommunity?.name}</div>
      <ManageIntegrations guildId={activeCommunity?.discordGuildId as string} />
    </div>
  );
}
