"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Disclosure } from "@/components/ui/disclosure";
import {
  HelpCircle,
  PlusCircle,
  Edit,
  Trash2,
  MessageCircle,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

// Cache pour stocker les questions et réponses
const questionsCache = new Map<string, { data: any[]; timestamp: number }>();

// Durée de validité du cache (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

interface QAProps {
  communityId: string;
  postId?: string;
  isContributor: boolean;
  isCreator: boolean;
  userId: string;
}

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

export default function QASection({
  communityId,
  postId,
  isContributor,
  isCreator,
  userId,
}: QAProps) {
  const [questions, setQuestions] = useState<QAItem[]>([]);
  const [showNewQuestionInput, setShowNewQuestionInput] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [showNewAnswerInput, setShowNewAnswerInput] = useState<number | null>(
    null
  );
  const [newAnswerText, setNewAnswerText] = useState("");
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(
    null
  );
  const [editingAnswerId, setEditingAnswerId] = useState<number | null>(null);
  const [deleteQuestionDialog, setDeleteQuestionDialog] = useState<{
    isOpen: boolean;
    questionId: number | null;
  }>({
    isOpen: false,
    questionId: null,
  });
  const [deleteAnswerDialog, setDeleteAnswerDialog] = useState<{
    isOpen: boolean;
    questionId: number | null;
    answerId: number | null;
  }>({
    isOpen: false,
    questionId: null,
    answerId: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Mémoriser l'ID de la communauté et du post pour éviter les re-rendus inutiles
  const memoizedCommunityId = useMemo(() => communityId, [communityId]);
  const memoizedPostId = useMemo(() => postId, [postId]);

  // Générer une clé de cache unique pour cette combinaison communauté/post
  const getCacheKey = useCallback(() => {
    return `qa-${memoizedCommunityId}${
      memoizedPostId ? `-${memoizedPostId}` : ""
    }`;
  }, [memoizedCommunityId, memoizedPostId]);

  // Fonction optimisée pour récupérer les questions
  const fetchQuestions = useCallback(
    async (forceRefresh = false) => {
      setIsLoading(true);
      try {
        const cacheKey = getCacheKey();
        const now = Date.now();

        // Vérifier si les données sont dans le cache et si elles sont encore valides
        if (!forceRefresh && questionsCache.has(cacheKey)) {
          const cachedData = questionsCache.get(cacheKey)!;
          if (now - cachedData.timestamp < CACHE_DURATION) {
            setQuestions(cachedData.data);
            setIsLoading(false);
            return;
          }
        }

        const url = memoizedPostId
          ? `/api/communities/${memoizedCommunityId}/qa?postId=${memoizedPostId}`
          : `/api/communities/${memoizedCommunityId}/qa`;

        const response = await fetch(url, {
          headers: {
            "Cache-Control": "max-age=120", // Cache de 2 minutes
          },
        });

        if (!response.ok)
          throw new Error("Erreur lors de la récupération des questions");

        const data = await response.json();

        // Mettre en cache les données avec un timestamp
        questionsCache.set(cacheKey, {
          data,
          timestamp: now,
        });

        setQuestions(data);
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Erreur lors de la récupération des questions");
      } finally {
        setIsLoading(false);
      }
    },
    [memoizedCommunityId, memoizedPostId, getCacheKey]
  );

  // Charger les questions au montage du composant
  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Fonction optimisée pour créer une question
  const handleCreateQuestion = useCallback(async () => {
    if (!newQuestionText.trim()) {
      toast.error("Veuillez entrer une question");
      return;
    }

    try {
      const response = await fetch(
        `/api/communities/${memoizedCommunityId}/qa`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: newQuestionText,
            postId: memoizedPostId || null,
          }),
        }
      );

      if (!response.ok)
        throw new Error("Erreur lors de la création de la question");

      // Invalider le cache
      const cacheKey = getCacheKey();
      questionsCache.delete(cacheKey);

      await fetchQuestions(true);
      setNewQuestionText("");
      setShowNewQuestionInput(false);
      toast.success("Question créée avec succès");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la création de la question");
    }
  }, [
    newQuestionText,
    memoizedCommunityId,
    memoizedPostId,
    fetchQuestions,
    getCacheKey,
  ]);

  // Fonction optimisée pour créer une réponse
  const handleCreateAnswer = useCallback(
    async (questionId: number) => {
      if (!newAnswerText.trim()) {
        toast.error("Veuillez entrer une réponse");
        return;
      }

      try {
        const response = await fetch(
          `/api/communities/${memoizedCommunityId}/qa/${questionId}/answers`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: newAnswerText }),
          }
        );

        if (!response.ok)
          throw new Error("Erreur lors de la création de la réponse");

        // Invalider le cache
        const cacheKey = getCacheKey();
        questionsCache.delete(cacheKey);

        await fetchQuestions(true);
        setNewAnswerText("");
        setShowNewAnswerInput(null);
        toast.success("Réponse ajoutée avec succès");
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Erreur lors de la création de la réponse");
      }
    },
    [newAnswerText, memoizedCommunityId, fetchQuestions, getCacheKey]
  );

  // Fonction optimisée pour modifier une question
  const handleEditQuestion = useCallback(
    async (questionId: number, newQuestion: string) => {
      if (!newQuestion.trim()) {
        toast.error("Veuillez entrer une question");
        return;
      }

      try {
        const response = await fetch(
          `/api/communities/${memoizedCommunityId}/qa/${questionId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question: newQuestion }),
          }
        );

        if (!response.ok)
          throw new Error("Erreur lors de la modification de la question");

        // Invalider le cache
        const cacheKey = getCacheKey();
        questionsCache.delete(cacheKey);

        await fetchQuestions(true);
        setEditingQuestionId(null);
        toast.success("Question modifiée avec succès");
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Erreur lors de la modification de la question");
      }
    },
    [memoizedCommunityId, fetchQuestions, getCacheKey]
  );

  // Fonction optimisée pour modifier une réponse
  const handleEditAnswer = useCallback(
    async (questionId: number, answerId: number, newContent: string) => {
      if (!newContent.trim()) {
        toast.error("Veuillez entrer une réponse");
        return;
      }

      try {
        const response = await fetch(
          `/api/communities/${memoizedCommunityId}/qa/${questionId}/answers/${answerId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: newContent }),
          }
        );

        if (!response.ok)
          throw new Error("Erreur lors de la modification de la réponse");

        // Invalider le cache
        const cacheKey = getCacheKey();
        questionsCache.delete(cacheKey);

        await fetchQuestions(true);
        setEditingAnswerId(null);
        toast.success("Réponse modifiée avec succès");
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Erreur lors de la modification de la réponse");
      }
    },
    [memoizedCommunityId, fetchQuestions, getCacheKey]
  );

  // Fonction optimisée pour supprimer une question
  const handleDeleteQuestion = useCallback(
    async (questionId: number) => {
      try {
        const response = await fetch(
          `/api/communities/${memoizedCommunityId}/qa/${questionId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok)
          throw new Error("Erreur lors de la suppression de la question");

        // Invalider le cache
        const cacheKey = getCacheKey();
        questionsCache.delete(cacheKey);

        await fetchQuestions(true);
        setDeleteQuestionDialog({ isOpen: false, questionId: null });
        toast.success("Question supprimée avec succès");
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Erreur lors de la suppression de la question");
      }
    },
    [memoizedCommunityId, fetchQuestions, getCacheKey]
  );

  // Fonction optimisée pour supprimer une réponse
  const handleDeleteAnswer = useCallback(
    async (questionId: number, answerId: number) => {
      try {
        const response = await fetch(
          `/api/communities/${memoizedCommunityId}/qa/${questionId}/answers/${answerId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok)
          throw new Error("Erreur lors de la suppression de la réponse");

        // Invalider le cache
        const cacheKey = getCacheKey();
        questionsCache.delete(cacheKey);

        await fetchQuestions(true);
        setDeleteAnswerDialog({
          isOpen: false,
          questionId: null,
          answerId: null,
        });
        toast.success("Réponse supprimée avec succès");
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Erreur lors de la suppression de la réponse");
      }
    },
    [memoizedCommunityId, fetchQuestions, getCacheKey]
  );

  // Fonction optimisée pour marquer une réponse comme acceptée
  const handleAcceptAnswer = useCallback(
    async (questionId: number, answerId: number) => {
      try {
        const response = await fetch(
          `/api/communities/${memoizedCommunityId}/qa/${questionId}/answers/${answerId}/accept`,
          {
            method: "PUT",
          }
        );

        if (!response.ok)
          throw new Error("Erreur lors de l'acceptation de la réponse");

        // Invalider le cache
        const cacheKey = getCacheKey();
        questionsCache.delete(cacheKey);

        await fetchQuestions(true);
        toast.success("Réponse acceptée avec succès");
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Erreur lors de l'acceptation de la réponse");
      }
    },
    [memoizedCommunityId, fetchQuestions, getCacheKey]
  );

  return (
    <Card className="overflow-hidden mb-8">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <HelpCircle className="w-5 h-5 mr-2 text-blue-600" />
            Questions & Réponses
          </h2>
          {!showNewQuestionInput && (
            <button
              onClick={() => setShowNewQuestionInput(true)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Poser une question</span>
            </button>
          )}
        </div>
      </div>

      {showNewQuestionInput && (
        <div className="p-6 bg-gray-50 border-b border-gray-100">
          <textarea
            value={newQuestionText}
            onChange={(e) => setNewQuestionText(e.target.value)}
            placeholder="Posez votre question..."
            className="w-full p-3 border rounded-lg"
            rows={3}
          />
          <div className="flex justify-end space-x-3 mt-3">
            <button
              onClick={() => setShowNewQuestionInput(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Annuler
            </button>
            <button
              onClick={handleCreateQuestion}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              disabled={!newQuestionText.trim()}
            >
              Publier
            </button>
          </div>
        </div>
      )}

      <div className="divide-y divide-gray-100">
        {questions.map((item) => (
          <Disclosure key={item.id}>
            {({ open }: { open: boolean }) => (
              <div className="border-b border-gray-100 last:border-0">
                <Disclosure.Button className="w-full px-6 py-4 flex items-start justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    <Image
                      src={item.author.profilePicture}
                      alt={item.author.fullName}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div>
                      {editingQuestionId === item.id ? (
                        <div
                          className="space-y-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <textarea
                            value={newQuestionText}
                            onChange={(e) => setNewQuestionText(e.target.value)}
                            rows={3}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                            placeholder="Modifiez votre question..."
                          />
                          <div className="flex justify-end space-x-2">
                            <span
                              onClick={() => setEditingQuestionId(null)}
                              className="px-3 py-1 text-gray-600 hover:text-gray-800 text-sm cursor-pointer"
                            >
                              Annuler
                            </span>
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditQuestion(item.id, newQuestionText);
                              }}
                              className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm cursor-pointer"
                            >
                              Enregistrer
                            </span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h3 className="font-medium text-gray-900 text-left">
                            {item.question}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatDistanceToNow(new Date(item.created_at), {
                              addSuffix: true,
                              locale: fr,
                            })}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.author.id === parseInt(userId) &&
                      !editingQuestionId && (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingQuestionId(item.id);
                            setNewQuestionText(item.question);
                          }}
                          className="p-1 hover:bg-gray-200 rounded-full cursor-pointer"
                        >
                          <Edit className="w-4 h-4 text-gray-500" />
                        </span>
                      )}
                    {(item.author.id === parseInt(userId) ||
                      isContributor ||
                      isCreator) && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteQuestionDialog({
                            isOpen: true,
                            questionId: item.id,
                          });
                        }}
                        className="p-1 hover:bg-gray-200 rounded-full cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </span>
                    )}
                    <ChevronDown
                      className={`w-5 h-5 text-gray-500 transition-transform ${
                        open ? "transform rotate-180" : ""
                      }`}
                    />
                  </div>
                </Disclosure.Button>

                <Disclosure.Panel>
                  {item.answers.map((answer) => (
                    <div
                      key={answer.id}
                      className="p-4 bg-white border-t border-gray-100"
                    >
                      <div className="flex items-start space-x-3">
                        <Image
                          src={answer.author.profilePicture}
                          alt={answer.author.fullName}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-900">
                              {answer.author.fullName}
                            </span>
                            <div className="flex items-center space-x-3">
                              {answer.author.id === parseInt(userId) &&
                                !editingAnswerId && (
                                  <button
                                    onClick={() => {
                                      setEditingAnswerId(answer.id);
                                      setNewAnswerText(answer.content);
                                    }}
                                    className="p-1 hover:bg-gray-200 rounded-full"
                                  >
                                    <Edit className="w-4 h-4 text-gray-500" />
                                  </button>
                                )}
                              {(answer.author.id === parseInt(userId) ||
                                isContributor ||
                                isCreator) && (
                                <button
                                  onClick={() =>
                                    setDeleteAnswerDialog({
                                      isOpen: true,
                                      questionId: item.id,
                                      answerId: answer.id,
                                    })
                                  }
                                  className="p-1 hover:bg-gray-200 rounded-full"
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </button>
                              )}
                              <span className="text-sm text-gray-500">
                                {formatDistanceToNow(
                                  new Date(answer.created_at),
                                  {
                                    addSuffix: true,
                                    locale: fr,
                                  }
                                )}
                              </span>
                            </div>
                          </div>
                          {editingAnswerId === answer.id ? (
                            <div className="space-y-3">
                              <textarea
                                value={newAnswerText}
                                onChange={(e) =>
                                  setNewAnswerText(e.target.value)
                                }
                                rows={3}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                placeholder="Modifiez votre réponse..."
                              />
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => setEditingAnswerId(null)}
                                  className="px-3 py-1 text-gray-600 hover:text-gray-800 text-sm"
                                >
                                  Annuler
                                </button>
                                <button
                                  onClick={() =>
                                    handleEditAnswer(
                                      item.id,
                                      answer.id,
                                      newAnswerText
                                    )
                                  }
                                  className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                >
                                  Enregistrer
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-600">{answer.content}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {(isContributor || isCreator) && (
                    <div className="p-4 bg-gray-50 border-t border-gray-100">
                      {showNewAnswerInput === item.id ? (
                        <div className="space-y-3">
                          <textarea
                            value={newAnswerText}
                            onChange={(e) => setNewAnswerText(e.target.value)}
                            rows={3}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white"
                            placeholder="Rédigez votre réponse ici..."
                          />
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => {
                                setShowNewAnswerInput(null);
                                setNewAnswerText("");
                              }}
                              className="px-3 py-1.5 text-gray-600 hover:text-gray-800"
                            >
                              Annuler
                            </button>
                            <button
                              onClick={() => handleCreateAnswer(item.id)}
                              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                              disabled={!newAnswerText.trim()}
                            >
                              Publier
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowNewAnswerInput(item.id)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Répondre à cette question
                        </button>
                      )}
                    </div>
                  )}
                </Disclosure.Panel>
              </div>
            )}
          </Disclosure>
        ))}
      </div>

      <ConfirmationDialog
        isOpen={deleteQuestionDialog.isOpen}
        onClose={() =>
          setDeleteQuestionDialog({ isOpen: false, questionId: null })
        }
        onConfirm={() => {
          if (deleteQuestionDialog.questionId) {
            handleDeleteQuestion(deleteQuestionDialog.questionId);
          }
        }}
        title="Supprimer la question"
        description="Êtes-vous sûr de vouloir supprimer cette question ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="destructive"
      />

      <ConfirmationDialog
        isOpen={deleteAnswerDialog.isOpen}
        onClose={() =>
          setDeleteAnswerDialog({
            isOpen: false,
            questionId: null,
            answerId: null,
          })
        }
        onConfirm={() => {
          if (deleteAnswerDialog.questionId && deleteAnswerDialog.answerId) {
            handleDeleteAnswer(
              deleteAnswerDialog.questionId,
              deleteAnswerDialog.answerId
            );
          }
        }}
        title="Supprimer la réponse"
        description="Êtes-vous sûr de vouloir supprimer cette réponse ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="destructive"
      />
    </Card>
  );
}
