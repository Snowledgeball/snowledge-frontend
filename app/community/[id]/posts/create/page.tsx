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
import { useTranslation } from "react-i18next";

export default function CreatePost() {
  const { isLoading, isAuthenticated, LoadingComponent } = useAuthGuard();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [drafts, setDrafts] = useState<PostData[]>([]);
  const [activeTab, setActiveTab] = useState("new");
  const [selectedDraft, setSelectedDraft] = useState<PostData | null>(null);
  const [postData, setPostData] = useState<PostData | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (isAuthenticated) {
      checkContributorStatus();
      fetchDrafts();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const draftId = searchParams.get("draft_id");

    if (draftId && drafts.length > 0) {
      const draftToEdit = drafts.find(
        (draft) => draft.id === parseInt(draftId)
      );

      if (draftToEdit) {
        setSelectedDraft(draftToEdit);
        setActiveTab("edit");
      }
    }
  }, [searchParams, drafts]);

  useEffect(() => {
    // Récupérer les données du post original
    const originalTitle = searchParams.get("title");
    const originalContent = searchParams.get("content");
    const originalCoverImage = searchParams.get("coverImageUrl");
    const originalTag = searchParams.get("tag");

    if (originalTitle && originalContent) {
      // Pré-remplir le formulaire
      const postData: PostData = {
        title: originalTitle,
        content: originalContent,
        cover_image_url: originalCoverImage || "",
        tag: originalTag || "",
      };

      console.log(postData);

      setPostData(postData);
    }
  }, [searchParams]);

  const checkContributorStatus = async () => {
    try {
      const response = await fetch(`/api/communities/${params.id}/membership`);
      const data = await response.json();

      if (!data.isContributor) {
        toast.error(t("community_posts.contributor_required"));
        router.push(`/community/${params.id}`);
      }
    } catch (error) {
      console.error(t("community_posts.error"), error);
      router.push(`/community/${params.id}`);
    }
  };

  const fetchDrafts = async () => {
    try {
      const response = await fetch(
        `/api/communities/${params.id}/posts/drafts`
      );
      if (response.ok) {
        const data = await response.json();
        setDrafts(data);
      }
    } catch (error) {
      console.error(t("community_posts.error_drafts"), error);
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

      if (!response.ok) throw new Error(t("community_posts.error_create"));

      toast.success(t("community_posts.post_submitted"));

      if (selectedDraft?.id) {
        await fetch(
          `/api/communities/${params.id}/posts/drafts/${selectedDraft.id}`,
          {
            method: "DELETE",
          }
        );
      }

      router.push(`/community/${params.id}`);
    } catch (error) {
      toast.error(t("community_posts.error_create_post"));
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

      if (!response.ok) throw new Error(t("community_posts.error_save"));

      toast.success(t("community_posts.draft_saved"));
      fetchDrafts();

      if (!selectedDraft?.id) {
        const data = await response.json();
        setSelectedDraft({ ...postData, id: data.id });
      }
    } catch (error) {
      toast.error(t("community_posts.error_save_draft"));
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

      if (!response.ok) throw new Error(t("community_posts.error_delete"));

      toast.success(t("community_posts.draft_deleted"));
      fetchDrafts();

      if (selectedDraft?.id === draftId) {
        setSelectedDraft(null);
        setActiveTab("new");
      }
    } catch (error) {
      toast.error(t("community_posts.error_delete_draft"));
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
            <TabsTrigger
              value="new"
              onClick={() =>
                router.push(`/community/${params.id}/posts/create`)
              }
            >
              {t("community_posts.new_post")}
            </TabsTrigger>
            <TabsTrigger value="drafts">
              {t("community_posts.drafts")} ({drafts.length})
            </TabsTrigger>
            {selectedDraft && (
              <TabsTrigger value="edit">
                {t("community_posts.edit_draft")}
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="new">
            <PostEditor
              initialData={postData ? postData : undefined}
              communityId={params.id as string}
              onSubmit={handleSubmitPost}
              onSaveDraft={handleSaveDraft}
              submitButtonText={t("actions.submit")}
            />
          </TabsContent>

          <TabsContent value="drafts">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {t("community_posts.my_drafts")}
              </h2>
              {drafts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  {t("community_posts.no_drafts")}
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
                          <h3 className="font-semibold text-lg">
                            {draft.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {t("community_posts.last_modified")}:{" "}
                            {new Date(
                              draft.updated_at || draft.created_at || ""
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditDraft(draft)}
                          >
                            {t("actions.edit")}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteDraft(draft.id!)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            {t("actions.delete")}
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
                    submitButtonText={t("actions.submit")}
                  />
                </div>

                {selectedDraft.was_rejected && searchParams.get("draft_id") && (
                  <div className="w-80">
                    <div className="sticky top-6">
                      <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                        <h3 className="text-lg font-medium mb-2">
                          {t("community_posts.feedbacks_received")}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {t("community_posts.feedback_description")}
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
