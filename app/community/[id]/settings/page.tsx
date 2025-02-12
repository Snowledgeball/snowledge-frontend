"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Upload, ArrowLeft, Youtube, Globe, Shield } from "lucide-react";
import { defaultCode, defaultDisclaimers } from "@/utils/defaultPres";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import Image from "next/image";

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

    useEffect(() => {
        const userId = session?.user?.id;
        if (userId) {
            setUserId(userId);
        }
    }, [session]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await fetch(`/api/communities/${communityId}`);
                if (response.ok && userId) {
                    const data = await response.json();
                    if (data.creator_id !== parseInt(userId)) {
                        toast.error("Vous n'avez pas les permissions pour accéder à cette page");
                        console.log(data.creator_id, userId);
                        router.push(`/`);
                        return;
                    }
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des données:', error);
            }
        };

        fetchDashboardData();
    }, [userId, communityId, router]);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch(`/api/communities/${communityId}/settings`);
                if (response.ok) {
                    const data = await response.json();
                    setSettings(data);
                    if (data.image_url) {
                        setPreviewImage('https://' + data.image_url);
                    }
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des paramètres:', error);
                toast.error("Erreur lors du chargement des paramètres");
            } finally {
                setLoading(false);
            }
        };

        if (session?.user) {
            fetchSettings();
        }
    }, [communityId, session]);

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
            toast.error("Les détails du sujet sont obligatoires");
            return;
        }

        if (!settings.presentation?.code_of_conduct?.trim()) {
            toast.error("Le code de conduite est obligatoire");
            return;
        }

        if (!settings.presentation?.disclaimers?.trim()) {
            toast.error("Les avertissements sont obligatoires");
            return;
        }

        try {
            let finalImageUrl = settings.image_url;

            if (imageFile) {
                const imageFormData = new FormData();
                imageFormData.append('file', imageFile);
                const uploadResponse = await fetch('/api/upload', {
                    method: 'POST',
                    body: imageFormData,
                });

                if (uploadResponse.ok) {
                    const data = await uploadResponse.json();
                    finalImageUrl = data.url;
                } else {
                    throw new Error('Erreur lors du téléchargement de l\'image');
                }
            }

            const response = await fetch(`/api/communities/${communityId}/settings`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...settings,
                    image_url: finalImageUrl,
                }),
            });

            if (response.ok) {
                router.push(`/community/${communityId}/dashboard`);
            } else {
                throw new Error("Erreur lors de la mise à jour");
            }

        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
            toast.error("Erreur lors de la mise à jour des paramètres");
        }
    };

    const generateDefaultCodeOfConduct = () => {
        setSettings({
            ...settings!,
            presentation: {
                ...settings!.presentation!,
                code_of_conduct: defaultCode
            }
        });
        toast.success("Code de conduite généré");
    };

    const generateDefaultDisclaimers = () => {
        setSettings({
            ...settings!,
            presentation: {
                ...settings!.presentation!,
                disclaimers: defaultDisclaimers
            }
        });
        toast.success("Avertissements générés");
    };

    if (loading) return <div>Chargement...</div>;
    if (!settings) return <div>Erreur lors du chargement des paramètres</div>;

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
                        Retour
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Paramètres de la communauté</h1>
                </div>

                <Card className="divide-y divide-gray-200">
                    <div className="p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 rounded-lg bg-blue-50">
                                <Globe className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Informations générales</h2>
                                <p className="text-sm text-gray-500">Configurez les informations de base de votre communauté</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Image de la communauté
                                </label>
                                <div
                                    onClick={() => document.getElementById('community-image')?.click()}
                                    className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-blue-500 transition-colors"
                                >
                                    {previewImage ? (
                                        <div className="relative">
                                            <Image
                                                src={previewImage}
                                                alt="Aperçu"
                                                className="max-h-48 mx-auto rounded-lg"
                                                width={192}
                                                height={192}
                                            />
                                            <p className="text-sm text-gray-500 text-center mt-2">
                                                Cliquez pour modifier l&apos;image
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500">
                                                Cliquez ou glissez une image ici
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
                                    Nom de la communauté
                                </label>
                                <Input
                                    type="text"
                                    name="name"
                                    value={settings.name}
                                    onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                                    className="w-full cursor-text"
                                    placeholder="Ex: CryptoMasters France"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <Textarea
                                    name="description"
                                    value={settings.description}
                                    onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                                    className="w-full min-h-[120px] cursor-text"
                                    placeholder="Décrivez votre communauté en quelques mots..."
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
                                <h2 className="text-lg font-semibold text-gray-900">Présentation de la communauté</h2>
                                <p className="text-sm text-gray-500">Ces informations seront présentées aux utilisateurs avant qu'ils ne rejoignent votre communauté</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-center">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        URL de la vidéo YouTube
                                    </label>
                                    <span className="text-xs text-gray-500">Recommandé</span>
                                </div>
                                <p className="text-xs text-gray-500 mb-2">Une vidéo de présentation aide les nouveaux membres à mieux comprendre votre communauté</p>
                                <Input
                                    type="text"
                                    name="youtubeUrl"
                                    value={settings.presentation?.video_url || ''}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        presentation: {
                                            ...settings.presentation!,
                                            video_url: e.target.value
                                        }
                                    })}
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
                                <h2 className="text-lg font-semibold text-gray-900">Informations importantes</h2>
                                <p className="text-sm text-gray-500">Ces détails sont essentiels pour établir la confiance avec vos futurs membres</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-center">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Détails du sujet
                                    </label>
                                    <span className="text-xs text-gray-500">Obligatoire</span>
                                </div>
                                <p className="text-xs text-gray-500 mb-2">Expliquez en détail le sujet principal de votre communauté et ce que les membres peuvent en attendre</p>
                                <Textarea
                                    value={settings.presentation?.topic_details || ''}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        presentation: {
                                            ...settings.presentation!,
                                            topic_details: e.target.value
                                        }
                                    })}
                                    className="w-full min-h-[120px] cursor-text"
                                    placeholder="Ex: Notre communauté se concentre sur..."
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Code de conduite
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">Obligatoire</span>
                                        <button
                                            onClick={generateDefaultCodeOfConduct}
                                            className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
                                        >
                                            Générer un modèle
                                        </button>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mb-2">Définissez les règles et comportements attendus au sein de votre communauté</p>
                                <Textarea
                                    value={settings.presentation?.code_of_conduct || ''}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        presentation: {
                                            ...settings.presentation!,
                                            code_of_conduct: e.target.value
                                        }
                                    })}
                                    className="w-full min-h-[200px] cursor-text"
                                    placeholder="Code de conduite..."
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Avertissements
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">Obligatoire</span>
                                        <button
                                            onClick={generateDefaultDisclaimers}
                                            className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
                                        >
                                            Générer un modèle
                                        </button>
                                    </div>
                                </div>
                                <Textarea
                                    value={settings.presentation?.disclaimers || ''}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        presentation: {
                                            ...settings.presentation!,
                                            disclaimers: e.target.value
                                        }
                                    })}
                                    className="w-full min-h-[200px] cursor-text"
                                    placeholder="Avertissements..."
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
                        Annuler
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                        Enregistrer les modifications
                    </button>
                </div>
            </div>
        </div>
    );
} 