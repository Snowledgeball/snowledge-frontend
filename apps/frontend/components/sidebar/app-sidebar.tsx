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
  Link,
  LucideIcon,
  PieChart,
  Plus,
  Settings2,
  SquareTerminal,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useNavContributor } from "./hooks/useNavContributor";
import { useNavMyCommunity } from "./hooks/useNavMyCommunity";
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
  SidebarMenuButton,
  SidebarRail,
} from "@repo/ui/components/sidebar";

import { toSlug } from "@/utils/slug";
import { useTranslations } from "next-intl";
import NavUser from "./nav-user";
import { useNavGlobal } from "./hooks/useNavGlobal";

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
  const landing = {
    title: tNavbar("landing"),
    url: "/?no-redirect=true",
    icon: Home,
  };

  // const navLearner = useNavLearner(activeCommunity ?? { name: "" });
  // const navContributeur = useNavContributor(activeCommunity ?? { name: "" });
  const navMyCommunity = useNavMyCommunity(activeCommunity ?? { name: "" });
  const navGlobal = useNavGlobal(activeCommunity ?? { name: "" });

  return (
    <>
      {/* <SidebarNavMain items={[home]} label="" />
      <SidebarNavMain items={navLearner} label={tNavbar("learner")} />
      <SidebarNavMain items={navContributeur} label={tNavbar("contributor")} /> */}
      <SidebarNavMain items={navGlobal} label={tNavbar("global")} />
      <SidebarNavMain items={navMyCommunity} label={tNavbar("my-community")} />
      <SidebarNavMain items={[landing]} label="" />
      {/* <NavProjects projects={data.projects} /> */}
    </>
  );
}
