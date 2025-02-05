"use client";

import { getProviders, signIn, useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import GenerateAddress from "@/components/shared/GenerateAddress";
import LoginForm from "@/components/shared/LoginForm";
import SignUpForm from "@/components/shared/SignUpForm";

interface Provider {
  id: string;
  name: string;
}

export default function Home() {
  const [providers, setProviders] = useState<Record<string, Provider> | null>(
    null
  );
  const { data: session } = useSession();

  console.log("session", session);

  useEffect(() => {
    const fetchProviders = async () => {
      const res = await getProviders();
      setProviders(res);
    };
    fetchProviders();
  }, []);

  if (!providers) {
    return <div>Chargement...</div>;
  }

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <h1>Connexion</h1>
      {Object.values(providers).map((provider) => (
        <div key={provider.name} style={{ margin: "10px 0" }}>
          <button onClick={() => signIn(provider.id, { callbackUrl: "/" })}>
            Se connecter avec {provider.name}
          </button>
        </div>
      ))}
      <div className="flex justify-center items-center h-screen">
        <GenerateAddress />
      </div>
      <LoginForm />

      <div className="p-4 text-center">
        {session ? (
          <div>
            <p>Connecté en tant que : <strong>{session.user?.email}</strong></p>
            <button
              onClick={() => signOut()}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md"
            >
              Se déconnecter
            </button>
          </div>
        ) : (
          <p>Non connecté</p>
        )}
      </div>

      <SignUpForm />
    </div>

  );
}
