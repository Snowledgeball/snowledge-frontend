"use client";

import { fromSlug } from "@/utils/slug";
import { useParams } from "next/navigation";
import { Dashboard1 } from "@/components/dashboard-1";
import { features } from "@/config/features";
import { notFound } from "next/navigation";
import { useUserCommunities } from "@/hooks/useUserCommunities";
import { useAuth } from "@/contexts/auth-context";
import { useEffect } from "react";

export default function Page() {
  const { user } = useAuth();
  const { slug } = useParams();

  const { data: communities, isLoading } = useUserCommunities(user?.id || 0);

  useEffect(() => {
    if (communities) {
      const community = communities.find((c) => c.slug === slug);
      if (!community) notFound();
    }
  }, [communities]);

  if (!features.community.enabled) {
    notFound();
  }

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex flex-col items-center justify-center gap-2">
        <h1 className="text-2xl font-bold">
          Dashboard de la communauté {fromSlug(slug as string)}
        </h1>
        <p className="text-sm text-gray-500">
          Cette communauté est une communauté de test. Elle est créée pour
          tester le dashboard.
        </p>
      </div>
      <Dashboard1 />;
    </div>
  );
}
