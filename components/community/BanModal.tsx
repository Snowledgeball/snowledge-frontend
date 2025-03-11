"use client";

import { useRouter } from "next/navigation";

interface BanModalProps {
    bans: any[];
}

export default function BanModal({ bans }: BanModalProps) {
    const router = useRouter();

    if (!bans || bans.length === 0) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
                <div className="text-center mb-6">
                    <div className="bg-red-100 inline-flex p-3 rounded-full mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Accès refusé
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Vous avez été banni de cette communauté
                    </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Motif du bannissement :</h3>
                    <p className="text-gray-600 italic">
                        "{bans[0].reason}"
                    </p>
                </div>

                <div className="text-center">
                    <button
                        onClick={() => router.push("/")}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Retour à la page d'accueil
                    </button>
                </div>
            </div>
        </div>
    );
} 