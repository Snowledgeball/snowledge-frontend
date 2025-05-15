"use client";

import { useParams } from "next/navigation";
export default function Page() {
  const { community } = useParams();
  return <div>Proposer un projet pour la communauté {community}</div>;
}
