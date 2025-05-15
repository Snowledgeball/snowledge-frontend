"use client";
import { useParams } from "next/navigation";
export default function Page() {
  const { community } = useParams();
  return <div>Tableau de bord de la communauté {community}</div>;
}
