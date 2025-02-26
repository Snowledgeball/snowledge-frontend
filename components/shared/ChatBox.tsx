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
    where,
    doc,
    getDoc,
    updateDoc,
    FieldValue
} from "firebase/firestore";
import Image from "next/image";

interface Channel {
    id: string;
    name: string;
    type: 'text' | 'welcome' | 'governance' | 'announcements';
    description: string;
    icon?: string;
}

interface User {
    id: string;
    email: string;
    name: string;
    image?: string;
}

type MessageData = Omit<Message, 'id'>;

interface FirestoreTimestamp {
    seconds: number;
    nanoseconds: number;
}

interface Message {
    id: string;
    text: string;
    userId: string;
    username: string;
    channelId: string;
    timestamp?: Date | FieldValue | FirestoreTimestamp;
    reactions?: { [key: string]: string[] }; // emoji: userId[]
    replyTo?: string; // ID du message auquel on répond
    attachments?: string[]; // URLs des pièces jointes
}

interface ChatBoxProps {
    user: User;
}

// Liste des canaux par défaut
const DEFAULT_CHANNELS: Channel[] = [
    {
        id: 'general',
        name: 'Chat général',
        type: 'text',
        description: 'Canal principal pour les discussions générales',
        icon: '💬'
    },
    {
        id: 'welcome',
        name: 'Bienvenue',
        type: 'welcome',
        description: 'Canal dédié aux présentations des nouveaux membres',
        icon: '👋'
    },
    {
        id: 'governance',
        name: 'Gouvernance',
        type: 'governance',
        description: 'Canal pour les règlements de la communauté',
        icon: '📜'
    },
    {
        id: 'announcements',
        name: 'Annonces',
        type: 'announcements',
        description: 'Canal pour les informations importantes',
        icon: '📢'
    }
];

const DEFAULT_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

const MAX_MESSAGE_LENGTH = 500;

export default function ChatBox({ user }: ChatBoxProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState<string>("");
    const [selectedChannel, setSelectedChannel] = useState<Channel>(DEFAULT_CHANNELS[0]);
    const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);

    const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    };

    useEffect(() => {
        const q = query(
            collection(db, "messages"),
            where("channelId", "==", selectedChannel.id),
            orderBy("timestamp", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setMessages(
                snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Message))
            );
        });

        return () => unsubscribe();
    }, [selectedChannel.id]);

    const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        if (text.length <= MAX_MESSAGE_LENGTH) {
            setNewMessage(text);
            adjustTextareaHeight(e.target);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || newMessage.length > MAX_MESSAGE_LENGTH) return;

        const messageData: MessageData = {
            text: newMessage,
            userId: user.id,
            username: user.name,
            channelId: selectedChannel.id,
            timestamp: serverTimestamp(),
            reactions: {}
        };

        if (replyingTo?.id) {
            messageData.replyTo = replyingTo.id;
        }

        await addDoc(collection(db, "messages"), messageData);

        setNewMessage("");
        setReplyingTo(null);
    }

    const addReaction = async (messageId: string, emoji: string) => {
        const messageRef = doc(db, "messages", messageId);
        const messageDoc = await getDoc(messageRef);

        if (messageDoc.exists()) {
            const reactions = messageDoc.data().reactions || {};
            const userReactions = reactions[emoji] || [];

            // Toggle user reaction
            const updatedReactions = {
                ...reactions,
                [emoji]: userReactions.includes(user.id)
                    ? userReactions.filter((id: string) => id !== user.id)
                    : [...userReactions, user.id]
            };

            await updateDoc(messageRef, { reactions: updatedReactions });
        }
    };

    return (
        <div className="flex h-screen bg-gray-900">
            {/* Sidebar des canaux */}
            <div className="w-64 bg-gray-800 flex flex-col">
                <div className="p-4 border-b border-gray-700">
                    <h2 className="text-white font-semibold">Canaux</h2>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {DEFAULT_CHANNELS.map((channel) => (
                        <button
                            key={channel.id}
                            onClick={() => setSelectedChannel(channel)}
                            className={`w-full flex items-center px-4 py-2 hover:bg-gray-700 transition-colors ${selectedChannel.id === channel.id ? 'bg-gray-700' : ''
                                }`}
                        >
                            <span className="mr-2">{channel.icon}</span>
                            <span className="text-gray-300">{channel.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Zone principale de chat */}
            <div className="flex-1 flex flex-col bg-gray-700">
                {/* En-tête du canal */}
                <div className="p-4 border-b border-gray-600">
                    <div className="flex items-center">
                        <span className="mr-2">{selectedChannel.icon}</span>
                        <h2 className="text-white font-semibold">{selectedChannel.name}</h2>
                    </div>
                    <p className="text-gray-400 text-sm">{selectedChannel.description}</p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {messages.map((msg) => (
                        <div key={msg.id} className="group hover:bg-gray-600/20 rounded-lg transition-colors duration-200">
                            {/* Message répondu */}
                            {msg.replyTo && messages.find(m => m.id === msg.replyTo) && (
                                <div className="ml-12 mb-1 text-gray-400 text-sm">
                                    <div className="flex items-center">
                                        <span className="mr-2">↱</span>
                                        <span className="font-medium">{messages.find(m => m.id === msg.replyTo)?.username}</span>
                                    </div>
                                    <div className="ml-5 pl-2 border-l-2 border-gray-500 mt-1">
                                        {(() => {
                                            const repliedMessage = messages.find(m => m.id === msg.replyTo);
                                            const text = repliedMessage?.text || '';
                                            return text.length > 100
                                                ? `${text.substring(0, 100)}...`
                                                : text;
                                        })()}
                                    </div>
                                </div>
                            )}

                            {/* Message principal */}
                            <div className="flex items-start space-x-3 relative">
                                <Image
                                    src={user.image || `https://ui-avatars.com/api/?name=${msg.username}`}
                                    alt={msg.username}
                                    width={40}
                                    height={40}
                                    className="rounded-full"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-white font-medium">{msg.username}</span>
                                        <span className="text-gray-400 text-xs">
                                            {msg.timestamp && (msg.timestamp as FirestoreTimestamp).seconds !== undefined
                                                ? new Date((msg.timestamp as FirestoreTimestamp).seconds * 1000).toLocaleString()
                                                : msg.timestamp instanceof Date
                                                    ? msg.timestamp.toLocaleString()
                                                    : ''}
                                        </span>
                                    </div>
                                    <div className="flex items-start justify-between">
                                        <p className="text-gray-300 mt-1 max-w-[750px] break-words whitespace-pre-wrap">{msg.text}</p>

                                        {/* Actions du message et réactions */}
                                        <div className="flex items-center space-x-1 ml-4">
                                            {/* Réactions existantes */}
                                            <div className="flex items-center space-x-2">
                                                {Object.entries(msg.reactions || {}).map(([emoji, users]) => (
                                                    users.length > 0 && (
                                                        <button
                                                            key={emoji}
                                                            onClick={() => addReaction(msg.id, emoji)}
                                                            className={`px-3 py-1.5 rounded-full text-base ${users.includes(user.id)
                                                                ? 'bg-blue-600 text-white'
                                                                : 'bg-gray-600 text-gray-300'
                                                                }`}
                                                        >
                                                            {emoji} {users.length}
                                                        </button>
                                                    )
                                                ))}
                                            </div>

                                            {/* Actions du message */}
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-2">
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setShowEmojiPicker(showEmojiPicker === msg.id ? null : msg.id)}
                                                        className="text-gray-400 hover:text-white p-2 hover:bg-gray-700 rounded-full text-xl relative group/emoji"
                                                    >
                                                        😊
                                                        <span className="absolute bottom-full right-0 mb-2 px-2 py-1 text-sm text-white bg-gray-800 rounded opacity-0 group-hover/emoji:opacity-100 transition-opacity whitespace-nowrap">
                                                            Ajouter une réaction
                                                        </span>
                                                    </button>
                                                    {/* Menu des réactions */}
                                                    {showEmojiPicker === msg.id && (
                                                        <div className="absolute right-0 bottom-full mb-2 bg-gray-800 rounded-lg shadow-lg p-2 flex items-center space-x-2">
                                                            {DEFAULT_REACTIONS.map((emoji) => (
                                                                <button
                                                                    key={emoji}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        addReaction(msg.id, emoji);
                                                                        setShowEmojiPicker(null);
                                                                    }}
                                                                    className="p-2 hover:bg-gray-700 rounded-full transition-colors text-xl"
                                                                >
                                                                    {emoji}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => setReplyingTo(msg)}
                                                    className="text-gray-400 hover:text-white p-2 hover:bg-gray-700 rounded-full relative group/reply text-xl"
                                                >
                                                    ↩️
                                                    <span className="absolute bottom-full right-0 mb-2 px-2 py-1 text-sm text-white bg-gray-800 rounded opacity-0 group-hover/reply:opacity-100 transition-opacity whitespace-nowrap">
                                                        Répondre au message
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Zone de saisie */}
                <div className="p-4 border-t border-gray-600">
                    {replyingTo && (
                        <div className="mb-2 flex flex-col bg-gray-600/50 p-2 rounded">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-gray-300 text-sm">
                                    Réponse à {replyingTo.username}
                                </span>
                                <button
                                    onClick={() => setReplyingTo(null)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="text-gray-400 text-sm pl-2 border-l-2 border-gray-500">
                                {replyingTo.text.length > 100
                                    ? `${replyingTo.text.substring(0, 100)}...`
                                    : replyingTo.text}
                            </div>
                        </div>
                    )}
                    <div className="flex items-start space-x-2">
                        <div className="flex-1 relative">
                            <textarea
                                value={newMessage}
                                onChange={handleMessageChange}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        sendMessage();
                                    }
                                }}
                                maxLength={MAX_MESSAGE_LENGTH}
                                placeholder={`Message dans ${selectedChannel.name}`}
                                rows={1}
                                className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden"
                                style={{ minHeight: '44px', height: 'auto' }}
                                ref={(textarea) => {
                                    if (textarea) {
                                        adjustTextareaHeight(textarea);
                                    }
                                }}
                            />
                            <span className="absolute right-2 bottom-2 text-xs text-gray-400">
                                {newMessage.length}/{MAX_MESSAGE_LENGTH}
                            </span>
                        </div>
                        <button
                            onClick={sendMessage}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors self-end"
                        >
                            Envoyer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
