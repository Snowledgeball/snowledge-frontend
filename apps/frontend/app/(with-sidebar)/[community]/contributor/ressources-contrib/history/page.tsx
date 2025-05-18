import { features } from "@/config/features";
import { notFound } from "next/navigation";

export default function HistoryPage() {
  if (!features.community.contributor.resourcesContrib.history) notFound();
  return (
    <div>
      <h1>Historique des contributions</h1>
      <p>
        Consultez l&apos;historique de toutes vos contributions à la communauté.
      </p>
    </div>
  );
}
