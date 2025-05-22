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
import { toSlug } from "@/utils/slug";
import { features } from "@/config/features";
import { useCurrentCommunity, Community } from "./community-context";
import { useUserCommunities } from "./hooks/useUserCommunities";

export function CommunitySwitcher() {
  const { activeCommunity, setActiveCommunity } = useCurrentCommunity();
  const router = useRouter();
  const { isMobile } = useSidebar();
  const { data: communities } = useUserCommunities(2); // TODO: replace userId by the user id
  if (!communities || !activeCommunity) return null;
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
                {activeCommunity.name.charAt(0)}
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
            {communities?.map((community: Community, index: number) => (
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
                  {community.name.charAt(0)}
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
