"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { Fragment } from "react";
import { deployAccountContract, generateStarkNetAddress } from "../../utils/starknetUtils";
import { mintSBT } from "../../utils/mintSBT";
import { Camera, User, Mail, Lock, Upload, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { Loader } from "@/components/ui/loader";

interface SignUpModalProps {
    isOpen: boolean;
    closeModal: () => void;
}

const SignUpForm = ({ closeModal }: { closeModal: () => void }) => {
    const [fullName, setFullName] = useState("");
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [progressSteps, setProgressSteps] = useState([
        { name: "Création du wallet", completed: false, current: true },
        { name: "Approvisionnement du wallet", completed: false, current: false },
        { name: "Déploiement du wallet", completed: false, current: false },
        { name: "Enregistrement des données", completed: false, current: false },
        { name: "Création du SBT", completed: false, current: false },
        { name: "Finalisation", completed: false, current: false }
    ]);
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setProfilePicture(file);

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setPreviewUrl(null);
        }
    };

    // Fonction pour mettre à jour l'étape actuelle
    const updateProgress = (step: number) => {
        setCurrentStep(step);
        setProgressSteps(prevSteps =>
            prevSteps.map((s, index) => ({
                ...s,
                completed: index < step,
                current: index === step
            }))
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        if (!profilePicture) {
            setError("Veuillez sélectionner une photo de profil");
            setIsLoading(false);
            return;
        }

        try {
            // Étape 1: Création du compte (déjà en cours)
            updateProgress(0);

            // Étape 2: Approvisionnement des fonds
            updateProgress(1);
            // Simuler l'approvisionnement des fonds (attente de 1.5 secondes)
            await new Promise(resolve => setTimeout(resolve, 5000));

            // Étape 3: Déploiement du wallet
            updateProgress(2);
            const addressDetails = await generateStarkNetAddress();
            await deployAccountContract(addressDetails.privateKey, addressDetails.publicKey);

            // Étape 4: Enregistrement des données
            updateProgress(3);
            const formData = new FormData();
            formData.append("fullName", fullName);
            formData.append("userName", userName);
            formData.append("email", email);
            formData.append("password", password);
            formData.append("profilePicture", profilePicture);
            formData.append("accountAddress", addressDetails.accountAddress);
            formData.append("publicKey", addressDetails.publicKey);
            formData.append("privateKey", addressDetails.privateKey);

            const response = await fetch("/api/auth/register", {
                method: "POST",
                body: formData,
            });


            if (response.ok) {
                const { profilePictureUrl } = await response.json();
                const formData = new FormData();
                const userData = {
                    image: profilePictureUrl,
                    fullName,
                    userName,
                    email,
                    accountAddress: addressDetails.accountAddress,
                };

                Object.entries(userData).forEach(([key, value]) => {
                    formData.append(key, value);
                });

                const responseUpload = await fetch("/api/auth/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!responseUpload.ok) {
                    console.error("Error uploading file");
                }


                const dataUploaded = await responseUpload.json();

                // Étape 5: Création du SBT
                updateProgress(4);
                // Wait for 1 second before minting the SBT
                await new Promise(resolve => setTimeout(resolve, 1000));
                await mintSBT(addressDetails.accountAddress, dataUploaded.metadataUrl);

                // Étape 6: Finalisation
                updateProgress(5);
                await signIn("credentials", { email, password });
                await new Promise(resolve => setTimeout(resolve, 1000));
                closeModal();
            } else {
                const data = await response.json();
                setError(data.error || "Une erreur est survenue lors de l'inscription.");
                setIsLoading(false);
            }
        } catch (err) {
            setError("Une erreur est survenue lors de l'inscription. Veuillez réessayer.");
            console.error(err);
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md space-y-6">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Créer un compte</h2>
            <p className="text-center text-gray-600 text-sm mb-6">Rejoignez notre communauté et commencez à contribuer</p>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {isLoading && (
                <div className="mb-6 bg-blue-50 rounded-lg p-4">
                    <div className="mb-4">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
                                style={{ width: `${(currentStep + 1) * 100 / progressSteps.length}%` }}
                            ></div>
                        </div>
                    </div>
                    <ul className="space-y-3">
                        {progressSteps.map((step, index) => (
                            <li key={index} className="flex items-center">
                                {step.completed ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                                ) : step.current ? (
                                    <div className="h-5 w-5 mr-2 text-blue-500">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    </div>
                                ) : (
                                    <Circle className="h-5 w-5 text-gray-300 mr-2" />
                                )}
                                <span className={`text-sm ${step.completed ? 'text-green-700' : step.current ? 'text-blue-700 font-medium' : 'text-gray-500'}`}>
                                    {step.name}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <form className="mt-4 space-y-5" onSubmit={handleSubmit}>
                <div className="flex flex-col items-center justify-center mb-6">
                    <div className="relative w-24 h-24 mb-3">
                        {previewUrl ? (
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-100 shadow-md">
                                <img
                                    src={previewUrl}
                                    alt="Aperçu"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center border-4 border-blue-100 shadow-md">
                                <Camera className="w-10 h-10 text-blue-400" />
                            </div>
                        )}
                        <label htmlFor="profile-picture" className="absolute -bottom-1 -right-1 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer shadow-md transition-colors">
                            <Upload className="w-4 h-4" />
                        </label>
                    </div>
                    <input
                        id="profile-picture"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        required
                    />
                    <span className="text-sm text-gray-600">Photo de profil</span>
                </div>

                <div className="space-y-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Nom complet"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Nom d'utilisateur"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
                            autoComplete="off"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
                            autoComplete="username"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="password"
                            placeholder="Mot de passe"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
                            autoComplete="new-password"
                            required
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        "Inscription en cours..."
                    ) : (
                        "S'inscrire"
                    )}
                </button>
            </form>
        </div>
    );
};

export default function SignUpModal({ isOpen, closeModal }: SignUpModalProps) {
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={closeModal}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 shadow-2xl transition-all">
                                <button
                                    onClick={closeModal}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                                <SignUpForm closeModal={closeModal} />
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
