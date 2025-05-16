import { features } from "@/config/features";
import { notFound } from "next/navigation";

export default function ValidationRequestsPage() {
  if (!features.community.tools.validationRequests) notFound();
  return (
    <div>
      <h1>Demandes de validation</h1>
      <p>Gérez ici toutes vos demandes de validation de contributions.</p>
    </div>
  );
}
