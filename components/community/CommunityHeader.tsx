"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, Settings } from "lucide-react";
import { Community } from "@/types/community";

interface CommunityHeaderProps {
    communityData: Community | null;
    userCommunities: Community[];
    isContributor: boolean;
    isCreator: boolean;
    pendingPostsCount: number;
    pendingEnrichmentsCount: number;
    sessionUserId?: string;
}

export default function CommunityHeader({
    communityData,
    userCommunities,
    isContributor,
    isCreator,
    pendingPostsCount,
    pendingEnrichmentsCount,
    sessionUserId
}: CommunityHeaderProps) {
    const router = useRouter();

    if (!communityData) return null;

    return (
        <div
            id="no-header"
            className="border-b border-gray-200"
        // className="bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#003E8A] to-[#16215B]"
        >
            <div className="max-w-[95rem] mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <button
                            onClick={() => router.back()}
                            className="text-gray-700 hover:text-gray-900 mr-4 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        {/* Menu déroulant des communautés */}
                        <div className="relative group">
                            <button className="flex items-center space-x-2 text-gray-700">
                                <h1 className="text-xl font-bold">{communityData.name}</h1>
                                {isContributor && (pendingPostsCount > 0 || pendingEnrichmentsCount > 0) && (
                                    <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                                        {pendingPostsCount + pendingEnrichmentsCount} en attente
                                    </span>
                                )}
                                <ChevronDown className="w-5 h-5 group-hover:rotate-180 transition-transform" />
                            </button>

                            {/* Liste déroulante des communautés */}
                            <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                <div className="p-2">
                                    {userCommunities &&
                                        userCommunities.map((community) => (
                                            <button
                                                key={community.id}
                                                onClick={() =>
                                                    router.push(`/community/${community.id}`)
                                                }
                                                className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left hover:bg-gray-50 transition-colors
                                                ${String(community.id) === String(communityData.id)
                                                        ? "bg-blue-50 text-blue-600"
                                                        : "text-gray-700"
                                                    }`}
                                            >
                                                <div>
                                                    <div className="font-medium">
                                                        {community.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {community.role === "learner"
                                                            ? "Apprenant"
                                                            : community.role === "creator"
                                                                ? "Créateur"
                                                                : "Contributeur"}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}

                                    {/* Séparateur */}
                                    <div className="h-px bg-gray-200 my-2" />

                                    {/* Lien pour découvrir plus de communautés */}
                                    <button
                                        onClick={() => router.push("/")}
                                        className="w-full flex items-center justify-between p-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <span className="text-sm font-medium">
                                            Découvrir plus de communautés
                                        </span>
                                        <ArrowLeft className="w-4 h-4 rotate-180" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* {sessionUserId &&
                        communityData?.creator.id === parseInt(sessionUserId) ? (
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() =>
                                    router.push(`/community/${communityData.id}/settings`)
                                }
                                className="text-gray-700 hover:text-gray-900 transition-colors"
                            >
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                    ) : ( */}
                    <div className="flex-1 flex justify-end h-full">
                        <div className="bg-[#000333] w-64 py-1 px-3">
                            <div className="flex items-center justify-between">
                                <span className="text-white text-sm">Prizepool</span>
                                <span className="bg-green-500/20 text-green-500 text-sm py-0.5 px-1">+ 28.8 %</span>
                            </div>
                            <p className="text-white text-xl font-bold">2097 pts</p>
                        </div>
                    </div>
                    {/* )} */}
                </div>
            </div>
        </div>
    );
} 