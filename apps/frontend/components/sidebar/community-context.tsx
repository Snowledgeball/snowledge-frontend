"use client";
import * as React from "react";
import { useUserCommunities } from "../../hooks/useUserCommunities";
import { Community } from "@/types/general";

const CommunityContext = React.createContext<{
  activeCommunity: Community | null;
  setActiveCommunity: (c: Community) => void;
  communities: Community[] | null;
} | null>(null);

export function CommunityProvider({ children }: { children: React.ReactNode }) {
  const { data: communities, isSuccess } = useUserCommunities(2); // TODO: remplacer 2 par l'id réel de l'utilisateur
  const [activeCommunity, setActiveCommunity] =
    React.useState<Community | null>(null);

  // Set la première communauté quand le fetch réussit et qu'il y a des communautés
  React.useEffect(() => {
    if (
      isSuccess &&
      communities &&
      communities.length > 0 &&
      !activeCommunity
    ) {
      setActiveCommunity(communities[0]);
    }
  }, [isSuccess, communities, activeCommunity]);

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

export function useCurrentCommunity() {
  const ctx = React.useContext(CommunityContext);
  if (!ctx)
    throw new Error(
      "useCurrentCommunity must be used within CommunityProvider"
    );
  return ctx;
}
