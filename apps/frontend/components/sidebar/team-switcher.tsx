"use client";

import * as React from "react";
import { ChevronsUpDown, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@repo/ui/components/sidebar";
import Link from "next/link";
import { toSlug } from "@/utils/slug";
import { features } from "@/config/features";
// Création d'un context pour la communauté sélectionnée
const CommunityContext = React.createContext<{
  activeCommunity: Community;
  setActiveCommunity: (c: Community) => void;
} | null>(null);

export type Community = {
  name: string;
  logo: React.ElementType;
  description: string;
  // TODO: Ajouter ici les menus dynamiques par rôle (élève, contributeur, créateur)
  // navMain?: ...
  // navContributeur?: ...
  // navProjects?: ...
};

export function useCurrentCommunity() {
  const ctx = React.useContext(CommunityContext);

  if (!ctx)
    throw new Error(
      "useCurrentCommunity must be used within CommunityProvider"
    );
  return ctx;
}

// Prépare le branchement à une API ou React Query
// TODO: Utiliser un hook React Query pour charger les communautés dynamiquement
export function CommunityProvider({
  children,
  communities: propCommunities,
}: {
  children: React.ReactNode;
  communities?: Community[];
}) {
  // Valeurs de test pour les communautés
  const defaultCommunities: Community[] = [
    {
      name: "Investisseurs Fous",
      logo: ChevronsUpDown,
      description: "Communauté d'investissement généraliste",
      // navMain: [...], navContributeur: [...], navProjects: [...]
    },
    {
      name: "Crypto Club",
      logo: Plus,
      description: "Passionnés de cryptomonnaies",
    },
    {
      name: "Immo Pro",
      logo: ChevronsUpDown,
      description: "Experts en immobilier",
    },
  ];
  const communities = propCommunities || defaultCommunities;
  const [activeCommunity, setActiveCommunity] = React.useState(communities[0]);
  return (
    <CommunityContext.Provider value={{ activeCommunity, setActiveCommunity }}>
      {children}
    </CommunityContext.Provider>
  );
}

export function CommunitySwitcher() {
  const { activeCommunity, setActiveCommunity } = useCurrentCommunity();
  const router = useRouter();
  const communities: Community[] = [
    {
      name: "Investisseurs Fous",
      logo: ChevronsUpDown,
      description: "Communauté d'investissement généraliste",
    },
    {
      name: "Crypto Club",
      logo: Plus,
      description: "Passionnés de cryptomonnaies",
    },
    {
      name: "Immo Pro",
      logo: ChevronsUpDown,
      description: "Experts en immobilier",
    },
  ];
  const { isMobile } = useSidebar();
  if (!activeCommunity) return null;
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <activeCommunity.logo className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {activeCommunity.name}
                </span>
                <span className="truncate text-xs">
                  {activeCommunity.description}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Communautés
            </DropdownMenuLabel>
            {communities.map((community, index) => (
              <DropdownMenuItem
                key={community.name}
                onClick={() => {
                  setActiveCommunity(community);
                  router.push(`/${toSlug(community.name)}`);
                  console.log(`/${toSlug(community.name)}`);
                }}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <community.logo className="size-3.5 shrink-0" />
                </div>
                {community.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            {features.createCommunity.enabled && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 p-2"
                  onClick={() => {
                    router.push("/create-community");
                  }}
                >
                  <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                    <Plus className="size-4" />
                  </div>

                  <div className="text-muted-foreground font-medium">
                    Créer une communauté
                  </div>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
