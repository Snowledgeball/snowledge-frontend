"use client";

import { useParams } from "next/navigation";
export default function Page() {
  const { community } = useParams();
  return <div>Section Contribuer pour la communauté {community}</div>;
}
