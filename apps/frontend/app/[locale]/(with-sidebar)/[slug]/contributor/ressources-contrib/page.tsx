import { features } from "@/config/features";
import { notFound } from "next/navigation";

export default function RessourcesContribPage() {
  if (!features.community.contributor.resourcesContrib.enabled) notFound();
  return (
    <div>
      <h1>Ressources contributeur</h1>
      <p>Gérez ici toutes les ressources contributeur de la communauté.</p>
    </div>
  );
}
