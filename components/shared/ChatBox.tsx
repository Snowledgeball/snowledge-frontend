"use client";

import { useEffect, useState, useRef } from "react";
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
    id: number;
    name: string;
    type: string;
    description: string;
    icon: string | null;
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
    userImage?: string;
    channelId: string;
    communityId: number;
    timestamp?: Date | FieldValue | FirestoreTimestamp;
    reactions?: { [key: string]: string[] }; // emoji: userId[]
    replyTo?: string; // ID du message auquel on répond
    attachments?: string[]; // URLs des pièces jointes
}

interface ChatBoxProps {
    user: User;
    communityId: number;
}

const DEFAULT_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

const MAX_MESSAGE_LENGTH = 500;

export default function ChatBox({ user, communityId }: ChatBoxProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState<string>("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [channels, setChannels] = useState<Channel[]>([]);
    const [isCreateChannelModalOpen, setIsCreateChannelModalOpen] = useState(false);
    const [newChannel, setNewChannel] = useState({
        name: '',
        type: 'text',
        description: '',
        icon: '💬'
    });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [channelToDelete, setChannelToDelete] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isCreator, setIsCreator] = useState(false);

    const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    };

    const scrollToBottom = () => {
        if (shouldAutoScroll && messagesContainerRef.current) {
            const container = messagesContainerRef.current;
            const targetScrollTop = container.scrollHeight;
            const startScrollTop = container.scrollTop;
            const distance = targetScrollTop - startScrollTop;
            const duration = 300; // durée en ms
            let start: number | null = null;

            const animate = (currentTime: number) => {
                if (start === null) start = currentTime;
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);

                // Fonction d'easing pour un mouvement plus naturel
                const easeOutCubic = 1 - Math.pow(1 - progress, 3);

                container.scrollTop = startScrollTop + (distance * easeOutCubic);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };

            requestAnimationFrame(animate);
        }
    };

    const handleScroll = () => {
        if (messagesContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
            const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
            setShouldAutoScroll(isAtBottom);
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!selectedChannel?.id) return;

        console.log('Fetching messages for channel:', selectedChannel.id.toString()); // Debug
        console.log('Community ID:', communityId); // Debug

        const q = query(
            collection(db, "messages"),
            where("communityId", "==", Number(communityId)), // Conversion en nombre
            where("channelId", "==", selectedChannel.id.toString()),
            orderBy("timestamp", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newMessages = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            } as Message));
            console.log('Received messages:', newMessages); // Debug
            setMessages(newMessages);
        });

        return () => unsubscribe();
    }, [selectedChannel?.id, communityId]);

    useEffect(() => {
        fetchChannels();
    }, [communityId]);

    useEffect(() => {
        const checkCreatorStatus = async () => {
            try {
                const response = await fetch(`/api/communities/${communityId}`);
                const data = await response.json();
                setIsCreator(data.creator_id === parseInt(user.id));
            } catch (error) {
                console.error('Erreur lors de la vérification du statut de créateur:', error);
            }
        };
        checkCreatorStatus();
    }, [communityId, user.id]);

    const fetchChannels = async () => {
        try {
            const response = await fetch(`/api/communities/${communityId}/channels`);
            const data = await response.json();
            setChannels(data);
            if (data.length > 0 && !selectedChannel) {
                setSelectedChannel(data[0]);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des canaux:', error);
        }
    };

    const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        if (text.length <= MAX_MESSAGE_LENGTH) {
            setNewMessage(text);
            adjustTextareaHeight(e.target);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || newMessage.length > MAX_MESSAGE_LENGTH || !selectedChannel) return;

        const messageData: MessageData = {
            text: newMessage,
            userId: user.id,
            username: user.name,
            userImage: user.image,
            channelId: selectedChannel.id.toString(),
            communityId: communityId,
            timestamp: serverTimestamp(),
            reactions: {},
            ...(replyingTo?.id ? { replyTo: replyingTo.id } : {})
        };

        try {
            console.log('Sending message:', messageData);
            await addDoc(collection(db, "messages"), messageData);
        } catch (error) {
            console.error('Error sending message:', error);
        }

        setNewMessage("");
        setReplyingTo(null);
    };

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

    const createChannel = async () => {
        try {
            const response = await fetch(`/api/communities/${communityId}/channels`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newChannel),
            });

            if (response.ok) {
                setIsCreateChannelModalOpen(false);
                setNewChannel({ name: '', type: 'text', description: '', icon: '💬' });
                fetchChannels();
            }
        } catch (error) {
            console.error('Erreur lors de la création du canal:', error);
        }
    };

    const handleDeleteChannel = async () => {
        if (!channelToDelete) return;

        try {
            const response = await fetch(`/api/communities/${communityId}/channels/${channelToDelete}`, {
                method: 'DELETE',
                credentials: 'include', // Ajoute les cookies à la requête
            });

            if (response.ok) {
                if (channels.length === 1) {
                    setSelectedChannel(null);
                } else {
                    setSelectedChannel(channels[0]);
                }
                setIsDeleteModalOpen(false);
                setChannelToDelete(null);
                fetchChannels();
            } else if (response.status === 403) {
                setError("Vous n'avez pas les permissions nécessaires pour supprimer ce canal.");
            } else {
                setError("Une erreur est survenue lors de la suppression du canal.");
            }
        } catch (error) {
            console.error('Erreur lors de la suppression du canal:', error);
            setError("Une erreur est survenue lors de la suppression du canal.");
        }
    };

    return (
        <div className="flex h-screen bg-gray-900">
            {/* Sidebar des canaux */}
            <div className="w-64 bg-gray-800 flex flex-col">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-white font-semibold">Canaux</h2>
                    {isCreator && (
                        <button
                            onClick={() => setIsCreateChannelModalOpen(true)}
                            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700"
                        >
                            <span className="text-xl">+</span>
                        </button>
                    )}
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {channels.map((channel) => (
                        <div
                            key={channel.id}
                            onClick={() => setSelectedChannel(channel)}
                            className={`flex items-center justify-between px-4 py-2 text-gray-400 hover:bg-gray-700 hover:text-white cursor-pointer group ${selectedChannel?.id === channel.id ? 'bg-gray-700 text-white' : ''
                                }`}
                        >
                            <div className="flex items-center space-x-2">
                                <span>{channel.icon}</span>
                                <span>{channel.name}</span>
                            </div>
                            {isCreator && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setChannelToDelete(channel.id);
                                        setIsDeleteModalOpen(true);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500 p-1"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Modal de création de canal */}
                {isCreateChannelModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
                            <h3 className="text-white text-lg font-semibold mb-4">Créer un nouveau canal</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-400 mb-1">Nom du canal</label>
                                    <input
                                        type="text"
                                        value={newChannel.name}
                                        onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
                                        className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-400 mb-1">Type</label>
                                    <select
                                        value={newChannel.type}
                                        onChange={(e) => setNewChannel({ ...newChannel, type: e.target.value })}
                                        className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="text">Texte</option>
                                        <option value="resources">Ressources</option>
                                        <option value="questions">Questions</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-400 mb-1">Description</label>
                                    <textarea
                                        value={newChannel.description}
                                        onChange={(e) => setNewChannel({ ...newChannel, description: e.target.value })}
                                        className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-400 mb-1">Icône (emoji)</label>
                                    <input
                                        type="text"
                                        value={newChannel.icon}
                                        onChange={(e) => setNewChannel({ ...newChannel, icon: e.target.value })}
                                        className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="💬"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={() => setIsCreateChannelModalOpen(false)}
                                    className="px-4 py-2 text-gray-400 hover:text-white"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={createChannel}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Créer
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Ajouter la modale de confirmation */}
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
                            <h3 className="text-white text-lg font-semibold mb-4">Supprimer le canal</h3>
                            <p className="text-gray-300 mb-6">
                                Êtes-vous sûr de vouloir supprimer ce canal ? Cette action est irréversible.
                            </p>
                            {error && (
                                <p className="text-red-500 mb-4">
                                    {error}
                                </p>
                            )}
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => {
                                        setIsDeleteModalOpen(false);
                                        setChannelToDelete(null);
                                        setError(null);
                                    }}
                                    className="px-4 py-2 text-gray-400 hover:text-white"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleDeleteChannel}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Zone principale de chat */}
            <div className="flex-1 flex flex-col bg-gray-700">
                {selectedChannel ? (
                    <>
                        {/* En-tête du canal */}
                        <div className="p-4 border-b border-gray-600">
                            <div className="flex items-center">
                                <span className="mr-2">{selectedChannel.icon}</span>
                                <h2 className="text-white font-semibold">{selectedChannel.name}</h2>
                            </div>
                            <p className="text-gray-400 text-sm">{selectedChannel.description}</p>
                        </div>

                        {/* Messages */}
                        <div
                            ref={messagesContainerRef}
                            onScroll={handleScroll}
                            className="flex-1 overflow-y-auto p-6 custom-scrollbar"
                        >
                            {messages.map((msg, index) => {
                                const previousMessage = index > 0 ? messages[index - 1] : null;
                                const isConsecutive = previousMessage
                                    && previousMessage.userId === msg.userId
                                    && !msg.replyTo
                                    && (!msg.timestamp || !previousMessage.timestamp || (
                                        'seconds' in (msg.timestamp as FirestoreTimestamp)
                                        && 'seconds' in (previousMessage.timestamp as FirestoreTimestamp)
                                        && ((msg.timestamp as FirestoreTimestamp).seconds - (previousMessage.timestamp as FirestoreTimestamp).seconds < 3600)
                                    ));

                                return (
                                    <div key={msg.id} className={`group hover:bg-gray-600/20 rounded-lg transition-colors duration-200 ${isConsecutive ? 'mt-0' : 'mt-6'}`}>
                                        {/* Message répondu */}
                                        {msg.replyTo && messages.find(m => m.id === msg.replyTo) && (
                                            <div className="relative ml-12 mb-2">
                                                <div className="absolute left-[5px] top-0 w-[2px] h-[calc(100%+3px)] bg-gray-500"></div>
                                                <div className="flex items-center space-x-2 pl-4">
                                                    <Image
                                                        src={messages.find(m => m.id === msg.replyTo)?.userImage || `https://ui-avatars.com/api/?name=${messages.find(m => m.id === msg.replyTo)?.username}`}
                                                        alt={messages.find(m => m.id === msg.replyTo)?.username || ''}
                                                        width={16}
                                                        height={16}
                                                        className="rounded-full"
                                                    />
                                                    <span className="text-sm font-medium text-gray-400">{messages.find(m => m.id === msg.replyTo)?.username}</span>
                                                    <p className="text-gray-400 text-sm">
                                                        {(() => {
                                                            const replyMessage = messages.find(m => m.id === msg.replyTo);
                                                            if (!replyMessage?.text) return '';
                                                            return replyMessage.text.length > 100
                                                                ? `${replyMessage.text.substring(0, 100)}...`
                                                                : replyMessage.text;
                                                        })()}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Message principal */}
                                        <div className="flex items-start relative group">
                                            <div className="flex items-start space-x-3 flex-1">
                                                {!isConsecutive && (
                                                    <Image
                                                        src={msg.userImage || `https://ui-avatars.com/api/?name=${msg.username}`}
                                                        alt={msg.username}
                                                        width={50}
                                                        height={50}
                                                        className="rounded-full"
                                                    />
                                                )}
                                                <div className={`flex-1 ${isConsecutive ? 'ml-[62px]' : ''}`}>
                                                    {!isConsecutive && (
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
                                                    )}
                                                    <p className={`text-gray-300 break-words whitespace-pre-wrap ${isConsecutive ? '' : 'mt-1'} py-[1px] max-w-[750px]`}>{msg.text}</p>
                                                </div>
                                            </div>

                                            {/* Actions du message et réactions */}
                                            <div className="absolute right-0 top-0 -translate-y-1/4 z-10">
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1 bg-gray-700 rounded-md shadow-lg">
                                                    <div className="relative group/emoji">
                                                        <button
                                                            onClick={() => setShowEmojiPicker(showEmojiPicker === msg.id ? null : msg.id)}
                                                            className="text-gray-400 hover:text-white p-0.5 hover:bg-gray-600 rounded-md text-lg"
                                                        >
                                                            😊
                                                        </button>
                                                        <span className="absolute bottom-full right-0 mb-2 hidden group-hover/emoji:block pointer-events-none px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap">
                                                            Ajouter une réaction
                                                        </span>
                                                        {showEmojiPicker === msg.id && (
                                                            <div className="absolute right-0 bottom-full mb-2 bg-gray-800 rounded-lg shadow-lg p-2 flex items-center space-x-2 z-20">
                                                                {DEFAULT_REACTIONS.map((emoji) => (
                                                                    <button
                                                                        key={emoji}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            addReaction(msg.id, emoji);
                                                                            setShowEmojiPicker(null);
                                                                        }}
                                                                        className="p-1.5 hover:bg-gray-700 rounded-md transition-colors text-lg"
                                                                    >
                                                                        {emoji}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="relative group/reply">
                                                        <button
                                                            onClick={() => setReplyingTo(msg)}
                                                            className="text-gray-400 hover:text-white p-0.5 hover:bg-gray-600 rounded-md text-lg"
                                                        >
                                                            ↩️
                                                        </button>
                                                        <span className="absolute bottom-full right-0 mb-2 hidden group-hover/reply:block pointer-events-none px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap">
                                                            Répondre
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Réactions existantes */}
                                            {Object.entries(msg.reactions || {}).some(([_, users]) => users.length > 0) && (
                                                <div className="mt-1 flex items-center space-x-1">
                                                    {Object.entries(msg.reactions || {}).map(([emoji, users]) => (
                                                        users.length > 0 && (
                                                            <button
                                                                key={emoji}
                                                                onClick={() => addReaction(msg.id, emoji)}
                                                                className={`px-2 py-0.5 rounded-md text-sm ${users.includes(user.id)
                                                                    ? 'bg-blue-600 text-white'
                                                                    : 'bg-gray-600 text-gray-300'
                                                                    }`}
                                                            >
                                                                {emoji} {users.length}
                                                            </button>
                                                        )
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
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
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                        Sélectionnez un canal pour commencer à discuter
                    </div>
                )}
            </div>
        </div>
    );
}
