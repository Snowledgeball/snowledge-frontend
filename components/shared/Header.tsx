"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";
import { useState } from "react";


const Header = () => {
    const { data: session } = useSession();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
    const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)

    return (
        <header className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    {/* Logo et nom */}
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded-full mr-2">
                            {/* Emplacement pour le logo */}
                        </div>
                        <span className="text-xl font-bold text-gray-900">Snowledgeball</span>
                    </div>

                    {/* Navigation centrale */}
                    <div className="flex space-x-8">
                        <Link href="/explorer" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                            Explorer
                        </Link>
                        <Link href="/communaute" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                            Communauté
                        </Link>
                    </div>


                    {session ? (
                        <button
                            onClick={() => signOut()}
                            className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium"
                        >
                            Se déconnecter
                        </button>
                    ) : (

                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setIsLoginModalOpen(true)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Se connecter
                            </button>
                            <button
                                onClick={() => setIsSignupModalOpen(true)}
                                className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium"
                            >
                                S'inscrire
                            </button>
                        </div>
                    )}



                </div>
            </div>
            <LoginModal
                isOpen={isLoginModalOpen}
                closeModal={() => setIsLoginModalOpen(false)}
            />
            <SignupModal
                isOpen={isSignupModalOpen}
                closeModal={() => setIsSignupModalOpen(false)}
            />
        </header>
    );
};


export default Header;
