"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Community } from "@/types/community";

type Presentation = {
    video_url?: string;
    topic_details: string;
    code_of_conduct: string;
    disclaimers: string;
};

interface CommunityPresentationModalProps {
    communityData: Community | null;
    presentation: Presentation | null;
    userId: string | null;
    showModal: boolean;
}

export default function CommunityPresentationModal({
    communityData,
    presentation,
    userId,
    showModal
}: CommunityPresentationModalProps) {
    const router = useRouter();
    const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);

    if (!showModal || !communityData || !presentation || !userId) return null;

    // Vérifier si l'utilisateur est le créateur de la communauté
    if (communityData.creator.id === parseInt(userId)) return null;

    const getYoutubeVideoId = (url: string) => {
        const videoId = url.split("v=")[1];
        return videoId;
    };

    const handleJoinCommunity = async () => {
        try {
            const response = await fetch(`/api/communities/${communityData.id}/join`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Erreur lors de l'adhésion à la communauté");
            }
        } catch (error) {
            console.error("Erreur:", error);
            // Gérer l'erreur (afficher un message à l'utilisateur)
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-8 max-w-2xl w-full shadow-2xl">
                {/* En-tête avec gradient */}
                <div className="bg-gradient-radial from-[#003E8A] to-[#16215B] -m-8 mb-6 p-6 rounded-t-xl">
                    <h2 className="text-2xl font-bold text-white text-center">
                        {communityData.name}
                    </h2>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    {/* Colonne de gauche avec la vidéo */}
                    <div className="space-y-4">
                        {presentation.video_url && (
                            <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
                                <iframe
                                    className="w-full h-full"
                                    src={`https://www.youtube-nocookie.com/embed/${getYoutubeVideoId(
                                        presentation.video_url
                                    )}`}
                                    title="Présentation de la communauté"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        )}
                    </div>

                    {/* Colonne de droite avec les détails */}
                    <div
                        className={`space-y-4 ${presentation.video_url ? "col-span-1" : "col-span-2"
                            }`}
                    >
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm h-[200px] overflow-y-auto">
                            <h3 className="font-semibold mb-2 text-gray-900">
                                Vocation de la communauté & détails de la thématique
                            </h3>
                            <p className="text-sm text-gray-600">
                                {presentation.topic_details}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Section du bas */}
                <div className="grid grid-cols-2 gap-6 mt-6">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm h-[200px] overflow-y-auto">
                        <h3 className="font-semibold mb-2 text-gray-900">
                            Code de conduite
                        </h3>
                        <p className="text-sm text-gray-600">
                            {presentation.code_of_conduct}
                        </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm h-[200px] overflow-y-auto">
                        <h3 className="font-semibold mb-2 text-gray-900">
                            Disclaimer
                        </h3>
                        <p className="text-sm text-gray-600">
                            {presentation.disclaimers}
                        </p>
                    </div>
                </div>

                {/* Footer avec checkbox et bouton */}
                <div className="mt-6 space-y-4 border-t border-gray-200 pt-6">
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={hasAcceptedTerms}
                            onChange={(e) => setHasAcceptedTerms(e.target.checked)}
                        />
                        <span className="text-sm text-gray-600">
                            J&apos;ai compris et j&apos;accepte le code de conduite
                        </span>
                    </label>

                    <div className="flex justify-end space-x-4">
                        <button
                            onClick={() => router.push("/")}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            Retour
                        </button>
                        <button
                            onClick={handleJoinCommunity}
                            disabled={!hasAcceptedTerms}
                            className={`px-6 py-2 rounded-lg transition-colors ${hasAcceptedTerms
                                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                        >
                            Rejoindre la communauté →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 