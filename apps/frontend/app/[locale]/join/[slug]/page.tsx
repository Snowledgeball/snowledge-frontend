"use client";
import React from "react";
import { UserPlus } from "lucide-react";
import { BackgroundGradient } from "@repo/ui/components/background-gradient";
import { notFound, useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { fromSlug } from "@/utils/slug";
import { useMutation } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { useCommunity } from "@/hooks/useCommunity";

export default function JoinPage() {
  const { slug } = useParams();
  const t = useTranslations("join");
  const communityName = fromSlug(slug as string);
  const { user } = useAuth();
  const router = useRouter();

  //il faut vérifier que la communauté existe avant d'afficher  quoi que ce soit
  const { data: community, isLoading, isError } = useCommunity(slug as string);

  const joinMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Non authentifié");
      const res = await fetcher(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/communities/${slug}/learners/${user.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
          credentials: "include",
        }
      );
      return res;
    },
    onSuccess: () => {
      toast.success(t("success"));
      setTimeout(() => {
        router.push(`/${slug}`);
      }, 1200);
    },
    onError: (err) => {
      const error = JSON.parse(err.message);
      // console.log(error); // tout l'objet
      toast.error(error.message || t("error"));
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) {
    !community && toast.error("Community not found") && notFound();
    return <div>Error</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50/60 via-fuchsia-50/40 to-indigo-100/60 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900">
      <BackgroundGradient className="rounded-[28px] max-w-md w-full p-6 sm:p-12 bg-white/90 dark:bg-zinc-900/90 flex flex-col items-center shadow-2xl border border-blue-100 dark:border-zinc-800 relative overflow-hidden">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/90 to-indigo-400/90 text-white text-sm font-semibold shadow-md mb-6 animate-fade-in">
          <UserPlus className="w-5 h-5" />
          {t("badge")}
        </span>
        <p className="uppercase tracking-widest text-xs text-blue-500 dark:text-blue-300 font-semibold mb-2 animate-fade-in">
          {t("private")}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-zinc-900 dark:text-white mb-4 animate-fade-in">
          {t("title", { communityName })}
        </h1>
        <p className="text-base text-neutral-700 dark:text-neutral-300 text-center mb-6 animate-fade-in">
          {t("description", { communityName })}
        </p>
        <button
          className="rounded-full px-8 py-3 text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-500 text-white shadow-lg hover:scale-105 hover:from-blue-700 hover:to-indigo-600 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all duration-200 animate-bounce-slow disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={() => joinMutation.mutate()}
          disabled={joinMutation.isPending}
        >
          {joinMutation.isPending ? t("loading") : t("button")}
        </button>
        {/* Animation décorative en fond de carte */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-blue-400/30 to-indigo-400/10 rounded-full blur-2xl z-0" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-fuchsia-400/20 to-blue-400/10 rounded-full blur-2xl z-0" />
      </BackgroundGradient>
    </div>
  );
}
