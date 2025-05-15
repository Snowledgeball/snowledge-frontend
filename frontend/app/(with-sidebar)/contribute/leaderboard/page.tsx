import { features } from "@/config/features";
import { notFound } from "next/navigation";

export default function LeaderboardPage() {
  if (!features.community.contribute.resources.leaderboard) notFound();
  return (
    <div>
      <h1>Classement des contributeurs</h1>
      <p>
        Découvrez le classement des membres les plus actifs de la communauté.
      </p>
    </div>
  );
}
