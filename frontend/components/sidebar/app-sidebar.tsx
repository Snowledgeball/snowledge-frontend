"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/components/sidebar/nav-main";
import { NavProjects } from "@/components/sidebar/nav-projects";
import { NavUser } from "@/components/sidebar/nav-user";
import {
  CommunityProvider,
  CommunitySwitcher,
  useCurrentCommunity,
} from "@/components/sidebar/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

import { toSlug } from "@/utils/slug";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <CommunityProvider>
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
              avatar: "/avatars/shadcn.jpg",
            }}
          />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </CommunityProvider>
  );
}

function SidebarNavs() {
  const { activeCommunity } = useCurrentCommunity();
  const slug = toSlug(activeCommunity.name);
  // Structure enrichie pour NavMain (élève)
  const navMain = [
    {
      title: "Tableau de bord",
      url: `/${slug}/dashboard`,
      icon: PieChart,
      items: [
        {
          title: "Vue globale",
          url: `/${slug}/dashboard/overview`,
        },
        {
          title: "Statistiques détaillées",
          url: `/${slug}/dashboard/details`,
        },
      ],
    },
    {
      title: "Contenu",
      url: `/${slug}/content`,
      icon: BookOpen,
      items: [
        {
          title: "Articles",
          url: `/${slug}/content/articles`,
        },
        {
          title: "Vidéos",
          url: `/${slug}/content/videos`,
        },
        {
          title: "Podcasts",
          url: `/${slug}/content/podcasts`,
        },
      ],
    },
    {
      title: "Discussions",
      url: `/${slug}/discussions`,
      icon: Bot,
      items: [
        {
          title: "Forum",
          url: `/${slug}/discussions/forum`,
        },
        {
          title: "Chat général",
          url: `/${slug}/discussions/chat`,
        },
      ],
    },
    {
      title: "Ressources",
      url: `/${slug}/resources`,
      icon: BookOpen,
      items: [
        {
          title: "Documents",
          url: `/${slug}/resources/documents`,
        },
        {
          title: "Liens utiles",
          url: `/${slug}/resources/links`,
        },
      ],
    },
    {
      title: "Idées",
      url: `/${slug}/ideas`,
      icon: SquareTerminal,
      items: [
        {
          title: "Proposer une idée",
          url: `/${slug}/ideas/propose`,
        },
        {
          title: "Mes idées",
          url: `/${slug}/ideas/my-ideas`,
        },
      ],
    },
    {
      title: "Calendrier",
      url: `/${slug}/calendar`,
      icon: Frame,
      items: [
        {
          title: "Événements",
          url: `/${slug}/calendar/events`,
        },
        {
          title: "Mes rendez-vous",
          url: `/${slug}/calendar/my-events`,
        },
      ],
    },
    {
      title: "Notifications",
      url: `/${slug}/notifications`,
      icon: Command,
    },
    {
      title: "FAQ",
      url: `/${slug}/faq`,
      icon: GalleryVerticalEnd,
    },
    {
      title: "Support",
      url: `/${slug}/support`,
      icon: AudioWaveform,
    },
  ];
  // Structure enrichie pour NavContributeur
  const navContributeur = [
    {
      title: "Contribuer",
      url: `/${slug}/contribute`,
      icon: Frame,
      items: [
        {
          title: "Proposer un projet",
          url: `/${slug}/contribute/propose`,
        },
        {
          title: "Mes contributions",
          url: `/${slug}/contribute/my-contributions`,
        },
        {
          title: "Idées à valider",
          url: `/${slug}/contribute/validate-ideas`,
        },
        {
          title: "Collaborations",
          url: `/${slug}/contribute/collaborations`,
        },
      ],
    },
  ];
  // Structure enrichie pour NavProjects (admin/créateur)
  const navProjects = [
    {
      name: "Administration",
      url: `/${slug}/admin`,
      icon: Settings2,
      items: [
        {
          title: "Paramètres",
          url: `/${slug}/admin/settings`,
        },
        {
          title: "Membres",
          url: `/${slug}/admin/members`,
        },
        {
          title: "Invitations",
          url: `/${slug}/admin/invite`,
        },
        {
          title: "Tarifs",
          url: `/${slug}/admin/pricing`,
        },
        {
          title: "Modération",
          url: `/${slug}/admin/moderation`,
        },
        {
          title: "Logs",
          url: `/${slug}/admin/logs`,
        },
      ],
    },
  ];
  return (
    <>
      <NavMain items={navMain} />
      <NavMain items={navContributeur} label="Contribuer" />
      <NavProjects projects={navProjects} />
    </>
  );
}
