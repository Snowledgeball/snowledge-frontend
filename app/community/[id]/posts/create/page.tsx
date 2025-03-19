"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import PostEditor, { PostData } from "@/components/community/PostEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DraftFeedbacks from "@/components/community/DraftFeedbacks";
import { ThumbsDown } from "lucide-react";



export default function CreatePost() {
  const { isLoading, isAuthenticated, LoadingComponent } = useAuthGuard();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [drafts, setDrafts] = useState<PostData[]>([]);
  const [activeTab, setActiveTab] = useState("new");
  const [selectedDraft, setSelectedDraft] = useState<PostData | null>(null);
  const [postData, setPostData] = useState<PostData | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      checkContributorStatus();
      fetchDrafts();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const draftId = searchParams.get("draft_id");

    if (draftId && drafts.length > 0) {
      const draftToEdit = drafts.find(draft => draft.id === parseInt(draftId));

      if (draftToEdit) {
        setSelectedDraft(draftToEdit);
        setActiveTab("edit");
      }
    }
  }, [searchParams, drafts]);

  useEffect(() => {
    // Récupérer les données du post original
    const originalTitle = searchParams.get('title');
    const originalContent = searchParams.get('content');
    const originalCoverImage = searchParams.get('coverImageUrl');
    const originalTag = searchParams.get('tag');

    if (originalTitle && originalContent) {
      // Pré-remplir le formulaire
      const postData: PostData = {
        title: originalTitle,
        content: originalContent,
        cover_image_url: originalCoverImage || '',
        tag: originalTag || '',
      };

      setPostData(postData);

    }
  }, [searchParams]);

  const checkContributorStatus = async () => {
    try {
      const response = await fetch(
        `/api/communities/${params.id}/membership`
      );
      const data = await response.json();

      if (!data.isContributor) {
        toast.error("Vous devez être contributeur pour créer un post");
        router.push(`/community/${params.id}`);
      }
    } catch (error) {
      console.error("Erreur:", error);
      router.push(`/community/${params.id}`);
    }
  };

  const fetchDrafts = async () => {
    try {
      const response = await fetch(`/api/communities/${params.id}/posts/drafts`);
      if (response.ok) {
        const data = await response.json();
        setDrafts(data);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des brouillons:", error);
    }
  };

  const handleSubmitPost = async (postData: PostData) => {
    try {
      const response = await fetch(
        `/api/communities/${params.id}/posts/pending`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(postData),
        }
      );

      if (!response.ok) throw new Error("Erreur lors de la création");

      toast.success("Post soumis pour révision");

      if (selectedDraft?.id) {
        await fetch(`/api/communities/${params.id}/posts/drafts/${selectedDraft.id}`, {
          method: "DELETE",
        });
      }

      router.push(`/community/${params.id}`);
    } catch (error) {
      toast.error("Erreur lors de la création du post");
    }
  };

  const handleSaveDraft = async (postData: PostData) => {
    try {
      const method = selectedDraft?.id ? "PUT" : "POST";
      const url = selectedDraft?.id
        ? `/api/communities/${params.id}/posts/drafts/${selectedDraft.id}`
        : `/api/communities/${params.id}/posts/drafts`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) throw new Error("Erreur lors de la sauvegarde");

      toast.success("Brouillon sauvegardé");
      fetchDrafts();

      if (!selectedDraft?.id) {
        const data = await response.json();
        setSelectedDraft({ ...postData, id: data.id });
      }
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde du brouillon");
    }
  };

  const handleDeleteDraft = async (draftId: number) => {
    try {
      const response = await fetch(
        `/api/communities/${params.id}/posts/drafts/${draftId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Erreur lors de la suppression");

      toast.success("Brouillon supprimé");
      fetchDrafts();

      if (selectedDraft?.id === draftId) {
        setSelectedDraft(null);
        setActiveTab("new");
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression du brouillon");
    }
  };

  const handleEditDraft = (draft: PostData) => {
    setSelectedDraft(draft);
    setActiveTab("edit");
  };

  if (isLoading) return <LoadingComponent />;
  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[85rem] mx-auto px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="new" onClick={() => router.push(`/community/${params.id}/posts/create`)}>Nouveau post</TabsTrigger>
            <TabsTrigger value="drafts">
              Brouillons ({drafts.length})
            </TabsTrigger>
            {selectedDraft && (
              <TabsTrigger value="edit">
                Modifier le brouillon
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="new">
            <PostEditor
              initialData={postData ? postData : undefined}
              communityId={params.id as string}
              onSubmit={handleSubmitPost}
              onSaveDraft={handleSaveDraft}
              submitButtonText="Soumettre pour révision"
            />
          </TabsContent>

          <TabsContent value="drafts">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Mes brouillons</h2>
              {drafts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Vous n'avez pas de brouillons enregistrés
                </p>
              ) : (
                <div className="space-y-6">
                  {drafts.map((draft) => (
                    <div
                      key={draft.id}
                      className="border border-gray-200 rounded-lg p-4 bg-white"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{draft.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Dernière modification: {new Date(draft.updated_at || draft.created_at || '').toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditDraft(draft)}
                          >
                            Modifier
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteDraft(draft.id!)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            Supprimer
                          </Button>
                        </div>
                      </div>

                      {draft.was_rejected && (
                        <DraftFeedbacks
                          communityId={params.id as string}
                          postId={draft.id!}
                          variant="inline"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="edit">
            {selectedDraft && (
              <div className="flex gap-6">
                <div className="flex-1">
                  <PostEditor
                    communityId={params.id as string}
                    initialData={selectedDraft}
                    onSubmit={handleSubmitPost}
                    onSaveDraft={(data) => handleSaveDraft(data)}
                    submitButtonText="Soumettre pour révision"
                  />
                </div>

                {selectedDraft.was_rejected && searchParams.get("draft_id") && (
                  <div className="w-80">
                    <div className="sticky top-6">
                      <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                        <h3 className="text-lg font-medium mb-2">Feedbacks reçus</h3>
                        <p className="text-sm text-gray-600 mb-3">
                          Consultez ces feedbacks pour améliorer votre post et augmenter vos chances d'approbation.
                        </p>
                      </div>

                      <DraftFeedbacks
                        communityId={params.id as string}
                        postId={selectedDraft.id!}
                        expanded={true}
                        variant="sidebar"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
