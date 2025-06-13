"use client";

import "../../../../../globals.css";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import Header from "@/components/Header";
import { SidebarInset, SidebarProvider } from "@repo/ui";
import { useAuth } from "@/contexts/auth-context";
import { useUserCommunities } from "@/hooks/useUserCommunities";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = useAuth();
  const { data: communities, isLoading } = useUserCommunities(user?.id || 0);

//   if (!features.community.enabled) {
//     notFound();
//   }

//   if (isLoading) return <div>Loading...</div>;

  return (
        <div className="flex-1 flex flex-col">
                {children}
        </div>

  );
}
