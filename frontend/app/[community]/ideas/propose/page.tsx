"use client";

import { useParams } from "next/navigation";
export default function Page() {
  const { community } = useParams();
  return <div>Proposer une idée pour la communauté {community}</div>;
}
