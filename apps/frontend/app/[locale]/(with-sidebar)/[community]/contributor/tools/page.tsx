import { features } from "@/config/features";
import { notFound } from "next/navigation";

export default function ToolsPage() {
  if (!features.community.contributor.tools.enabled) notFound();
  return (
    <div>
      <h1>Outils</h1>
      <p>Utilisez ici toutes les outils de la communauté.</p>
    </div>
  );
}
