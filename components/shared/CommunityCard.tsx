"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Shield } from "lucide-react";

interface CommunityCardProps {
  id: number;
  name: string;
  members: number;
  category: string;
  imageUrl: string;
  creator: {
    id: number;
    name: string;
    avatar: string;
  };
  community_learners_id: number[];
  community_contributors_id: number[];
}

export default function CommunityCard({
  id,
  name,
  members,
  category,
  imageUrl,
  creator,
  community_contributors_id,
}: CommunityCardProps) {
  const router = useRouter();
  const contributorsCount = community_contributors_id.length;

  return (
    <Card
      onClick={() => router.push(`/community/${id}`)}
      className="group relative overflow-hidden bg-white rounded-2xl transition-all duration-300 hover:shadow-xl cursor-pointer"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Image de la communauté */}
      <div className="relative h-48 w-full">
        <Image
          src={"https://" + imageUrl}
          alt={name}
          quality={75}
          loading="eager"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={true}
          fill
          className="object-cover rounded-t-2xl"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
      </div>

      <CardContent className="p-6 relative">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              {category}
            </span>
            <h3 className="text-xl font-bold text-gray-900 mt-2">{name}</h3>
          </div>
        </div>

        {/* Informations du créateur */}
        <div className="flex items-center mb-4 pb-4 border-b border-gray-100">
          <Image
            src={creator.avatar}
            alt={creator.name}
            width={32}
            height={32}
            className="rounded-full"
            quality={75}
            loading="eager"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={true}
          />
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">{creator.name}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-gray-600">
            <Users className="w-5 h-5 text-blue-500 mr-3" />
            <span className="font-medium">
              {new Intl.NumberFormat("fr-FR").format(members)} membres
            </span>
          </div>
          <div className="flex items-center text-gray-600">
            <Shield className="w-5 h-5 text-green-500 mr-3" />
            <span className="font-medium">
              {new Intl.NumberFormat("fr-FR").format(contributorsCount)}{" "}
              contributeurs
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
