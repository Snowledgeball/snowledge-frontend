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
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-projects";
import { NavUser } from "./nav-user";
import {
  CommunityProvider,
  CommunitySwitcher,
  useCurrentCommunity,
} from "./team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@repo/ui/components/sidebar";

import { toSlug } from "@/utils/slug";
import { features } from "@/config/features";
import { useTranslations } from "next-intl";

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
              avatar: "https://github.com/shadcn.png",
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
  const tNavbar = useTranslations("navbar");

  const home = {
    title: tNavbar("dashboard"),
    url: `/${slug}`,
    icon: Home,
  };
  // Structure enrichie pour NavMain (élève)
  const navMain = [
    features.community.learner.dashboard.enabled && {
      title: tNavbar("dashboard"),
      url: `/${slug}/learner/dashboard`,
      icon: PieChart,
      items: [
        features.community.learner.dashboard.overview && {
          title: tNavbar("overview"),
          url: `/${slug}/learner/dashboard/overview`,
        },
        features.community.learner.dashboard.details && {
          title: tNavbar("details"),
          url: `/${slug}/learner/dashboard/details`,
        },
      ].filter(Boolean),
    },
    features.community.learner.content.enabled && {
      title: tNavbar("content"),
      url: `/${slug}/learner/content`,
      icon: BookOpen,
      items: [
        features.community.learner.content.articles && {
          title: tNavbar("articles"),
          url: `/${slug}/learner/content/articles`,
        },
        features.community.learner.content.videos && {
          title: tNavbar("videos"),
          url: `/${slug}/learner/content/videos`,
        },
        features.community.learner.content.podcasts && {
          title: tNavbar("podcasts"),
          url: `/${slug}/learner/content/podcasts`,
        },
      ].filter(Boolean),
    },
    features.community.learner.discussions.enabled && {
      title: tNavbar("discussions"),
      url: `/${slug}/learner/discussions`,
      icon: Bot,
      items: [
        features.community.learner.discussions.forum && {
          title: tNavbar("forum"),
          url: `/${slug}/learner/discussions/forum`,
        },
        features.community.learner.discussions.chat && {
          title: tNavbar("chat"),
          url: `/${slug}/learner/discussions/chat`,
        },
      ].filter(Boolean),
    },
    features.community.learner.resources.enabled && {
      title: tNavbar("resources"),
      url: `/${slug}/learner/resources`,
      icon: BookOpen,
      items: [
        features.community.learner.resources.documents && {
          title: tNavbar("documents"),
          url: `/${slug}/learner/resources/documents`,
        },
        features.community.learner.resources.links && {
          title: tNavbar("links"),
          url: `/${slug}/learner/resources/links`,
        },
      ].filter(Boolean),
    },
    features.community.learner.ideas.enabled && {
      title: tNavbar("ideas"),
      url: `/${slug}/learner/ideas`,
      icon: SquareTerminal,
      items: [
        features.community.learner.ideas.propose && {
          title: tNavbar("propose"),
          url: `/${slug}/learner/ideas/propose`,
        },
        features.community.learner.ideas.myIdeas && {
          title: tNavbar("my-ideas"),
          url: `/${slug}/learner/ideas/my-ideas`,
        },
      ].filter(Boolean),
    },
    features.community.learner.calendar.enabled && {
      title: tNavbar("calendar"),
      url: `/${slug}/learner/calendar`,
      icon: Frame,
      items: [
        features.community.learner.calendar.events && {
          title: tNavbar("events"),
          url: `/${slug}/learner/calendar/events`,
        },
        features.community.learner.calendar.myEvents && {
          title: tNavbar("my-events"),
          url: `/${slug}/learner/calendar/my-events`,
        },
      ].filter(Boolean),
    },
    features.community.learner.notifications.enabled && {
      title: tNavbar("notifications"),
      url: `/${slug}/learner/notifications`,
      icon: Command,
    },
    features.community.learner.faq && {
      title: tNavbar("faq"),
      url: `/${slug}/learner/faq`,
      icon: GalleryVerticalEnd,
    },
    features.community.learner.support.enabled && {
      title: tNavbar("support"),
      url: `/${slug}/learner/support`,
      icon: AudioWaveform,
    },
  ].filter(Boolean) as {
    title: string;
    url: string;
    icon: LucideIcon;
    items?: { title: string; url: string }[];
  }[];

  // Structure enrichie pour NavContributeur
  const navContributeur = [
    features.community.contributor.contribute.enabled && {
      title: tNavbar("contribute"),
      url: `/${slug}/contributor/contribute`,
      icon: Frame,
      items: [
        features.community.contributor.contribute.propose && {
          title: tNavbar("propose"),
          url: `/${slug}/contributor/contribute/propose`,
        },
        features.community.contributor.contribute.myContributions && {
          title: tNavbar("my-contributions"),
          url: `/${slug}/contributor/contribute/my-contributions`,
        },
        features.community.contributor.contribute.validateIdeas && {
          title: tNavbar("validate-ideas"),
          url: `/${slug}/contributor/contribute/validate-ideas`,
        },
        features.community.contributor.contribute.collaborations && {
          title: tNavbar("collaborations"),
          url: `/${slug}/contributor/contribute/collaborations`,
        },
      ].filter(Boolean),
    },
    // Nouveau menu principal pour les ressources contributeur
    features.community.contributor.resourcesContrib.enabled && {
      title: tNavbar("ressources-contrib"),
      url: `/${slug}/contributor/ressources-contrib`,
      icon: BookOpen,
      items: [
        features.community.contributor.resourcesContrib.tutorials && {
          title: tNavbar("tutorials"),
          url: `/${slug}/contributor/ressources-contrib/tutorials`,
        },
        features.community.contributor.resourcesContrib.history && {
          title: tNavbar("history"),
          url: `/${slug}/contributor/ressources-contrib/history`,
        },
        features.community.contributor.resourcesContrib.leaderboard && {
          title: tNavbar("leaderboard"),
          url: `/${slug}/contributor/ressources-contrib/leaderboard`,
        },
      ].filter(Boolean),
    },
    // Nouveau menu principal pour les outils contributeur
    features.community.contributor.tools.enabled && {
      title: tNavbar("tools"),
      url: `/${slug}/contributor/tools`,
      icon: SquareTerminal,
      items: [
        features.community.contributor.tools.badges && {
          title: tNavbar("badges"),
          url: `/${slug}/contributor/tools/badges`,
        },
        features.community.contributor.tools.validationRequests && {
          title: tNavbar("validation-requests"),
          url: `/${slug}/contributor/tools/validation-requests`,
        },
        features.community.contributor.tools.stats && {
          title: tNavbar("stats"),
          url: `/${slug}/contributor/tools/stats`,
        },
      ].filter(Boolean),
    },
  ].filter(Boolean) as {
    title: string;
    url: string;
    icon: LucideIcon;
    items?: { title: string; url: string }[];
  }[];

  // Structure enrichie pour NavProjects (admin/créateur)
  const navProjects = [
    features.community.creator.enabled && {
      name: tNavbar("creator"),
      url: `/${slug}/creator`,
      icon: Settings2,
      items: [
        features.community.creator.settings && {
          title: tNavbar("settings"),
          url: `/${slug}/creator/settings`,
        },
        features.community.creator.members && {
          title: tNavbar("members"),
          url: `/${slug}/creator/members`,
        },
        features.community.creator.invite && {
          title: tNavbar("invite"),
          url: `/${slug}/creator/invite`,
        },
        features.community.creator.pricing && {
          title: tNavbar("pricing"),
          url: `/${slug}/creator/pricing`,
        },
        features.community.creator.moderation && {
          title: tNavbar("moderation"),
          url: `/${slug}/creator/moderation`,
        },
        features.community.creator.logs && {
          title: tNavbar("logs"),
          url: `/${slug}/creator/logs`,
        },
      ].filter(Boolean) as { title: string; url: string }[],
    },
  ].filter(Boolean) as {
    name: string;
    url: string;
    icon: LucideIcon;
    items?: { title: string; url: string }[];
  }[];
  return (
    <>
      <NavMain items={[home]} label="" />
      <NavMain items={navMain} label={tNavbar("learner")} />
      <NavMain items={navContributeur} label={tNavbar("contributor")} />
      <NavProjects projects={navProjects} label={tNavbar("creator")} />
    </>
  );
}
