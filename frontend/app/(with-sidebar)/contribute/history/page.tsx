import { features } from "@/config/features";
import { notFound } from "next/navigation";

export default function HistoryPage() {
  if (!features.community.contribute.resources.history) notFound();
  return (
    <div>
      <h1>Historique des contributions</h1>
      <p>Consultez l'historique de toutes vos contributions à la communauté.</p>
    </div>
  );
}
