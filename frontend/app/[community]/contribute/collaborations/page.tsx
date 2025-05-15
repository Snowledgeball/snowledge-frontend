"use client";
import { useParams } from "next/navigation";
export default function Page() {
  const { community } = useParams();
  return <div>Collaborations pour la communauté {community}</div>;
}
