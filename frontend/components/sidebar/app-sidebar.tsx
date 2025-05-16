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

import Link from "next/link";

import { toSlug } from "@/utils/slug";
import { features } from "@/config/features";
import { Button } from "../ui/button";

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
  // Structure enrichie pour NavMain (élève)
  const navMain = [
    features.community.dashboard?.enabled && {
      title: "Tableau de bord",
      url: `/${slug}/dashboard`,
      icon: PieChart,
      items: [
        features.community.dashboard.overview && {
          title: "Vue globale",
          url: `/${slug}/dashboard/overview`,
        },
        features.community.dashboard.details && {
          title: "Statistiques détaillées",
          url: `/${slug}/dashboard/details`,
        },
      ].filter(Boolean),
    },
    features.community.content?.enabled && {
      title: "Contenu",
      url: `/${slug}/content`,
      icon: BookOpen,
      items: [
        features.community.content.articles && {
          title: "Articles",
          url: `/${slug}/content/articles`,
        },
        features.community.content.videos && {
          title: "Vidéos",
          url: `/${slug}/content/videos`,
        },
        features.community.content.podcasts && {
          title: "Podcasts",
          url: `/${slug}/content/podcasts`,
        },
      ].filter(Boolean),
    },
    features.community.discussions?.enabled && {
      title: "Discussions",
      url: `/${slug}/discussions`,
      icon: Bot,
      items: [
        features.community.discussions.forum && {
          title: "Forum",
          url: `/${slug}/discussions/forum`,
        },
        features.community.discussions.chat && {
          title: "Chat général",
          url: `/${slug}/discussions/chat`,
        },
      ].filter(Boolean),
    },
    features.community.resources?.enabled && {
      title: "Ressources",
      url: `/${slug}/resources`,
      icon: BookOpen,
      items: [
        features.community.resources.documents && {
          title: "Documents",
          url: `/${slug}/resources/documents`,
        },
        features.community.resources.links && {
          title: "Liens utiles",
          url: `/${slug}/resources/links`,
        },
      ].filter(Boolean),
    },
    features.community.ideas?.enabled && {
      title: "Idées",
      url: `/${slug}/ideas`,
      icon: SquareTerminal,
      items: [
        features.community.ideas.propose && {
          title: "Proposer une idée",
          url: `/${slug}/ideas/propose`,
        },
        features.community.ideas.myIdeas && {
          title: "Mes idées",
          url: `/${slug}/ideas/my-ideas`,
        },
      ].filter(Boolean),
    },
    features.community.calendar?.enabled && {
      title: "Calendrier",
      url: `/${slug}/calendar`,
      icon: Frame,
      items: [
        features.community.calendar.events && {
          title: "Événements",
          url: `/${slug}/calendar/events`,
        },
        features.community.calendar.myEvents && {
          title: "Mes rendez-vous",
          url: `/${slug}/calendar/my-events`,
        },
      ].filter(Boolean),
    },
    features.community.notifications?.enabled && {
      title: "Notifications",
      url: `/${slug}/notifications`,
      icon: Command,
    },
    features.community.faq && {
      title: "FAQ",
      url: `/${slug}/faq`,
      icon: GalleryVerticalEnd,
    },
    features.community.support && {
      title: "Support",
      url: `/${slug}/support`,
      icon: AudioWaveform,
    },
  ].filter(Boolean);

  // Structure enrichie pour NavContributeur
  const navContributeur = [
    features.community.contribute?.enabled && {
      title: "Contribuer",
      url: `/${slug}/contribute`,
      icon: Frame,
      items: [
        features.community.contribute.propose && {
          title: "Proposer un projet",
          url: `/${slug}/contribute/propose`,
        },
        features.community.contribute.myContributions && {
          title: "Mes contributions",
          url: `/${slug}/contribute/my-contributions`,
        },
        features.community.contribute.validateIdeas && {
          title: "Idées à valider",
          url: `/${slug}/contribute/validate-ideas`,
        },
        features.community.contribute.collaborations && {
          title: "Collaborations",
          url: `/${slug}/contribute/collaborations`,
        },
      ].filter(Boolean),
    },
    // Nouveau menu principal pour les ressources contributeur
    features.community.resourcesContrib?.enabled && {
      title: "Ressources Contributeur",
      url: `/${slug}/ressources-contrib`,
      icon: BookOpen,
      items: [
        features.community.resourcesContrib.tutorials && {
          title: "Tutoriels de contribution",
          url: `/${slug}/ressources-contrib/tutorials`,
        },
        features.community.resourcesContrib.history && {
          title: "Historique des contributions",
          url: `/${slug}/ressources-contrib/history`,
        },
        features.community.resourcesContrib.leaderboard && {
          title: "Classement des contributeurs",
          url: `/${slug}/ressources-contrib/leaderboard`,
        },
      ].filter(Boolean),
    },
    // Nouveau menu principal pour les outils contributeur
    features.community.tools?.enabled && {
      title: "Outils Contributeur",
      url: `/${slug}/tools`,
      icon: SquareTerminal,
      items: [
        features.community.tools.badges && {
          title: "Mes badges",
          url: `/${slug}/tools/badges`,
        },
        features.community.tools.validationRequests && {
          title: "Demandes de validation",
          url: `/${slug}/tools/validation-requests`,
        },
        features.community.tools.stats && {
          title: "Statistiques de contribution",
          url: `/${slug}/tools/stats`,
        },
      ].filter(Boolean),
    },
  ].filter(Boolean);

  // Structure enrichie pour NavProjects (admin/créateur)
  const navProjects = [
    features.community.admin?.enabled && {
      name: "Administration",
      url: `/${slug}/admin`,
      icon: Settings2,
      items: [
        features.community.admin.settings && {
          title: "Paramètres",
          url: `/${slug}/admin/settings`,
        },
        features.community.admin.members && {
          title: "Membres",
          url: `/${slug}/admin/members`,
        },
        features.community.admin.invite && {
          title: "Invitations",
          url: `/${slug}/admin/invite`,
        },
        features.community.admin.pricing && {
          title: "Tarifs",
          url: `/${slug}/admin/pricing`,
        },
        features.community.admin.moderation && {
          title: "Modération",
          url: `/${slug}/admin/moderation`,
        },
        features.community.admin.logs && {
          title: "Logs",
          url: `/${slug}/admin/logs`,
        },
      ].filter(Boolean),
    },
  ].filter(Boolean);
  return (
    <>
      <Link href={`/${slug}`}>
        <Button className="p-0 w-full justify-start" variant="ghost">
          <Home />
          <span>Accueil</span>
        </Button>
      </Link>
      <NavMain items={navMain} label="Apprenant" />
      <NavMain items={navContributeur} label="Contributeur" />
      <NavProjects projects={navProjects} label="Créateur" />
    </>
  );
}
