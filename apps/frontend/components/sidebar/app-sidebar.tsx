"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Home,
  LucideIcon,
  PieChart,
  Plus,
  Settings2,
  SquareTerminal,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useNavContributor } from "./hooks/useNavContributor";
import { useNavCreator } from "./hooks/useNavCreator";
import { useNavLearner } from "./hooks/useNavLearner";

import { SidebarNavMain } from "./sidebar-nav";
import { SidebarCreatorNav } from "./sidebar-creator-nav";

import { useCurrentCommunity } from "./community-context";
import { CommunitySwitcher } from "./team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@repo/ui/components/sidebar";

import { toSlug } from "@/utils/slug";
import { useTranslations } from "next-intl";
import { NavUser } from "./nav-user";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <CommunitySwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarNavs />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: "shadcn",
            email: "m@example.com",
            avatar: "https://github.com/shadcn.png",
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function SidebarNavs() {
  const { activeCommunity } = useCurrentCommunity();
  const slug = toSlug(activeCommunity?.name || "");
  const tNavbar = useTranslations("navbar");
  const home = {
    title: tNavbar("dashboard"),
    url: `/${slug}`,
    icon: Home,
  };

  const navLearner = useNavLearner(activeCommunity ?? { name: "" });
  const navContributeur = useNavContributor(activeCommunity ?? { name: "" });
  const navCreator = useNavCreator(activeCommunity ?? { name: "" });

  const router = useRouter();

  return (
    <>
      {/* TODO: supprimer quand y aura la page intermédiaire et que dcp on sera obligé d'etre dabns une communauté avant d'être dans cette page */}
      {!activeCommunity && (
        <div
          className="flex items-center gap-2"
          onClick={() => {
            router.push("/create-community");
          }}
        >
          <div className="text-muted-foreground font-medium">
            TEMP Créer une commu
          </div>
        </div>
      )}
      <SidebarNavMain items={[home]} label="" />
      <SidebarNavMain items={navLearner} label={tNavbar("learner")} />
      <SidebarNavMain items={navContributeur} label={tNavbar("contributor")} />
      <SidebarCreatorNav items={navCreator} label={tNavbar("creator")} />
    </>
  );
}
