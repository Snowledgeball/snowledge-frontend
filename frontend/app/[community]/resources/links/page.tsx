"use client";
import { useParams } from "next/navigation";
export default function Page() {
  const { community } = useParams();
  return <div>Liens utiles de la communauté {community}</div>;
}
