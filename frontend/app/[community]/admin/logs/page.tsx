"use client";
import { useParams } from "next/navigation";
export default function Page() {
  const { community } = useParams();
  return <div>Logs d'administration pour la communauté {community}</div>;
}
