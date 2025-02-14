"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Crown } from "lucide-react";


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
                        <Link href="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:bg-blue-50">
                            Explorer
                        </Link>
                        <Link href="/communaute" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:bg-blue-50">
                            Mes Communautés
                        </Link>
                    </div>


                    {session ? (
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center rounded-xl border border-gray-200">
                                <div className="flex items-center gap-2 px-4 py-1 border-r border-gray-200">
                                    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M15.24 3.7621C15.1272 3.66375 14.9877 3.60115 14.8393 3.58223C14.6908 3.56331 14.5401 3.58894 14.4062 3.65585L11.2681 5.21835L8.64812 0.866475C8.58077 0.754804 8.48571 0.662429 8.37216 0.598306C8.2586 0.534183 8.13041 0.500488 8 0.500488C7.86959 0.500488 7.74139 0.534183 7.62784 0.598306C7.51428 0.662429 7.41922 0.754804 7.35187 0.866475L4.73187 5.22022L1.595 3.65772C1.46146 3.59141 1.31131 3.56601 1.16339 3.58471C1.01547 3.60341 0.876369 3.66539 0.763543 3.76286C0.650717 3.86033 0.569193 3.98896 0.5292 4.13259C0.489208 4.27622 0.492529 4.42847 0.538747 4.57022L2.85125 11.6552C2.8745 11.7264 2.91344 11.7914 2.96519 11.8456C3.01695 11.8997 3.0802 11.9415 3.15027 11.9679C3.22034 11.9943 3.29545 12.0046 3.37004 11.9981C3.44463 11.9916 3.51681 11.9684 3.58125 11.9302C3.59687 11.9209 5.195 11.0002 8 11.0002C10.805 11.0002 12.4031 11.9208 12.4175 11.9296C12.482 11.9681 12.5543 11.9916 12.629 11.9984C12.7038 12.0051 12.7792 11.9949 12.8495 11.9686C12.9198 11.9422 12.9832 11.9003 13.0352 11.8461C13.0871 11.7919 13.1261 11.7266 13.1494 11.6552L15.4619 4.5721C15.5094 4.43031 15.5137 4.27757 15.4742 4.13334C15.4347 3.9891 15.3532 3.85987 15.24 3.7621ZM12.375 10.8021C11.625 10.484 10.13 10.0002 8 10.0002C5.87 10.0002 4.375 10.484 3.625 10.8021L1.66937 4.81273L4.48625 6.2171C4.65675 6.30118 4.85256 6.31837 5.03511 6.26527C5.21765 6.21217 5.37369 6.09264 5.4725 5.93022L8 1.72897L10.5275 5.92898C10.6264 6.09113 10.7823 6.21046 10.9647 6.26354C11.147 6.31661 11.3427 6.29961 11.5131 6.21585L14.3306 4.81273L12.375 10.8021ZM10.9919 8.8021C10.9715 8.91777 10.911 9.02256 10.8211 9.0981C10.7311 9.17364 10.6174 9.2151 10.5 9.21523C10.4707 9.21519 10.4414 9.21268 10.4125 9.20773C8.81543 8.93356 7.18332 8.93356 5.58625 9.20773C5.45563 9.23077 5.32121 9.20097 5.21255 9.1249C5.1039 9.04883 5.02991 8.93272 5.00687 8.8021C4.98383 8.67148 5.01362 8.53706 5.08969 8.4284C5.16576 8.31975 5.28188 8.24577 5.4125 8.22272C7.12454 7.92856 8.87421 7.92856 10.5862 8.22272C10.7166 8.24561 10.8326 8.31926 10.9087 8.42751C10.9849 8.53577 11.015 8.6698 10.9925 8.80023L10.9919 8.8021Z" fill="#000333" />
                                    </svg>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500">POINTS</span>
                                        <span className="font-bold text-gray-900 text-sm">10.458</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-1">
                                    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M11.5 3.59812V3.25C11.5 1.6825 9.13562 0.5 6 0.5C2.86438 0.5 0.5 1.6825 0.5 3.25V5.75C0.5 7.05562 2.14062 8.09313 4.5 8.40375V8.75C4.5 10.3175 6.86438 11.5 10 11.5C13.1356 11.5 15.5 10.3175 15.5 8.75V6.25C15.5 4.95625 13.9113 3.9175 11.5 3.59812ZM14.5 6.25C14.5 7.07625 12.5756 8 10 8C9.76688 8 9.53562 7.99188 9.3075 7.97688C10.6556 7.48563 11.5 6.6875 11.5 5.75V4.60875C13.3669 4.88687 14.5 5.64188 14.5 6.25ZM4.5 7.39062V5.90375C4.99736 5.96856 5.49843 6.00071 6 6C6.50157 6.00071 7.00264 5.96856 7.5 5.90375V7.39062C7.00338 7.46399 6.50201 7.50055 6 7.5C5.49799 7.50055 4.99662 7.46399 4.5 7.39062ZM10.5 4.87063V5.75C10.5 6.27437 9.72437 6.8375 8.5 7.17937V5.71875C9.30688 5.52313 9.99 5.23187 10.5 4.87063ZM6 1.5C8.57562 1.5 10.5 2.42375 10.5 3.25C10.5 4.07625 8.57562 5 6 5C3.42438 5 1.5 4.07625 1.5 3.25C1.5 2.42375 3.42438 1.5 6 1.5ZM1.5 5.75V4.87063C2.01 5.23187 2.69313 5.52313 3.5 5.71875V7.17937C2.27562 6.8375 1.5 6.27437 1.5 5.75ZM5.5 8.75V8.48938C5.66437 8.49563 5.83063 8.5 6 8.5C6.2425 8.5 6.47937 8.49187 6.71187 8.47812C6.97016 8.57059 7.23325 8.64904 7.5 8.71313V10.1794C6.27563 9.8375 5.5 9.27437 5.5 8.75ZM8.5 10.3906V8.9C8.9972 8.96684 9.49833 9.00025 10 9C10.5016 9.00071 11.0026 8.96856 11.5 8.90375V10.3906C10.5053 10.5365 9.49468 10.5365 8.5 10.3906ZM12.5 10.1794V8.71875C13.3069 8.52312 13.99 8.23187 14.5 7.87062V8.75C14.5 9.27437 13.7244 9.8375 12.5 10.1794Z" fill="#21BB8A" />
                                    </svg>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500">WALLET</span>
                                        <span className="font-bold text-emerald-500 text-sm">512.02</span>
                                    </div>
                                </div>
                            </div>
                            <Link
                                href={`/profile`}
                                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:bg-blue-50 flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Mon Profil
                            </Link>
                            <button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="text-gray-600 hover:text-red-600 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 border border-gray-200 hover:border-red-200 hover:bg-red-50 flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Se déconnecter
                            </button>
                        </div>
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
        </header >
    );
};


export default Header;
