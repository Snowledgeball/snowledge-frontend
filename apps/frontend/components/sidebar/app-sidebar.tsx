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

import { useCurrentCommunity } from "@/hooks/useCurrentCommunity";
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
import NavUser from "./nav-user";

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

  return (
    <>
      <SidebarNavMain items={[home]} label="" />
      <SidebarNavMain items={navLearner} label={tNavbar("learner")} />
      <SidebarNavMain items={navContributeur} label={tNavbar("contributor")} />
      <SidebarNavMain items={navCreator} label={tNavbar("creator")} />
    </>
  );
}
