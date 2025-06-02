"use client";

import { useParams } from "next/navigation";
import { useUserCommunities } from "@/hooks/useUserCommunities";
import { notFound } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useEffect } from "react";

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const { slug } = useParams();
  const { data: communities, isLoading } = useUserCommunities(user?.id || 0);

  useEffect(() => {
    if (communities) {
      const community = communities.find((c) => c.slug === slug);
      if (!community) notFound();
    }
  }, [communities, slug]);

  if (isLoading) return <div>Loading...</div>;

  return <>{children}</>;
}
