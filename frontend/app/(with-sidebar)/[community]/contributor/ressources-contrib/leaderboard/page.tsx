import { features } from "@/config/features";
import { notFound } from "next/navigation";

export default function LeaderboardPage() {
  if (!features.community.contributor.resourcesContrib.leaderboard) notFound();
  return (
    <div>
      <h1>Classement des contributeurs</h1>
      <p>
        Consultez le classement des contributeurs de la communauté en fonction
        de leurs contributions.
      </p>
    </div>
  );
}
