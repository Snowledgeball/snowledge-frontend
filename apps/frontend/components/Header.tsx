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
import { useTranslations } from "next-intl";

export default function Header() {
  const pathname = usePathname(); // ex: "/dashboard/settings/test"
  let segments = pathname.split("/").filter(Boolean); // ["dashboard", "settings", "test"]

  // Ignore le segment de langue (fr ou en) s'il est présent
  if (segments[0] === "fr" || segments[0] === "en") {
    segments = segments.slice(1);
  }

  const tBreadcrumb = useTranslations("navbar");

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
              let label: string = segment;
              label.charAt(0).toUpperCase() + label.slice(1);
              return (
                <span key={idx} className="flex items-center">
                  {idx > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        href={`/${segments.slice(0, idx + 1).join("/")}`}
                      >
                        {label}
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
