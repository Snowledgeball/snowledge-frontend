"use client";
import { useParams } from "next/navigation";
export default function Page() {
  const { community } = useParams();
  return <div>Forum de la communauté {community}</div>;
}
