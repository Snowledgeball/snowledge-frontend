"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Community } from "@/types/community";
import { CheckCircle } from "lucide-react";
import { Loader } from "@/components/ui/loader";

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
    setShowModal: (showModal: boolean) => void;
}

export default function CommunityPresentationModal({
    communityData,
    presentation,
    userId,
    showModal,
    setShowModal

}: CommunityPresentationModalProps) {
    const router = useRouter();
    const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [joinSuccess, setJoinSuccess] = useState(false);

    if (!showModal || !communityData || !presentation || !userId) return null;

    // Vérifier si l'utilisateur est le créateur de la communauté
    if (communityData.creator.id === parseInt(userId)) return null;

    const getYoutubeVideoId = (url: string) => {
        const videoId = url.split("v=")[1];
        return videoId;
    };

    const handleJoinCommunity = async () => {
        try {
            setIsJoining(true);
            const response = await fetch(`/api/communities/${communityData.id}/join`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Erreur lors de l'adhésion à la communauté");
            }

            // Indiquer que l'utilisateur a rejoint avec succès
            setJoinSuccess(true);

            // Attendre un court instant pour montrer le message de succès
            setTimeout(() => {
                // Fermer la modale
                setShowModal(false);

                // Recharger la page pour mettre à jour les données
                window.location.reload();
            }, 1500);

        } catch (error) {
            console.error("Erreur:", error);
            setIsJoining(false);
        }
    };

    // Si l'utilisateur a rejoint avec succès, afficher un message de confirmation
    if (joinSuccess) {
        return (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <CheckCircle className="w-16 h-16 text-green-500" />
                        <h2 className="text-2xl font-bold text-gray-900">Bienvenue !</h2>
                        <p className="text-gray-600">
                            Vous avez rejoint la communauté avec succès.
                        </p>
                        <p className="text-gray-500 text-sm">
                            Chargement du contenu...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] flex flex-col">
                {/* En-tête avec gradient et image de la communauté */}
                <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-t-xl p-8 relative flex-shrink-0">
                    <div className="flex items-center space-x-4">
                        {communityData.image_url && (
                            <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-lg">
                                <img
                                    src={communityData.image_url.startsWith('http') ? communityData.image_url : `https://${communityData.image_url}`}
                                    alt={communityData.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                {communityData.name}
                            </h2>
                            <p className="text-blue-100 text-sm">
                                Créée par {communityData.creator.fullName}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowModal(false)}
                        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-8 overflow-y-auto flex-grow">
                    {/* Vidéo de présentation */}
                    {presentation.video_url && (
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                Présentation vidéo
                            </h3>
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
                        </div>
                    )}

                    {/* Informations sur la communauté */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 shadow-sm">
                            <h3 className="font-semibold mb-3 text-blue-900 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                Vocation de la communauté
                            </h3>
                            <div className="text-blue-800 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                                {presentation.topic_details}
                            </div>
                        </div>

                        <div className="bg-green-50 p-6 rounded-xl border border-green-100 shadow-sm">
                            <h3 className="font-semibold mb-3 text-green-900 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Code de conduite
                            </h3>
                            <div className="text-green-800 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                                {presentation.code_of_conduct}
                            </div>
                        </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="bg-amber-50 p-6 rounded-xl border border-amber-100 shadow-sm mb-8">
                        <h3 className="font-semibold mb-3 text-amber-900 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Disclaimer
                        </h3>
                        <div className="text-amber-800 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                            {presentation.disclaimers}
                        </div>
                    </div>
                </div>

                {/* Footer avec checkbox et bouton */}
                <div className="border-t border-gray-200 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 flex-shrink-0 bg-gray-50 rounded-b-xl">
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-5 h-5 cursor-pointer"
                            checked={hasAcceptedTerms}
                            onChange={(e) => setHasAcceptedTerms(e.target.checked)}
                        />
                        <span className="text-gray-700">
                            J&apos;ai compris et j&apos;accepte le code de conduite
                        </span>
                    </label>

                    <div className="flex space-x-4">
                        <button
                            onClick={() => router.push("/")}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            Retour
                        </button>
                        <button
                            onClick={handleJoinCommunity}
                            disabled={!hasAcceptedTerms || isJoining}
                            className={`px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center ${!hasAcceptedTerms ? "cursor-not-allowed" : "cursor-pointer"}`}
                        >
                            {isJoining ? (
                                <>
                                    <Loader size="sm" color="white" variant="spinner" className="mr-2" />
                                    Traitement...
                                </>
                            ) : (
                                "Rejoindre la communauté"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 