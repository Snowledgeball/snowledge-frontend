"use client";

import { useParams } from "next/navigation";
export default function Page() {
  const { community } = useParams();
  return <div>Mes contributions pour la communauté {community}</div>;
}
