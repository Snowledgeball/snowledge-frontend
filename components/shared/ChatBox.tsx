"use client";

import { useEffect, useState } from "react";
import { db } from "../../lib/firebaseConfig";
import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    DocumentData,
} from "firebase/firestore";

interface User {
    id: string;
    email: string;
    name?: string;
    image?: string;
}

interface Message {
    id: string;
    text: string;
    userId: string;
    username: string;
    timestamp?: Date;
}

interface ChatBoxProps {
    user: User;
}

export default function ChatBox({ user }: ChatBoxProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState<string>("");

    useEffect(() => {
        const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setMessages(
                snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Message))
            );
        });

        return () => unsubscribe();
    }, []);

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        await addDoc(collection(db, "messages"), {
            text: newMessage,
            userId: user.id,
            username: user.name,
            timestamp: serverTimestamp(),
        });

        setNewMessage("");
    };

    return (
        <div className="p-4 border rounded-lg" >
            <div className="h-64 overflow-y-auto" >
                {
                    messages.map((msg) => (
                        <div key={msg.id} className="p-2 bg-gray-200 my-2 rounded" >
                            <strong>{msg.username}: </strong> {msg.text}
                        </div>
                    ))
                }
            </div>
            < input
                className="w-full p-2 border rounded mt-2"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)
                }
                placeholder="Écrire un message..."
            />
            <button
                className="bg-blue-500 text-white p-2 rounded mt-2"
                onClick={sendMessage}
            >
                Envoyer
            </button>
        </div>
    );
}
