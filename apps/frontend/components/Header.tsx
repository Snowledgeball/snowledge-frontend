"use client";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@repo/ui/components/sidebar";
import { Separator } from "@repo/ui/components/separator";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@repo/ui/components/breadcrumb";

// Mapping pour afficher des labels jolis et des icônes
const breadcrumbLabels: Record<string, string> = {
  dashboard: "Dashboard",
  InvestisseursFous: "InvestisseursFous",
  CryptoClub: "Crypto Club",
  ImmoPro: "Immo Pro",
  contribute: "Contribuer",
  propose: "Proposer un projet",
  "my-contributions": "Mes contributions",
  "validate-ideas": "Idées à valider",
  settings: "Paramètres",
  members: "Membres",
  invite: "Invitations",
  pricing: "Tarifs",
  content: "Contenu",
  ideas: "Idées",
  discussions: "Discussions",
  resources: "Ressources",
  // Ajoute d'autres segments si besoin
};

export default function Header() {
  const pathname = usePathname(); // ex: "/dashboard/settings/test"
  const segments = pathname.split("/").filter(Boolean); // ["dashboard", "settings", "test"]

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {segments.map((segment, idx) => {
              const isLast = idx === segments.length - 1;
              const label = breadcrumbLabels[segment] || segment;
              return (
                <span key={idx} className="flex items-center">
                  {idx > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>
                        {label.charAt(0).toUpperCase() + label.slice(1)}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        href={`/${segments.slice(0, idx + 1).join("/")}`}
                      >
                        {label.charAt(0).toUpperCase() + label.slice(1)}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </span>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}
