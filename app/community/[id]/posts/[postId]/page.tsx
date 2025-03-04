"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import {
  Users,
  ArrowLeft,
  MessageCircle,
  Send,
  HelpCircle,
  ChevronDown,
  Edit,
  PlusCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { Disclosure } from "@/components/ui/disclosure";
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

type Message = {
  id: number;
  user: {
    fullName: string;
    profilePicture: string;
  };
  content: string;
  timestamp: string;
  reactions: string[];
};

type QAItem = {
  id: number;
  question: string;
  created_at: string;
  author: {
    id: number;
    fullName: string;
    profilePicture: string;
  };
  answers: {
    id: number;
    content: string;
    created_at: string;
    is_accepted: boolean;
    author: {
      id: number;
      fullName: string;
      profilePicture: string;
    };
  }[];
};

export default function PostPage() {
  const params = useParams();

  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [message, setMessage] = useState("");
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      user: {
        fullName: "Thomas Dubois",
        profilePicture:
          "https://ui-avatars.com/api/?name=Thomas+Dubois&background=0D8ABC&color=fff",
      },
      content:
        "Excellente analyse ! Particulièrement d'accord sur le point concernant la résistance.",
      timestamp: "2024-01-15T10:30:00",
      reactions: ["👍", "🤔"],
    },
    {
      id: 2,
      user: {
        fullName: "Marie Leroy",
        profilePicture:
          "https://ui-avatars.com/api/?name=Marie+Leroy&background=FF6B6B&color=fff",
      },
      content:
        "Je pense qu'il faudrait aussi considérer l'aspect environnemental dans cette analyse. Qu'en pensez-vous ?",
      timestamp: "2024-01-15T11:15:00",
      reactions: ["🌱", "💡"],
    },
    {
      id: 3,
      user: {
        fullName: "Lucas Martin",
        profilePicture:
          "https://ui-avatars.com/api/?name=Lucas+Martin&background=4CAF50&color=fff",
      },
      content:
        "Très pertinent ! J'ajouterais que les dernières données du marché confirment totalement cette tendance.",
      timestamp: "2024-01-15T12:00:00",
      reactions: ["��", "👍"],
    },
    {
      id: 4,
      user: {
        fullName: "Claire Dubois",
        profilePicture:
          "https://ui-avatars.com/api/?name=Claire+Dubois&background=9C27B0&color=fff",
      },
      content:
        "Les chiffres du dernier trimestre sont vraiment révélateurs. Je partage un graphique intéressant à ce sujet demain.",
      timestamp: "2024-01-15T14:20:00",
      reactions: ["🔥", "📈"],
    },
    {
      id: 5,
      user: {
        fullName: "Antoine Moreau",
        profilePicture:
          "https://ui-avatars.com/api/?name=Antoine+Moreau&background=E91E63&color=fff",
      },
      content:
        "Est-ce que quelqu'un aurait des sources complémentaires sur le sujet ? Je travaille sur une étude similaire.",
      timestamp: "2024-01-15T15:45:00",
      reactions: ["📚"],
    },
    {
      id: 6,
      user: {
        fullName: "Sophie Laurent",
        profilePicture:
          "https://ui-avatars.com/api/?name=Sophie+Laurent&background=7C3AED&color=fff",
      },
      content:
        "Je peux partager quelques références académiques si ça t'intéresse Antoine.",
      timestamp: "2024-01-15T16:00:00",
      reactions: ["🙏", "👍"],
    },
    {
      id: 7,
      user: {
        fullName: "Léa Martin",
        profilePicture:
          "https://ui-avatars.com/api/?name=Lea+Martin&background=14B8A6&color=fff",
      },
      content:
        "Je viens de lire un rapport complémentaire qui confirme ces analyses. Très intéressant de voir la convergence des données.",
      timestamp: "2024-01-15T16:15:00",
      reactions: ["📊", "✨"],
    },
    {
      id: 8,
      user: {
        fullName: "Hugo Bernard",
        profilePicture:
          "https://ui-avatars.com/api/?name=Hugo+Bernard&background=6366F1&color=fff",
      },
      content:
        "On pourrait organiser un webinaire pour approfondir certains points ? Je pense notamment à la partie sur l'innovation.",
      timestamp: "2024-01-15T16:30:00",
      reactions: ["💡", "👏"],
    },
    {
      id: 9,
      user: {
        fullName: "Emma Petit",
        profilePicture:
          "https://ui-avatars.com/api/?name=Emma+Petit&background=DB2777&color=fff",
      },
      content:
        "Excellente idée Hugo ! Je serais très intéressée par un focus sur les nouvelles technologies émergentes.",
      timestamp: "2024-01-15T16:45:00",
      reactions: ["🚀", "💯"],
    },
    {
      id: 10,
      user: {
        fullName: "Thomas Dubois",
        profilePicture:
          "https://ui-avatars.com/api/?name=Thomas+Dubois&background=0D8ABC&color=fff",
      },
      content:
        "Je peux partager mon expérience sur l'implémentation de ces solutions dans mon entreprise si ça intéresse.",
      timestamp: "2024-01-15T17:00:00",
      reactions: ["��", "💼"],
    },
    {
      id: 11,
      user: {
        fullName: "Sarah Cohen",
        profilePicture:
          "https://ui-avatars.com/api/?name=Sarah+Cohen&background=8B5CF6&color=fff",
      },
      content:
        "Absolument ! Un retour d'expérience concret serait très enrichissant. Quels ont été les principaux défis ?",
      timestamp: "2024-01-15T17:15:00",
      reactions: ["🤔", "📝"],
    },
    {
      id: 12,
      user: {
        fullName: "Lucas Martin",
        profilePicture:
          "https://ui-avatars.com/api/?name=Lucas+Martin&background=4CAF50&color=fff",
      },
      content:
        "La gestion du changement a été notre plus grand défi. La formation des équipes est cruciale.",
      timestamp: "2024-01-15T17:30:00",
      reactions: ["👨‍💼", "📚"],
    },
    {
      id: 13,
      user: {
        fullName: "Marie Leroy",
        profilePicture:
          "https://ui-avatars.com/api/?name=Marie+Leroy&background=FF6B6B&color=fff",
      },
      content:
        "Nous avons eu la même expérience. La résistance au changement est souvent sous-estimée dans les projets de transformation.",
      timestamp: "2024-01-15T17:45:00",
      reactions: ["��", "🎯"],
    },
    {
      id: 14,
      user: {
        fullName: "Pierre Dumont",
        profilePicture:
          "https://ui-avatars.com/api/?name=Pierre+Dumont&background=F59E0B&color=fff",
      },
      content:
        "Quelqu'un a-t-il des ressources sur les meilleures pratiques en matière de conduite du changement ?",
      timestamp: "2024-01-15T18:00:00",
      reactions: ["📚"],
    },
    {
      id: 15,
      user: {
        fullName: "Julie Mercier",
        profilePicture:
          "https://ui-avatars.com/api/?name=Julie+Mercier&background=10B981&color=fff",
      },
      content:
        "Je peux recommander quelques lectures et formations qui nous ont beaucoup aidés dans notre transition.",
      timestamp: "2024-01-15T18:15:00",
      reactions: ["🙏", "📖"],
    },
    {
      id: 16,
      user: {
        fullName: "Antoine Moreau",
        profilePicture:
          "https://ui-avatars.com/api/?name=Antoine+Moreau&background=E91E63&color=fff",
      },
      content:
        "Super discussion ! On devrait vraiment organiser ce webinaire. Je propose qu'on crée un sondage pour la date.",
      timestamp: "2024-01-15T18:30:00",
      reactions: ["��", "👍"],
    },
  ]);

  const [questions, setQuestions] = useState<QAItem[]>([]);
  const [showNewQuestionInput, setShowNewQuestionInput] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [showNewAnswerInput, setShowNewAnswerInput] = useState<number | null>(
    null
  );
  const [newAnswerText, setNewAnswerText] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(
          `/api/communities/${params.id}/posts/${params.postId}`
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

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(
          `/api/communities/${params.id}/qa?postId=${params.postId}`
        );
        if (!response.ok)
          throw new Error("Erreur lors de la récupération des questions");
        const data = await response.json();
        setQuestions(data);
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Erreur lors de la récupération des questions");
      }
    };

    if (params.id && params.postId) {
      fetchQuestions();
    }
  }, [params.id, params.postId]);

  const handleCreateQuestion = async () => {
    try {
      const response = await fetch(`/api/communities/${params.id}/qa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: newQuestionText,
          postId: params.postId,
        }),
      });

      if (!response.ok)
        throw new Error("Erreur lors de la création de la question");
      const newQuestion = await response.json();

      setQuestions((prev) => [newQuestion, ...prev]);
      setNewQuestionText("");
      setShowNewQuestionInput(false);
      toast.success("Question créée avec succès");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la création de la question");
    }
  };

  const handleCreateAnswer = async (questionId: number) => {
    try {
      const response = await fetch(
        `/api/communities/${params.id}/qa/${questionId}/answers`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: newAnswerText }),
        }
      );

      if (!response.ok)
        throw new Error("Erreur lors de la création de la réponse");

      const questionsResponse = await fetch(
        `/api/communities/${params.id}/qa?postId=${params.postId}`
      );
      const updatedQuestions = await questionsResponse.json();
      setQuestions(updatedQuestions);

      setNewAnswerText("");
      setShowNewAnswerInput(null);
      toast.success("Réponse ajoutée avec succès");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la création de la réponse");
    }
  };

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
          <aside className="w-full lg:w-[320px] order-1 lg:order-2 sticky top-4">
            <Card className="overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
                  Discussion
                </h2>
              </div>

              <div className="h-[600px]">
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
