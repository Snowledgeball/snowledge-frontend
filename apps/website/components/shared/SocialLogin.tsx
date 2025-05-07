import React, { useEffect, useState } from 'react';
import { getProviders, signIn } from "next-auth/react"

interface Provider {
    id: string;
    name: string;
}

const SocialLogin = () => {
    const [providers, setProviders] = useState<Record<string, Provider> | null>(
        null
    );
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
        <>
            <h1>Connexion</h1>
            {Object.values(providers as Record<string, Provider>).map((provider) => (
                <div key={provider.name} style={{ margin: "10px 0" }}>
                    <button onClick={() => signIn(provider.id, { callbackUrl: "/" })}>
                        Se connecter avec {provider.name}
                    </button>
                </div>
            ))}

        </>
    );
};

export default SocialLogin;
