"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { Fragment } from "react";
import { deployAccountContract, generateStarkNetAddress } from "../../utils/starknetUtils";
import { mintSBT } from "../../utils/mintSBT";

interface SignUpModalProps {
    isOpen: boolean;
    closeModal: () => void;
}

const SignUpForm = ({ closeModal }: { closeModal: () => void }) => {
    const [fullName, setFullName] = useState("");
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const addressDetails = generateStarkNetAddress();
        await deployAccountContract(addressDetails.privateKey, addressDetails.publicKey);

        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                fullName,
                userName,
                email,
                password,
                profilePicture: "temp",
                accountAddress: addressDetails.accountAddress,
                publicKey: addressDetails.publicKey,
                privateKey: addressDetails.privateKey,
            }),
        });

        if (response.ok) {
            const formData = new FormData();
            const userData = {
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
                console.log("Error uploading file");
            }

            const dataUploaded = await responseUpload.json();
            console.log("dataUploaded", dataUploaded);

            // Wait for 1 second before minting the SBT
            await new Promise(resolve => setTimeout(resolve, 1000));
            await mintSBT(addressDetails.accountAddress, dataUploaded.metadataUrl);
            await signIn("credentials", { email, password });
            closeModal();
            router.push("/");

        } else {
            const data = await response.json();
            setError(data.error || "Une erreur est survenue lors de l'inscription.");
        }
    };

    return (
        <div className="w-full max-w-md p-6 space-y-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center text-gray-800">Créer un compte</h2>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
                <input type="text" placeholder="Nom complet" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-3 py-2 border rounded-md" required />
                <input type="text" placeholder="Nom d'utilisateur" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full px-3 py-2 border rounded-md" required />
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded-md" required />
                <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded-md" required />
                <button type="submit" className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md">S'inscrire</button>
            </form>
        </div>
    );
};

export default function SignUpModal({ isOpen, closeModal }: SignUpModalProps) {
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={closeModal}>
                <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm" />
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <TransitionChild enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-12 shadow-xl transition-all">
                                <SignUpForm closeModal={closeModal} />
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
