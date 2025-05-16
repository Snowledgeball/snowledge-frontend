import { features } from "@/config/features";
import { notFound } from "next/navigation";

export default function BadgesPage() {
  if (!features.community.contributor.tools.badges) notFound();
  return (
    <div>
      <h1>Mes badges</h1>
      <p>
        Visualisez tous les badges que vous avez obtenus en tant que
        contributeur.
      </p>
    </div>
  );
}
