'use client';

import { FormDataSignUp } from '@/shared/interfaces/ISignUp';
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

type AuthContextType = {
  accessToken: string | null;
  user: any | null;
  setAccessToken: (token: string | null) => void;
  authFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
  refreshAccessToken: () => Promise<string | null>;
  fetchDataUser: () => Promise<boolean>;
  validateFormSignUp: (formData: FormDataSignUp) => string | null;
  verifyToken: (token: string) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
    const isJwtValid = (token: string) => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 > Date.now();
        } catch {
            return false;
        }
    }
    const refreshAccessToken = useCallback(async () => {
        try {
            const res = await fetch('http://localhost:4000/auth/refresh-token', {
                method: 'POST',
                headers: { 
                    "Content-Type": "application/json",
                    "x-internal-call": "true"
                },
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Refresh failed');
            const data = await res.json();
            setAccessToken(data.access_token);
            return data.access_token;
        } catch (err) {
            setAccessToken(null);
            return null;
        }
    }, []);

    const authFetch = useCallback(
        async (input: RequestInfo, init: RequestInit = {}) => {
            let token = accessToken;
            if (!token || !isJwtValid(token)) {
                token = await refreshAccessToken();
                if (!token) throw new Error('No token');
            }

            return fetch(input, {
                ...init,
                headers: {
                    ...(init.headers || {}),
                    Authorization: `Bearer ${token}`,
                },
            });
        },
        [accessToken, refreshAccessToken]
    );

    useEffect(() => {
        refreshAccessToken(); // Récupère le token au premier chargement
    }, [refreshAccessToken]);
    const fetchDataUser = async () => {
                try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user`, {
                method: 'GET',
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error("Failed. Please try again.");
            }
            const data = await response.json();
            console.log(data)
            setUser(data.user)
            return true;
        } catch (err: any) {
            throw new Error (err.message || "An unexpected error occurred.");
        }
    }
    const verifyToken = async (token: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/verify-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ token: token}),
            });
            if (!response.ok) {
                throw new Error("Failed. Please try again.");
            }
            const data = await response.json();
            return true;
        } catch (err: any) {
            throw new Error (err.message || "An unexpected error occurred.");
        }
    }
    const validateFormSignUp = (formData: FormDataSignUp) => {
        const { gender, firstname, lastname, pseudo, email, age, password, confirmPwd } = formData;
        if ((gender == undefined) || !firstname || !lastname || !pseudo || !email || !age || !password || !confirmPwd) {
            return "All fields are required.";
        }
        if (password.length < 8) {
            return "Password must be at least 8 characters.";
        }
        if (password !== confirmPwd) {
            return "Passwords do not match.";
        }
        return null;
    };
    return (
        <AuthContext.Provider value={{ 
            accessToken, 
            user,
            setAccessToken, 
            authFetch,
            fetchDataUser,
            refreshAccessToken,
            validateFormSignUp,
            verifyToken
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
