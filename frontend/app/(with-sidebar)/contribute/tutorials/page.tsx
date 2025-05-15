import { features } from "@/config/features";
import { notFound } from "next/navigation";

export default function TutorialsPage() {
  if (!features.community.contribute.resources.tutorials) notFound();
  return (
    <div>
      <h1>Tutoriels de contribution</h1>
      <p>
        Retrouvez ici tous les tutoriels pour bien contribuer à la communauté.
      </p>
    </div>
  );
}
