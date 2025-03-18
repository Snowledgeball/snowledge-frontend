"use client";

import Image from "next/image";
import { Community } from "@/types/community";

interface CommunityBannerProps {
    communityData: Community | null;
}

export default function CommunityBanner({ communityData }: CommunityBannerProps) {
    if (!communityData) return null;

    return (
        <>

            <div className="w-full h-[255px] relative overflow-hidden">
                <Image
                    src={`https://${communityData.image_url ? communityData.image_url : "images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000&auto=format&fit=crop"}`}
                    alt="Banner pattern"
                    layout="fill"
                    objectFit="cover"
                />
            </div>
            <div className="flex items-center justify-center flex-col py-8">
                <h1 className="text-4xl font-bold text-gray-900">
                    {communityData.name}
                </h1>
                <p className="text-gray-600 text-sm mt-2">
                    Créé par {communityData.creator.fullName}
                </p>
            </div>
        </>
    );
} 