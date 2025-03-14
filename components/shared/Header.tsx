"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Bell, Menu, X, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";
import { useRouter } from "next/navigation";
import { StatIndicator } from "./StatIndicator";
import { PointsIcon } from "./icons/PointsIcon";
import { WalletIcon } from "./icons/WalletIcon";
import { toast } from "sonner";
import NotificationBell from "./NotificationBell";

interface User {
  id: number;
  fullName: string;
  avatar: string;
}

export default function Header() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const router = useRouter();
  useEffect(() => {
    fetchUser();
  }, [session]);

  const fetchUser = async () => {
    if (session?.user?.id) {
      const response = await fetch(`/api/users/${session?.user?.id}`);
      const data = await response.json();
      setUser(data);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-[95rem] mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo et navigation gauche */}
          <div className="flex items-center space-x-8 mr-8">
            {/* Logo et navigation gauche */}
            <Link href="/" className="flex items-center">
              <img src="/images/logo.svg" alt="Logo" className="w-auto h-12" />
            </Link>

            {/* Navigation desktop */}
            <nav className="hidden lg:flex items-center space-x-6">
              <Link
                href="/"
                className="text-[#000333] hover:text-gray-900 font-bold text-sm"
              >
                EXPLORER
              </Link>
              <Link
                // onClick={() =>
                //   toast.info("Cette fonctionnalité n'est pas encore définie")
                // }
                href="/communaute"
                className="text-[#000333] hover:text-gray-900 font-bold text-sm "
              >
                COMMUNAUTÉS
              </Link>
            </nav>
          </div>

          {/* Menu mobile */}
          <button
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          {/* Actions desktop */}
          <div className="hidden lg:flex items-center space-x-4">
            <button
              onClick={() =>
                session?.user
                  ? router.push("/create-community")
                  : setIsSignupModalOpen(true)
              }
              className="flex items-center bg-[#000333] text-white px-2 sm:px-4 py-2 sm:py-3 rounded-xl text-sm sm:text-base font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_5706_11168)">
                  <path
                    d="M1.66675 1.66699L13.7501 4.58366L15.0001 10.8337L10.8334 15.0003L4.58341 13.7503L1.66675 1.66699ZM1.66675 1.66699L7.98841 7.98866M10.0001 15.8337L15.8334 10.0003L18.3334 12.5003L12.5001 18.3337L10.0001 15.8337ZM10.8334 9.16699C10.8334 10.0875 10.0872 10.8337 9.16675 10.8337C8.24627 10.8337 7.50008 10.0875 7.50008 9.16699C7.50008 8.24652 8.24627 7.50033 9.16675 7.50033C10.0872 7.50033 10.8334 8.24652 10.8334 9.16699Z"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_5706_11168">
                    <rect width="20" height="20" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              <span className="xs:inline text-sm">Devenir créateur</span>
            </button>
            {session && user ? (
              <>
                {/* <div className="flex items-center rounded-xl border border-gray-200">
                  <StatIndicator
                    type="points"
                    value={10458}
                    icon={<PointsIcon />}
                  />
                  <StatIndicator
                    type="wallet"
                    value={512.02}
                    icon={<WalletIcon />}
                    valueClassName="text-emerald-500"
                    noBorder
                  />
                </div> */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <NotificationBell />
                  <Link
                    href="/profile"
                    className="hover:opacity-80 transition-opacity"
                    aria-label="Profil"
                  >
                    <Image
                      src={user?.avatar}
                      alt={user?.fullName || "Photo de profil"}
                      width={32}
                      height={32}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
                    />
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Déconnexion"
                  >
                    <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Connexion
                </button>
                <button
                  onClick={() => setIsSignupModalOpen(true)}
                  className="border-2 border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 hover:border-blue-700 hover:text-blue-700 transition-all duration-200 ease-in-out"
                >
                  S'inscrire
                </button>
              </>
            )}
          </div>
        </div>

        {/* Menu mobile overlay */}
        {isMenuOpen && (
          <div className="lg:hidden">
            <div className="py-4 space-y-4">
              <Link
                href="/explore"
                className="block px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Explorer
              </Link>
              <Link
                href="/create-community"
                className="block px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Créer une communauté
              </Link>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() =>
                      session?.user
                        ? router.push("/create-community")
                        : setIsSignupModalOpen(true)
                    }
                    className="flex items-center bg-[#000333] text-white px-2 sm:px-4 py-2 sm:py-3 rounded-xl text-sm sm:text-base font-medium hover:opacity-90 transition-opacity mr-1"
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g clipPath="url(#clip0_5706_11168)">
                        <path
                          d="M1.66675 1.66699L13.7501 4.58366L15.0001 10.8337L10.8334 15.0003L4.58341 13.7503L1.66675 1.66699ZM1.66675 1.66699L7.98841 7.98866M10.0001 15.8337L15.8334 10.0003L18.3334 12.5003L12.5001 18.3337L10.0001 15.8337ZM10.8334 9.16699C10.8334 10.0875 10.0872 10.8337 9.16675 10.8337C8.24627 10.8337 7.50008 10.0875 7.50008 9.16699C7.50008 8.24652 8.24627 7.50033 9.16675 7.50033C10.0872 7.50033 10.8334 8.24652 10.8334 9.16699Z"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_5706_11168">
                          <rect width="20" height="20" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                    <span className="xs:inline">Créer</span>
                  </button>
                  {session && user ? (
                    <>
                      <div className="flex items-center rounded-xl border border-gray-200 mx-2">
                        <StatIndicator
                          type="points"
                          value={10458}
                          icon={<PointsIcon />}
                        />
                        <StatIndicator
                          type="wallet"
                          value={512.02}
                          icon={<WalletIcon />}
                          valueClassName="text-emerald-500"
                          noBorder
                        />
                      </div>

                      <div className="flex items-center gap-2 sm:gap-4">
                        <button
                          className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
                          aria-label="Notifications"
                        >
                          <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                        </button>
                        <Link
                          href="/profile"
                          className="hover:opacity-80 transition-opacity"
                          aria-label="Profil"
                        >
                          <Image
                            src={user?.avatar}
                            alt={user?.fullName || "Photo de profil"}
                            width={32}
                            height={32}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
                          />
                        </Link>
                        <button
                          onClick={() => signOut({ callbackUrl: "/" })}
                          className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                          aria-label="Déconnexion"
                        >
                          <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
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
}
