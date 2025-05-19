import { features } from "@/config/features";
import { notFound } from "next/navigation";

export default function TutorialsPage() {
  if (!features.community.contributor.resourcesContrib.tutorials) notFound();
  return (
    <div>
      <h1>Tutoriels</h1>
      <p>Gérez ici tous les tutoriels de la communauté.</p>
    </div>
  );
}
