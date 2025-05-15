"use client";

import { useParams } from "next/navigation";
export default function Page() {
  const { community } = useParams();
  return <div>Paramètres d'administration pour la communauté {community}</div>;
}
