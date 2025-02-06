"use client";

import { useSession } from "next-auth/react";

export default function MetadataSBTModifier() {
    const { data: session } = useSession();
    console.log("session", session);

    const handleSubmitUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        // TODO: Les valeurs a modifier / ajouter
        const newValue = {
            community:
                [
                    { "name": "the-bossssssss", "role": "admineeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" },
                    { "name": "the-boss-oui-enft", "role": "admineeeeeeee" },
                    { "name": "the-boss-oui-enft-2", "role": "admineeeeeeee" },
                ]
        }
        const userAddress = session?.user?.address;
        const formData = new FormData();
        console.log("newValue :", newValue);
        formData.append("newValue", JSON.stringify(newValue));
        formData.append("userAddress", userAddress || '');

        const res = await fetch("/api/auth/upload", {
            method: "PUT",
            body: formData,
        });
        const data = await res.json();
        console.log(data);
    };


    return (
        <div
            style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
        >
            { /* Formulaire pour modier les metadata de l'utilisateur dans le SBT */}
            <div className="flex justify-center items-center h-screen">
                <form onSubmit={handleSubmitUpdate}>
                    <label htmlFor="Nouvelle valeur">Nouvelle valeur</label>
                    <input type="text" name="newValue" />
                    <button type="submit">Modifier les metadata</button>
                </form>
            </div>
        </div>

    );
}
