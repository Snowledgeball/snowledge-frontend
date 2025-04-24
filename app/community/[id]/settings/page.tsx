"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Upload,
  ArrowLeft,
  Youtube,
  Globe,
  Shield,
  Loader,
} from "lucide-react";
import { defaultCode, defaultDisclaimers } from "@/utils/defaultPres";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import Image from "next/image";
import { useTranslation } from "react-i18next";

interface CommunitySettings {
  id: number;
  name: string;
  description: string;
  image_url: string | null;
  presentation?: {
    video_url: string | null;
    topic_details: string;
    code_of_conduct: string;
    disclaimers: string;
  };
}

export default function CommunitySettings() {
  const { t } = useTranslation();
  const params = useParams();
  const communityId = params.id;
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<CommunitySettings | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const router = useRouter();
  const { isLoading, isAuthenticated, LoadingComponent } = useAuthGuard();

  const [userId, setUserId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Initialiser userId depuis la session, uniquement quand elle change réellement
  useEffect(() => {
    if (session?.user?.id) {
      setUserId(session.user.id);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`/api/communities/${communityId}`);
        if (response.ok && userId) {
          const data = await response.json();
          if (data.creator_id !== parseInt(userId)) {
            toast.error(t("settings.no_permissions"));
            console.error(data.creator_id, userId);
            router.push(`/`);
            return;
          }
        }
      } catch (error) {
        console.error(t("settings.error_fetching_data"), error);
      }
    };

    if (userId) {
      fetchDashboardData();
    }
  }, [userId, communityId, router, t]);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!session?.user) return;

      try {
        const response = await fetch(
          `/api/communities/${communityId}/settings`
        );
        if (response.ok) {
          const data = await response.json();

          // Ne réinitialiser les données que lors du chargement initial (quand settings est null)
          if (!settings) {
            setSettings(data);
            if (data.image_url) {
              setPreviewImage("https://" + data.image_url);
            }
          }
        }
      } catch (error) {
        console.error(t("settings.error_loading_settings"), error);
        toast.error(t("settings.error_loading_settings_toast"));
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityId]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];
    setImageFile(file);

    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);
  };

  useEffect(() => {
    return () => {
      if (previewImage && previewImage !== settings?.image_url) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage, settings?.image_url]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    // Vérification des champs obligatoires
    if (!settings.presentation?.topic_details?.trim()) {
      toast.error(t("settings.topic_details_required"));
      return;
    }

    if (!settings.presentation?.code_of_conduct?.trim()) {
      toast.error(t("settings.code_of_conduct_required"));
      return;
    }

    if (!settings.presentation?.disclaimers?.trim()) {
      toast.error(t("settings.disclaimers_required"));
      return;
    }

    // Activer l'indicateur de chargement
    setIsSaving(true);

    try {
      let finalImageUrl = settings.image_url;

      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append("file", imageFile);
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: imageFormData,
        });

        if (uploadResponse.ok) {
          const data = await uploadResponse.json();
          finalImageUrl = data.url;
        } else {
          throw new Error(t("settings.error_uploading_image"));
        }
      }

      const response = await fetch(`/api/communities/${communityId}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...settings,
          image_url: finalImageUrl,
        }),
      });

      if (response.ok) {
        toast.success(t("settings.changes_saved"));
        router.push(`/community/${communityId}/dashboard`);
      } else {
        throw new Error(t("settings.error_updating"));
      }
    } catch (error) {
      console.error(t("settings.error_updating_log"), error);
      toast.error(t("settings.error_updating_settings"));
    } finally {
      // Désactiver l'indicateur de chargement, que la requête réussisse ou échoue
      setIsSaving(false);
    }
  };

  const generateDefaultCodeOfConduct = () => {
    setSettings({
      ...settings!,
      presentation: {
        ...settings!.presentation!,
        code_of_conduct: defaultCode,
      },
    });
    toast.success(t("settings.code_of_conduct_generated"));
  };

  const generateDefaultDisclaimers = () => {
    setSettings({
      ...settings!,
      presentation: {
        ...settings!.presentation!,
        disclaimers: defaultDisclaimers,
      },
    });
    toast.success(t("settings.disclaimers_generated"));
  };

  if (loading) return <LoadingComponent />;
  if (!settings) return <div>{t("settings.error_loading_settings")}</div>;

  if (isLoading) {
    return <LoadingComponent />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t("actions.back")}
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("settings.community_settings")}
          </h1>
        </div>

        <Card className="divide-y divide-gray-200">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-lg bg-blue-50">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {t("settings.general_info")}
                </h2>
                <p className="text-sm text-gray-500">
                  {t("settings.configure_basic_info")}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("settings.community_image")}
                </label>
                <div
                  onClick={() =>
                    document.getElementById("community-image")?.click()
                  }
                  className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-blue-500 transition-colors"
                >
                  {previewImage ? (
                    <div className="relative">
                      <Image
                        src={previewImage}
                        alt={t("settings.preview")}
                        className="max-h-48 mx-auto rounded-lg"
                        width={192}
                        height={192}
                      />
                      <p className="text-sm text-gray-500 text-center mt-2">
                        {t("settings.click_to_edit_image")}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        {t("settings.click_or_drag_image")}
                      </p>
                    </div>
                  )}
                  <input
                    id="community-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("settings.community_name")}
                </label>
                <Input
                  type="text"
                  name="name"
                  value={settings.name}
                  onChange={(e) =>
                    setSettings({ ...settings, name: e.target.value })
                  }
                  className="w-full cursor-text"
                  placeholder={t("settings.name_placeholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("settings.description")}
                </label>
                <Textarea
                  name="description"
                  value={settings.description}
                  onChange={(e) =>
                    setSettings({ ...settings, description: e.target.value })
                  }
                  className="w-full min-h-[120px] cursor-text"
                  placeholder={t("settings.description_placeholder")}
                />
              </div>
            </div>
          </div>

          <div id="presentation" className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-lg bg-red-50">
                <Youtube className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {t("settings.community_presentation")}
                </h2>
                <p className="text-sm text-gray-500">
                  {t("settings.presentation_info")}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("settings.youtube_url")}
                  </label>
                  <span className="text-xs text-gray-500">
                    {t("settings.recommended")}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  {t("settings.video_help")}
                </p>
                <Input
                  type="text"
                  name="youtubeUrl"
                  value={settings.presentation?.video_url || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      presentation: {
                        ...settings.presentation!,
                        video_url: e.target.value,
                      },
                    })
                  }
                  className="w-full cursor-text"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-lg bg-purple-50">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {t("settings.important_info")}
                </h2>
                <p className="text-sm text-gray-500">
                  {t("settings.important_info_description")}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("settings.topic_details")}
                  </label>
                  <span className="text-xs text-gray-500">
                    {t("settings.required")}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  {t("settings.topic_details_description")}
                </p>
                <Textarea
                  value={settings.presentation?.topic_details || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      presentation: {
                        ...settings.presentation!,
                        topic_details: e.target.value,
                      },
                    })
                  }
                  className="w-full min-h-[120px] cursor-text"
                  placeholder={t("settings.topic_details_placeholder")}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t("settings.code_of_conduct")}
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {t("settings.required")}
                    </span>
                    <button
                      onClick={generateDefaultCodeOfConduct}
                      className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      {t("settings.generate_template")}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  {t("settings.code_of_conduct_description")}
                </p>
                <Textarea
                  value={settings.presentation?.code_of_conduct || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      presentation: {
                        ...settings.presentation!,
                        code_of_conduct: e.target.value,
                      },
                    })
                  }
                  className="w-full min-h-[200px] cursor-text"
                  placeholder={t("settings.code_of_conduct_placeholder")}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t("settings.disclaimers")}
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {t("settings.required")}
                    </span>
                    <button
                      onClick={generateDefaultDisclaimers}
                      className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      {t("settings.generate_template")}
                    </button>
                  </div>
                </div>
                <Textarea
                  value={settings.presentation?.disclaimers || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      presentation: {
                        ...settings.presentation!,
                        disclaimers: e.target.value,
                      },
                    })
                  }
                  className="w-full min-h-[200px] cursor-text"
                  placeholder={t("settings.disclaimers_placeholder")}
                />
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={() => router.back()}
            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {t("actions.cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[200px]"
          >
            {isSaving ? (
              <>
                <Loader size="sm" className="w-4 h-4 mr-2 animate-spin" />
                <span>{t("settings.saving")}</span>
              </>
            ) : (
              t("settings.save_changes")
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
