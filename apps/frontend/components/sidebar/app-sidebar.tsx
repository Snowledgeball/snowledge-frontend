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
import NavUser from "./nav-user";
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

export default function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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

  const home = {
    title: "Accueil",
    url: `/${slug}`,
    icon: Home,
  };
  // Structure enrichie pour NavMain (élève)
  const navMain = [
    features.community.learner.dashboard.enabled && {
      title: "Tableau de bord",
      url: `/${slug}/learner/dashboard`,
      icon: PieChart,
      items: [
        features.community.learner.dashboard.overview && {
          title: "Vue globale",
          url: `/${slug}/learner/dashboard/overview`,
        },
        features.community.learner.dashboard.details && {
          title: "Statistiques détaillées",
          url: `/${slug}/learner/dashboard/details`,
        },
      ].filter(Boolean),
    },
    features.community.learner.content.enabled && {
      title: "Contenu",
      url: `/${slug}/learner/content`,
      icon: BookOpen,
      items: [
        features.community.learner.content.articles && {
          title: "Articles",
          url: `/${slug}/learner/content/articles`,
        },
        features.community.learner.content.videos && {
          title: "Vidéos",
          url: `/${slug}/learner/content/videos`,
        },
        features.community.learner.content.podcasts && {
          title: "Podcasts",
          url: `/${slug}/learner/content/podcasts`,
        },
      ].filter(Boolean),
    },
    features.community.learner.discussions.enabled && {
      title: "Discussions",
      url: `/${slug}/learner/discussions`,
      icon: Bot,
      items: [
        features.community.learner.discussions.forum && {
          title: "Forum",
          url: `/${slug}/learner/discussions/forum`,
        },
        features.community.learner.discussions.chat && {
          title: "Chat général",
          url: `/${slug}/learner/discussions/chat`,
        },
      ].filter(Boolean),
    },
    features.community.learner.resources.enabled && {
      title: "Ressources",
      url: `/${slug}/learner/resources`,
      icon: BookOpen,
      items: [
        features.community.learner.resources.documents && {
          title: "Documents",
          url: `/${slug}/learner/resources/documents`,
        },
        features.community.learner.resources.links && {
          title: "Liens utiles",
          url: `/${slug}/learner/resources/links`,
        },
      ].filter(Boolean),
    },
    features.community.learner.ideas.enabled && {
      title: "Idées",
      url: `/${slug}/learner/ideas`,
      icon: SquareTerminal,
      items: [
        features.community.learner.ideas.propose && {
          title: "Proposer une idée",
          url: `/${slug}/learner/ideas/propose`,
        },
        features.community.learner.ideas.myIdeas && {
          title: "Mes idées",
          url: `/${slug}/learner/ideas/my-ideas`,
        },
      ].filter(Boolean),
    },
    features.community.learner.calendar.enabled && {
      title: "Calendrier",
      url: `/${slug}/learner/calendar`,
      icon: Frame,
      items: [
        features.community.learner.calendar.events && {
          title: "Événements",
          url: `/${slug}/learner/calendar/events`,
        },
        features.community.learner.calendar.myEvents && {
          title: "Mes rendez-vous",
          url: `/${slug}/learner/calendar/my-events`,
        },
      ].filter(Boolean),
    },
    features.community.learner.notifications.enabled && {
      title: "Notifications",
      url: `/${slug}/learner/notifications`,
      icon: Command,
    },
    features.community.learner.faq && {
      title: "FAQ",
      url: `/${slug}/learner/faq`,
      icon: GalleryVerticalEnd,
    },
    features.community.learner.support.enabled && {
      title: "Support",
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
      title: "Contribuer",
      url: `/${slug}/contributor/contribute`,
      icon: Frame,
      items: [
        features.community.contributor.contribute.propose && {
          title: "Proposer un projet",
          url: `/${slug}/contributor/contribute/propose`,
        },
        features.community.contributor.contribute.myContributions && {
          title: "Mes contributions",
          url: `/${slug}/contributor/contribute/my-contributions`,
        },
        features.community.contributor.contribute.validateIdeas && {
          title: "Idées à valider",
          url: `/${slug}/contributor/contribute/validate-ideas`,
        },
        features.community.contributor.contribute.collaborations && {
          title: "Collaborations",
          url: `/${slug}/contributor/contribute/collaborations`,
        },
      ].filter(Boolean),
    },
    // Nouveau menu principal pour les ressources contributeur
    features.community.contributor.resourcesContrib.enabled && {
      title: "Ressources Contributeur",
      url: `/${slug}/contributor/ressources-contrib`,
      icon: BookOpen,
      items: [
        features.community.contributor.resourcesContrib.tutorials && {
          title: "Tutoriels de contribution",
          url: `/${slug}/contributor/ressources-contrib/tutorials`,
        },
        features.community.contributor.resourcesContrib.history && {
          title: "Historique des contributions",
          url: `/${slug}/contributor/ressources-contrib/history`,
        },
        features.community.contributor.resourcesContrib.leaderboard && {
          title: "Classement des contributeurs",
          url: `/${slug}/contributor/ressources-contrib/leaderboard`,
        },
      ].filter(Boolean),
    },
    // Nouveau menu principal pour les outils contributeur
    features.community.contributor.tools.enabled && {
      title: "Outils Contributeur",
      url: `/${slug}/contributor/tools`,
      icon: SquareTerminal,
      items: [
        features.community.contributor.tools.badges && {
          title: "Mes badges",
          url: `/${slug}/contributor/tools/badges`,
        },
        features.community.contributor.tools.validationRequests && {
          title: "Demandes de validation",
          url: `/${slug}/contributor/tools/validation-requests`,
        },
        features.community.contributor.tools.stats && {
          title: "Statistiques de contribution",
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
      name: "Administration",
      url: `/${slug}/creator`,
      icon: Settings2,
      items: [
        features.community.creator.settings && {
          title: "Paramètres",
          url: `/${slug}/creator/settings`,
        },
        features.community.creator.members && {
          title: "Membres",
          url: `/${slug}/creator/members`,
        },
        features.community.creator.invite && {
          title: "Invitations",
          url: `/${slug}/creator/invite`,
        },
        features.community.creator.pricing && {
          title: "Tarifs",
          url: `/${slug}/creator/pricing`,
        },
        features.community.creator.moderation && {
          title: "Modération",
          url: `/${slug}/creator/moderation`,
        },
        features.community.creator.logs && {
          title: "Logs",
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
      <NavMain items={navMain} label="Apprenant" />
      <NavMain items={navContributeur} label="Contributeur" />
      <NavProjects projects={navProjects} label="Créateur" />
    </>
  );
}
