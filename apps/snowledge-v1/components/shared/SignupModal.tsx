"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment } from "react";
import {
  deployAccountContract,
  generateStarkNetAddress,
} from "../../utils/starknetUtils";
import {
  Camera,
  User,
  Mail,
  Lock,
  Upload,
  CheckCircle2,
  Circle,
  Loader2,
} from "lucide-react";
import { Loader } from "@/components/ui/loader";
import Image from "next/image";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const [progressSteps, setProgressSteps] = useState([
    {
      name: t("signup.steps.wallet_creation"),
      completed: false,
      current: true,
    },
    {
      name: t("signup.steps.wallet_funding"),
      completed: false,
      current: false,
    },
    {
      name: t("signup.steps.wallet_deployment"),
      completed: false,
      current: false,
    },
    {
      name: t("signup.steps.data_registration"),
      completed: false,
      current: false,
    },
    { name: t("signup.steps.sbt_creation"), completed: false, current: false },
    { name: t("signup.steps.finalization"), completed: false, current: false },
  ]);
  const [profilePictureError, setProfilePictureError] = useState(false);
  const router = useRouter();

  // Mettre à jour les progressSteps quand la langue change
  useEffect(() => {
    setProgressSteps([
      {
        name: t("signup.steps.wallet_creation"),
        completed: currentStep > 0,
        current: currentStep === 0,
      },
      {
        name: t("signup.steps.wallet_funding"),
        completed: currentStep > 1,
        current: currentStep === 1,
      },
      {
        name: t("signup.steps.wallet_deployment"),
        completed: currentStep > 2,
        current: currentStep === 2,
      },
      {
        name: t("signup.steps.data_registration"),
        completed: currentStep > 3,
        current: currentStep === 3,
      },
      {
        name: t("signup.steps.sbt_creation"),
        completed: currentStep > 4,
        current: currentStep === 4,
      },
      {
        name: t("signup.steps.finalization"),
        completed: currentStep > 5,
        current: currentStep === 5,
      },
    ]);
  }, [t, currentStep]);

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
    setProgressSteps((prevSteps) =>
      prevSteps.map((s, index) => ({
        ...s,
        completed: index < step,
        current: index === step,
      }))
    );
  };

  const handleDeployAccount = async (addressDetails: {
    privateKey: string;
    publicKey: string;
  }) => {
    try {
      const response = await fetch("/api/starknet/deploy-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          privateKey: addressDetails.privateKey,
          publicKey: addressDetails.publicKey,
        }),
      });

      if (!response.ok) {
        throw new Error(t("signup.errors.account_deployment"));
      }

      await response.json();
    } catch (error) {
      console.error(t("signup.errors.error"), error);
      // Gérer l'erreur
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setProfilePictureError(false);

    // Vérifier si l'email contient un +
    if (email.includes("+")) {
      setError(t("signup.errors.email_plus_char"));
      return;
    }

    setIsLoading(true);

    if (!profilePicture) {
      setProfilePictureError(true);
      setIsLoading(false);
      return;
    }

    try {
      // Étape 1: Création du compte (déjà en cours)
      updateProgress(0);

      // Étape 2: Approvisionnement des fonds
      updateProgress(1);
      // Simuler l'approvisionnement des fonds (attente de 1.5 secondes)
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Étape 3: Déploiement du wallet
      updateProgress(2);
      const addressDetails = generateStarkNetAddress();
      await handleDeployAccount(addressDetails);

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
          // fullName,
          userName,
          // email,
          // accountAddress: addressDetails.accountAddress,
        };

        Object.entries(userData).forEach(([key, value]) => {
          formData.append(key, value);
        });

        const responseUpload = await fetch("/api/auth/upload", {
          method: "POST",
          body: formData,
        });

        if (!responseUpload.ok) {
          console.error(t("signup.errors.file_upload"));
        }

        const dataUploaded = await responseUpload.json();

        // Étape 5: Création du SBT
        updateProgress(4);
        // Wait for 1 second before minting the SBT
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await fetch("/api/mint-sbt", {
          method: "POST",
          body: JSON.stringify({
            recipient: addressDetails.accountAddress,
            uri: dataUploaded.metadataUrl,
          }),
        });

        // Étape 6: Finalisation
        updateProgress(5);
        await signIn("credentials", { email, password });
        await new Promise((resolve) => setTimeout(resolve, 1000));
        closeModal();
      } else {
        const data = await response.json();
        setError(data.error || t("signup.errors.registration"));
        setIsLoading(false);
      }
    } catch (err) {
      setError(t("signup.errors.try_again"));
      console.error(err);
      setIsLoading(false);
    }
  };

  // Optionnel : validation en temps réel
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.includes("+")) {
      setError(t("signup.errors.email_plus_char"));
    } else {
      setError("");
    }
    setEmail(value);
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
        {t("signup.create_account")}
      </h2>
      <p className="text-center text-gray-600 text-sm mb-6">
        {t("signup.join_community")}
      </p>

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
                style={{
                  width: `${((currentStep + 1) * 100) / progressSteps.length}%`,
                }}
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
                <span
                  className={`text-sm ${
                    step.completed
                      ? "text-green-700"
                      : step.current
                      ? "text-blue-700 font-medium"
                      : "text-gray-500"
                  }`}
                >
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
                  alt={t("signup.profile_picture_preview")}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div
                className={`w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center border-4 ${
                  profilePictureError ? "border-red-200" : "border-blue-100"
                } shadow-md`}
              >
                <Camera
                  className={`w-10 h-10 ${
                    profilePictureError ? "text-red-400" : "text-blue-400"
                  }`}
                />
              </div>
            )}
            <label
              htmlFor="profile-picture"
              className="absolute -bottom-1 -right-1 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer shadow-md transition-colors"
            >
              <Upload className="w-4 h-4" />
            </label>
          </div>
          <input
            id="profile-picture"
            name="profile-picture"
            type="file"
            accept="image/*"
            onChange={(e) => {
              setProfilePictureError(false);
              handleFileChange(e);
            }}
            className="hidden"
          />
          <span className="text-sm text-gray-600">
            {t("signup.profile_picture")}
          </span>
          <span className="text-xs text-gray-500 mt-1 text-center">
            {previewUrl
              ? t("signup.click_to_change")
              : t("signup.can_change_later")}
          </span>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={t("signup.full_name")}
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
              placeholder={t("signup.username")}
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
              placeholder={t("signup.email")}
              value={email}
              onChange={handleEmailChange}
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
              placeholder={t("signup.password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
              autoComplete="new-password"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {profilePictureError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm text-center">
            {t("signup.errors.profile_picture_required")}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? t("signup.registering") : t("signup.register")}
        </button>

        {/* Séparateur */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              {t("signup.or_signup_with")}
            </span>
          </div>
        </div>

        {/* Boutons de connexion sociale */}
        <div className="grid grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => toast.info(t("signup.google_coming_soon"))}
            className="flex items-center justify-center p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Image
              src="/images/google-logo.png"
              alt="Google"
              width={24}
              height={24}
              className="w-6 h-6"
            />
          </button>

          <button
            type="button"
            onClick={() => toast.info(t("signup.facebook_coming_soon"))}
            className="flex items-center justify-center p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Image
              src="/images/facebook-logo.png"
              alt="Facebook"
              width={24}
              height={24}
              className="w-6 h-6"
            />
          </button>

          <button
            type="button"
            onClick={() => toast.info(t("signup.twitter_coming_soon"))}
            className="flex items-center justify-center p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Image
              src="/images/twitter-logo.png"
              alt="Twitter"
              width={24}
              height={24}
              className="w-6 h-6"
            />
          </button>
        </div>

        {/* Note en bas */}
        <p className="text-xs text-center text-gray-500 mt-4">
          {t("signup.other_options_note")}
        </p>
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
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
