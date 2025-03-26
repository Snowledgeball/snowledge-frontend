"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import {
  Users,
  MessageCircle,
  Activity,
  Wallet,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Loader } from "@/components/ui/loader";

interface Community {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  imageUrl: string;
}

export default function CommunautePage() {
  const {
    isLoading: isLoadingAuth,
    isAuthenticated: isAuthenticatedAuth,
    LoadingComponent,
  } = useAuthGuard();

  if (isLoadingAuth) {
    return <LoadingComponent />;
  }

  if (!isAuthenticatedAuth) {
    return null;
  }

  // if (!session) {
  //     return (
  //         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

  //             <div className="text-center">
  //                 <h1 className="text-3xl font-bold text-gray-900 mb-4">
  //                     Connectez-vous pour voir vos communautés
  //                 </h1>
  //                 <p className="text-gray-600">
  //                     Rejoignez Snowledge pour accéder à toutes les fonctionnalités
  //                 </p>
  //             </div>
  //         </div>
  //     );
  // }

  // if (isLoading) {
  //     return (
  //         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  //             <div className="animate-pulse">
  //                 {[...Array(3)].map((_, i) => (
  //                     <div key={i} className="mb-6 bg-gray-200 h-32 rounded-lg"></div>
  //                 ))}
  //             </div>
  //         </div>
  //     );
  // }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Loader
        size="lg"
        color="gradient"
        text="Chargement..."
        variant="spinner"
      />
      <div className="flex items-center justify-center bg-blue-500">
        <p>Chargement...</p>
        <Loader
          size="lg"
          color="white"
          text="Chargement..."
          variant="spinner"
          className="mr-2"
        />
      </div>
    </div>
    // <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    //     <h1 className="text-3xl font-bold text-gray-900 mb-12">
    //         Mes Communautés
    //     </h1>

    //     {communities.length === 0 ? (
    //         <div className="text-center py-12">
    //             <h2 className="text-xl text-gray-600 mb-4">
    //                 Vous n'avez rejoint aucune communauté pour le moment
    //             </h2>
    //             <Link
    //                 href="/"
    //                 className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
    //             >
    //                 Explorer les communautés
    //             </Link>
    //         </div>
    //     ) : (
    //         <div className="flex flex-wrap justify-center gap-8">

    //             {/* Section des communautés rejointes */}
    //             <div className="w-full max-w-5xl">
    //                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    //                     {communities.map((community) => (
    //                         <div
    //                             key={community.id}
    //                             className="group w-full h-[500px] [perspective:1000px]"
    //                         >
    //                             <div className="relative h-full w-full duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
    //                                 {/* Front */}
    //                                 <div className="absolute inset-0 [backface-visibility:hidden] group-hover:animate-card-rotate-out">
    //                                     <div className="h-full w-full rounded-xl bg-white shadow-sm">
    //                                         <div className="relative h-2/3">
    //                                             <Image
    //                                                 src={community.imageUrl}
    //                                                 alt={community.name}
    //                                                 fill
    //                                                 sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    //                                                 priority={true}
    //                                                 className="object-cover rounded-t-xl group-hover:scale-105 transition-transform duration-700"
    //                                                 quality={75}
    //                                                 loading="eager"
    //                                             />
    //                                             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-t-xl" />
    //                                             <div className="absolute bottom-0 left-0 right-0 p-6">
    //                                                 <h2 className="text-2xl font-bold text-white mb-3">
    //                                                     {community.name}
    //                                                 </h2>
    //                                                 <div className="flex items-center text-white/90 mb-2">
    //                                                     <Users className="h-5 w-5 mr-2" />
    //                                                     <span>
    //                                                         {new Intl.NumberFormat('fr-FR').format(community.memberCount)} membres
    //                                                     </span>
    //                                                 </div>
    //                                                 <p className="text-white/80 text-sm line-clamp-2 transform translate-y-0 opacity-100 group-hover:opacity-100 transition-all duration-300">
    //                                                     {community.description}
    //                                                 </p>
    //                                             </div>
    //                                         </div>
    //                                         <div className="p-6">
    //                                             <div className="group/hint relative overflow-hidden rounded-lg border border-gray-100 hover:border-blue-200 transition-colors">
    //                                                 <div className="flex items-center justify-between p-3">
    //                                                     <div className="flex items-center gap-2">
    //                                                         <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
    //                                                         <span className="text-sm font-medium text-gray-600">
    //                                                             Survoler pour explorer
    //                                                         </span>
    //                                                     </div>
    //                                                     <div className="relative w-6 overflow-hidden">
    //                                                         <div className="absolute inset-y-0 -left-6 flex items-center transition-transform duration-300 group-hover/hint:translate-x-6">
    //                                                             <span className="text-blue-500">→</span>
    //                                                         </div>
    //                                                         <div className="absolute inset-y-0 left-0 flex items-center transition-transform duration-300 group-hover/hint:translate-x-6">
    //                                                             <span className="text-blue-500">→</span>
    //                                                         </div>
    //                                                     </div>
    //                                                 </div>
    //                                             </div>
    //                                         </div>
    //                                     </div>
    //                                 </div>
    //                                 {/* Back */}
    //                                 <div className="absolute inset-0 h-full w-full [transform:rotateY(180deg)] [backface-visibility:hidden] group-hover:animate-card-rotate-in">
    //                                     <Link href={`/community/${encodeURIComponent(community.id)}`}>
    //                                         <div className="h-full w-full rounded-xl bg-gray-50 p-6 border border-gray-200 shadow-lg">
    //                                             {/* En-tête avec animation */}
    //                                             <div className="mb-8 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-300">
    //                                                 <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 text-sm font-medium rounded-full mb-3">
    //                                                     Aperçu
    //                                                 </span>
    //                                                 <p className="text-sm text-gray-600">{community.description}</p>
    //                                             </div>

    //                                             {/* Statistiques avec animations en cascade */}
    //                                             <div className="space-y-3 cursor-context-menu">
    //                                                 {[
    //                                                     {
    //                                                         icon: Users,
    //                                                         bgColor: "bg-blue-50",
    //                                                         iconColor: "text-blue-500",
    //                                                         label: "Membres",
    //                                                         value: community.memberCount,
    //                                                         delay: "delay-300"
    //                                                     },
    //                                                     {
    //                                                         icon: MessageCircle,
    //                                                         bgColor: "bg-green-50",
    //                                                         iconColor: "text-green-500",
    //                                                         label: "Messages / jour",
    //                                                         value: Math.floor(community.memberCount * 0.1),
    //                                                         delay: "delay-400"
    //                                                     },
    //                                                     {
    //                                                         icon: Activity,
    //                                                         bgColor: "bg-purple-50",
    //                                                         iconColor: "text-purple-500",
    //                                                         label: "Membres actifs",
    //                                                         value: Math.floor(community.memberCount * 0.7),
    //                                                         delay: "delay-500"
    //                                                     }
    //                                                 ].map((stat, index) => (
    //                                                     <div
    //                                                         key={index}
    //                                                         className={`flex items-center p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 transition-all opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 ${stat.delay}`}
    //                                                     >
    //                                                         <div className={`h-10 w-10 ${stat.bgColor} rounded-lg flex items-center justify-center mr-4`}>
    //                                                             <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
    //                                                         </div>
    //                                                         <div className="flex-1">
    //                                                             <p className="text-sm text-gray-500">{stat.label}</p>
    //                                                             <p className="text-lg font-semibold text-gray-900">
    //                                                                 {new Intl.NumberFormat('fr-FR').format(stat.value)}
    //                                                             </p>
    //                                                         </div>
    //                                                     </div>
    //                                                 ))}
    //                                             </div>

    //                                             {/* Bouton avec animation */}
    //                                             <div className="absolute bottom-6 left-6 right-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-[700ms]">
    //                                                 <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-all hover:shadow-lg hover:scale-[1.02]">
    //                                                     Accéder à la communauté
    //                                                 </button>
    //                                             </div>
    //                                         </div>
    //                                     </Link>
    //                                 </div>
    //                             </div>
    //                         </div>
    //                     ))}
    //                 </div>
    //             </div>

    //             {/* Section des communautés recommandées */}
    //             <div className="w-full max-w-5xl mt-16">
    //                 <h2 className="text-2xl font-bold text-gray-900 mb-8">
    //                     Communautés recommandées
    //                 </h2>
    //                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    //                     {[
    //                         {
    //                             id: "CryptoMasters France",
    //                             name: "CryptoMasters France",
    //                             description: "Communauté dédiée à la finance décentralisée",
    //                             icon: <Wallet className="w-6 h-6 text-purple-600" />,
    //                             bgColor: "bg-purple-100",
    //                             members: "3.2k"
    //                         },
    //                         {
    //                             id: "traders-elite",
    //                             name: "Traders Elite",
    //                             description: "Analyses techniques et signaux de trading",
    //                             icon: <TrendingUp className="w-6 h-6 text-green-600" />,
    //                             bgColor: "bg-green-100",
    //                             members: "5.8k"
    //                         },
    //                         {
    //                             id: "crypto-analytics",
    //                             name: "Crypto Analytics",
    //                             description: "Analyses on-chain et fondamentales",
    //                             icon: <Activity className="w-6 h-6 text-blue-600" />,
    //                             bgColor: "bg-blue-100",
    //                             members: "4.1k"
    //                         }
    //                     ].map((community) => (
    //                         <Link
    //                             key={community.id}
    //                             href={`/community/${encodeURIComponent(community.id)}`}
    //                             className="block bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-200 transition-all hover:shadow-md"
    //                         >
    //                             <div className="flex items-center space-x-4 mb-4">
    //                                 <div className={`w-12 h-12 ${community.bgColor} rounded-lg flex items-center justify-center`}>
    //                                     {community.icon}
    //                                 </div>
    //                                 <div>
    //                                     <h3 className="font-semibold text-gray-900">{community.name}</h3>
    //                                     <div className="flex items-center text-sm text-gray-500 mt-1">
    //                                         <Users className="w-4 h-4 mr-1" />
    //                                         <span>{community.members} membres</span>
    //                                     </div>
    //                                 </div>
    //                             </div>
    //                             <p className="text-sm text-gray-600 mb-4">{community.description}</p>
    //                             <button className="w-full bg-gray-50 text-blue-600 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium">
    //                                 Découvrir
    //                             </button>
    //                         </Link>
    //                     ))}
    //                 </div>
    //             </div>
    //         </div>
    //     )}
    // </div>
  );
}
