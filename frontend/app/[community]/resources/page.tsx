"use client";

import { useParams } from "next/navigation";
export default function Page() {
  const { community } = useParams();
  return <div>Ressources de la communauté {community}</div>;
}
