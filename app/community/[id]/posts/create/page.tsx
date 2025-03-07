"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import PostEditor, { PostData } from "@/components/community/PostEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

export default function CreatePost() {
  const { isLoading, isAuthenticated, LoadingComponent } = useAuthGuard();
  const params = useParams();
  const router = useRouter();
  const [drafts, setDrafts] = useState<PostData[]>([]);
  const [activeTab, setActiveTab] = useState("new");
  const [selectedDraft, setSelectedDraft] = useState<PostData | null>(null);

  useEffect(() => {
    // Vérifier que l'utilisateur est contributeur
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

    checkContributorStatus();
    fetchDrafts();
  }, [params.id, router]);

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

      // Si c'était un brouillon, le supprimer
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
        // Si c'est un nouveau brouillon, récupérer son ID
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
      <div className="max-w-7xl mx-auto px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="new">Nouveau post</TabsTrigger>
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
                <div className="space-y-4">
                  {drafts.map((draft) => (
                    <div
                      key={draft.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-lg">
                            {draft.title || "(Sans titre)"}
                          </h3>
                          <p className="text-gray-500 text-sm mt-1">
                            Dernière modification: {new Date(draft.updated_at || "").toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditDraft(draft)}
                            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDeleteDraft(draft.id!)}
                            className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="edit">
            {selectedDraft && (
              <PostEditor
                initialData={selectedDraft}
                communityId={params.id as string}
                onSubmit={handleSubmitPost}
                onSaveDraft={handleSaveDraft}
                submitButtonText="Soumettre pour révision"
                isDraft={true}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
