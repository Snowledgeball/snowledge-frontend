"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { Users, ArrowLeft, MessageCircle, Edit, Copy } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import QASection from "@/components/shared/QASection";
import ChatBox from "@/components/shared/ChatBox";
import Link from "next/link";
import { Loader } from "@/components/ui/loader";
import { useTranslation } from "react-i18next";
import PreviewRenderer from "@/components/shared/PreviewRenderer";

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
  status: string;
  author_id: number;
  community_posts_category: {
    id: number;
    name: string;
    label: string;
  };
}

export default function PostPage() {
  const params = useParams();

  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const { data: session } = useSession();
  const [isAuthor, setIsAuthor] = useState(false);
  const [isContributorOrCreator, setIsContributorOrCreator] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(
          `/api/communities/${params.id}/posts/${params.postId}?status=PUBLISHED`
        );
        if (!response.ok) throw new Error(t("community_posts.post_not_found"));
        const data = await response.json();
        setPost(data);
      } catch (error) {
        toast.error(t("community_posts.error_loading_post"));
        router.push(`/community/${params.id}`);
      }
    };

    fetchPost();
  }, [params.id, params.postId, router, t]);

  useEffect(() => {
    // Vérifier si l'utilisateur est l'auteur du post
    if (post && session) {
      setIsAuthor(post.author_id === parseInt(session.user.id));

      // Vérifier si l'utilisateur est membre de la communauté
      const checkMembership = async () => {
        try {
          const response = await fetch(
            `/api/communities/${params.id}/membership`
          );
          if (response.ok) {
            const data = await response.json();
            setIsContributorOrCreator(data.isContributor || data.isCreator);
          }
        } catch (error) {
          console.error(t("community_posts.membership_check_error"), error);
        }
      };

      checkMembership();
    }
  }, [post, session, params.id, t]);

  if (!post) return <Loader fullScreen text={t("loading.post")} />;

  return (
    <div className="min-h-screen bg-gray-50" id="post-page">
      <div className="w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#003E8A] to-[#16215B] py-6 mb-8">
        <div className="max-w-7xl mx-auto px-4">
          <button
            onClick={() => router.push(`/community/${params.id}`)}
            className="flex items-center text-white hover:text-gray-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("navigation.back_to_community")}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Contenu principal */}
          <main className="flex-1 order-2 lg:order-1 max-w-4xl">
            <Card className="overflow-hidden">
              {post.cover_image_url && (
                <div className="w-full h-56 relative">
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
                    {post.community_posts_category.label}
                  </span>

                  {post.accept_contributions &&
                    session &&
                    !isAuthor &&
                    isContributorOrCreator && (
                      <Link
                        href={`/community/${params.id}/posts/${params.postId}/enrich`}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        {t("actions.contribute")}
                      </Link>
                    )}

                  {session && !isAuthor && isContributorOrCreator && (
                    <Link
                      href={{
                        pathname: `/community/${params.id}/posts/create`,
                        query: {
                          title: post.title,
                          content: post.content,
                          coverImageUrl: post.cover_image_url,
                          tag: post.tag,
                          fromPost: post.id,
                        },
                      }}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {t("community_posts.duplicate_post")}
                    </Link>
                  )}

                  {Number(session?.user?.id) === post.user.id && (
                    <button
                      onClick={() =>
                        router.push(
                          `/community/${params.id}/posts/${post.id}/edit?status=PUBLISHED`
                        )
                      }
                      className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span>{t("actions.edit")}</span>
                    </button>
                  )}
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-6">
                  {post.title}
                </h1>

                <div id="post-content" className="mb-6">
                  <style jsx global>{`
                    #post-content h1 {
                      font-size: 2rem;
                      font-weight: 700;
                      margin-top: 1.5rem;
                      margin-bottom: 1rem;
                      color: #1f2937;
                    }
                    #post-content h2 {
                      font-size: 1.75rem;
                      font-weight: 700;
                      margin-top: 1.5rem;
                      margin-bottom: 1rem;
                      color: #1f2937;
                      line-height: 1.3;
                    }
                    #post-content h3 {
                      font-size: 1.5rem;
                      font-weight: 600;
                      margin-top: 1.25rem;
                      margin-bottom: 0.75rem;
                      color: #1f2937;
                    }
                    #post-content p {
                      margin-bottom: 1rem;
                      line-height: 1.7;
                      color: #4b5563;
                    }
                    #post-content ul,
                    #post-content ol {
                      margin-left: 1.5rem;
                      margin-bottom: 1rem;
                    }
                    #post-content ul {
                      list-style-type: disc;
                    }
                    #post-content ol {
                      list-style-type: decimal;
                    }
                    #post-content a {
                      color: #2563eb;
                      text-decoration: underline;
                    }
                    #post-content blockquote {
                      border-left: 4px solid #e5e7eb;
                      padding-left: 1rem;
                      font-style: italic;
                      color: #6b7280;
                      margin: 1.5rem 0;
                    }
                    #post-content img {
                      max-width: 100%;
                      height: auto;
                      border-radius: 0.5rem;
                      margin: 1.5rem 0;
                    }
                    #post-content pre {
                      background-color: #f3f4f6;
                      padding: 1rem;
                      border-radius: 0.5rem;
                      overflow-x: auto;
                      margin: 1.5rem 0;
                    }
                    #post-content code {
                      background-color: #f3f4f6;
                      padding: 0.2rem 0.4rem;
                      border-radius: 0.25rem;
                      font-family: monospace;
                    }
                    #post-content table {
                      width: 100%;
                      border-collapse: collapse;
                      margin: 1.5rem 0;
                    }
                    #post-content th,
                    #post-content td {
                      border: 1px solid #e5e7eb;
                      padding: 0.5rem;
                    }
                    #post-content th {
                      background-color: #f9fafb;
                      font-weight: 600;
                    }
                  `}</style>
                  <div className="prose prose-lg max-w-none">
                    <PreviewRenderer editorContent={post.content} />
                  </div>
                </div>

                {/* Si le post accepte les contributions on l'indique */}
                <div className="text-sm my-4 flex items-center">
                  {post.accept_contributions ? (
                    <span className="text-sm text-green-600 flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {t("community_posts.contributions_enabled")}
                    </span>
                  ) : (
                    <span className="text-sm text-red-600 flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {t("community_posts.contributions_disabled")}
                    </span>
                  )}
                </div>
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
                  {t("community_posts.discussion")}
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
