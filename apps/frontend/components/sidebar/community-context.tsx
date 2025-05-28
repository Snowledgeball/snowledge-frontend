"use client";
import * as React from "react";
import { useUserCommunities } from "../../hooks/useUserCommunities";
import { Community } from "@/types/general";
import { useAuth } from "@/contexts/auth-context";
import { useEffect } from "react";

export const CommunityContext = React.createContext<{
  activeCommunity: Community | null;
  setActiveCommunity: (c: Community) => void;
  communities: Community[] | null;
} | null>(null);

export function CommunityProvider({ children }: { children: React.ReactNode }) {
  const { user, fetchDataUser } = useAuth();
  const { data: communities, isSuccess } = useUserCommunities(user?.id || 0);
  const [activeCommunity, setActiveCommunity] =
    React.useState<Community | null>(null);

  useEffect(() => {
    fetchDataUser();
  }, []);

  // Restaure la communauté active depuis le localStorage au montage
  React.useEffect(() => {
    if (isSuccess && communities && communities.length > 0) {
      const savedId =
        typeof window !== "undefined"
          ? localStorage.getItem("activeCommunityId")
          : null;
      const found = savedId
        ? communities.find((c) => String(c.id) === savedId)
        : null;
      if (found) {
        setActiveCommunity(found);
      } else {
        setActiveCommunity(communities[0]);
      }
    }
  }, [isSuccess, communities]);

  // Sauvegarde l'id de la communauté active à chaque changement
  React.useEffect(() => {
    if (activeCommunity && typeof window !== "undefined") {
      localStorage.setItem("activeCommunityId", String(activeCommunity.id));
    }
  }, [activeCommunity]);

  return (
    <CommunityContext.Provider
      value={{
        activeCommunity,
        setActiveCommunity,
        communities: communities || null,
      }}
    >
      {children}
    </CommunityContext.Provider>
  );
}
