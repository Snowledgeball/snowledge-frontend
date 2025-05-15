"use client";

import { useParams } from "next/navigation";
export default function Page() {
  const { community } = useParams();
  return <div>Mes idées pour la communauté {community}</div>;
}
