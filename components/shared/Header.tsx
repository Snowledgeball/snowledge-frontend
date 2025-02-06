"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";
import { useState } from "react";
import { useRouter } from "next/navigation";



const Header = () => {
    const { data: session } = useSession();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
    const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
    const router = useRouter();

    return (
        <header className="bg-white shadow-lg border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">

                    {/* Logo et nom */}
                    <div
                        className="flex items-center hover:opacity-90 transition-opacity duration-200 cursor-pointer"
                        onClick={() => router.push('/')}
                    >
                        <div className="w-10 h-10 bg-blue-600 rounded-full mr-3 flex items-center justify-center">
                            <img
                                src="/images/logo.png"

                                alt="Snowledgeball Logo"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span className="text-2xl font-bold text-gray-900 tracking-tight">Snowledgeball</span>
                    </div>

                    {/* Navigation centrale */}
                    <div className="flex space-x-8">
                        <Link href="/explorer" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:bg-blue-50">
                            Explorer
                        </Link>
                        <Link href="/communaute" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:bg-blue-50">
                            Communauté
                        </Link>
                    </div>

                    {session ? (
                        <button
                            onClick={() => signOut()}
                            className="bg-red-600 text-white hover:bg-red-700 px-6 py-2.5 rounded-md text-sm font-medium transition-colors duration-200 hover:shadow-md"
                        >
                            Se déconnecter
                        </button>
                    ) : (
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setIsLoginModalOpen(true)}
                                className="inline-flex items-center px-6 py-2.5 border border-blue-600 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                            >
                                Se connecter
                            </button>
                            <button
                                onClick={() => setIsSignupModalOpen(true)}
                                className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200 hover:shadow-md"
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
