"use client";

import { useParams } from "next/navigation";
export default function Page() {
  const { community } = useParams();
  return <div>Idées à valider pour la communauté {community}</div>;
}
