"use client";
import { useParams } from "next/navigation";
export default function Page() {
  const { community } = useParams();
  return (
    <div>Statistiques détaillées du dashboard de la communauté {community}</div>
  );
}
