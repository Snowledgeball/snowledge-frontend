"use client";

import Image from "next/image";
import { Community } from "@/types/community";
import { useTranslation } from "react-i18next";

interface CommunityBannerProps {
  communityData: Community | null;
}

export default function CommunityBanner({
  communityData,
}: CommunityBannerProps) {
  const { t } = useTranslation();

  if (!communityData) return null;

  // Création d'un texte de secours au cas où la traduction échoue
  const createdByText = t("communities.created_by", {
    name: communityData.creator.fullName,
    defaultValue: `Créé par ${communityData.creator.fullName}`,
  });

  return (
    <>
      <div className="w-[64rem] h-[150px] relative overflow-hidden justify-self-center mt-10 rounded-xl">
        <Image
          src={`https://${
            communityData.image_url
              ? communityData.image_url
              : "images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000&auto=format&fit=crop"
          }`}
          alt={t("communities.banner_alt", {
            name: communityData.name,
            defaultValue: `Bannière de la communauté ${communityData.name}`,
          })}
          layout="fill"
          objectFit="cover"
        />
      </div>
      <div className="flex items-center justify-center flex-col py-8">
        <h1 className="text-4xl font-bold text-gray-900">
          {communityData.name}
        </h1>
        <p className="text-gray-600 text-sm mt-2">{createdByText}</p>
      </div>
    </>
  );
}
