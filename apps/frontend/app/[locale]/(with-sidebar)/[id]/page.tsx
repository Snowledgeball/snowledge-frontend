"use client";

import { fromSlug } from "@/utils/slug";
import { useParams } from "next/navigation";
import { Dashboard1 } from "@/components/dashboard-1";
import { features } from "@/config/features";
import { notFound } from "next/navigation";

export default function Page() {
  const { id } = useParams();
  if (!features.community.enabled) {
    notFound();
  }
  return (
    <div>
      <div className="flex flex-col items-center justify-center gap-2">
        <h1 className="text-2xl font-bold">
          Dashboard de la communauté {fromSlug(community as string)}
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
