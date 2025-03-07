"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import {
  Users,
  ArrowLeft,
  MessageCircle,
  Edit,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import QASection from "@/components/shared/QASection";
import ChatBox from "@/components/shared/ChatBox";

interface Post {
  id: number;
  title: string;
  content: string;
  cover_image_url: string | null;
  tag: string;
  created_at: string;
  accept_contributions: boolean;
  user: {
    id: number;
    fullName: string;
    profilePicture: string;
  };
}

export default function PostPage() {
  const params = useParams();

  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(
          `/api/communities/${params.id}/posts/${params.postId}?status=PUBLISHED`
        );
        if (!response.ok) throw new Error("Post non trouvé");
        const data = await response.json();
        setPost(data);
      } catch (error) {
        toast.error("Erreur lors du chargement du post");
        router.push(`/community/${params.id}`);
      }
    };

    fetchPost();
  }, [params.id, params.postId, router]);


  if (!post) return <div>Chargement...</div>;

  return (
    <div className="min-h-screen bg-gray-50" id="post-page">
      <div className="w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#003E8A] to-[#16215B] py-6 mb-8">
        <div className="max-w-7xl mx-auto px-4">
          <button
            onClick={() => router.push(`/community/${params.id}`)}
            className="flex items-center text-white hover:text-gray-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à la communauté
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Contenu principal */}
          <main className="flex-1 order-2 lg:order-1">
            <Card className="overflow-hidden">
              {post.cover_image_url && (
                <div className="w-full h-96 relative">
                  <Image
                    src={`https://${post.cover_image_url}`}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <Image
                      src={post.user.profilePicture}
                      alt={post.user.fullName}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        {post.user.fullName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(post.created_at), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
                    {post.tag}
                  </span>
                  {Number(session?.user?.id) === post.user.id && (
                    <button
                      onClick={() =>
                        router.push(
                          `/community/${params.id}/posts/${post.id}/edit`
                        )
                      }
                      className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Modifier</span>
                    </button>
                  )}
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-6">
                  {post.title}
                </h1>

                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {post.accept_contributions ? (
                  <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center text-green-700">
                      <Users className="w-5 h-5 mr-2" />
                      <span className="font-medium">
                        Contributions activées
                      </span>
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                      Vous pouvez proposer des modifications à ce post
                    </p>
                  </div>
                ) : (
                  <div className="mt-8 p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center text-red-700">
                      <Users className="w-5 h-5 mr-2" />
                      <span className="font-medium">
                        Contributions désactivées
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {params.postId && session && (
              // Q&A Section
              <div className="mt-8">
                <QASection
                  communityId={params.id as string}
                  postId={params.postId as string}
                  isContributor={Number(session?.user?.id) === post.user.id}
                  isCreator={Number(session?.user?.id) === post.user.id}
                  userId={session?.user?.id}
                />
              </div>
            )}
          </main>

          {/* Sidebar Chat - maintenant responsive */}
          <aside className="w-full lg:w-[320px] order-1 lg:order-2 sticky top-4 self-start">
            <Card className="overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
                  Discussion
                </h2>
              </div>

              <div className="h-[calc(100vh-11rem)] sticky">
                {session && (
                  <ChatBox
                    user={session.user}
                    communityId={parseInt(params.id as string)}
                    postId={parseInt(params.postId as string)}
                    className="h-full"
                    variant="post"
                  />
                )}
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
