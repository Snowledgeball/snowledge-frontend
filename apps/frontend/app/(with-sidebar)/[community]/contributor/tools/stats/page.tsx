import { features } from "@/config/features";
import { notFound } from "next/navigation";

export default function StatsPage() {
  if (!features.community.contributor.tools.stats) notFound();
  return (
    <div>
      <h1>Statistiques de contribution</h1>
      <p>Consultez vos statistiques de contribution à la communauté.</p>
    </div>
  );
}
