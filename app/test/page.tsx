"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import Image from "next/image";
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import TinyEditor from "@/components/shared/TinyEditor";
import { Loader2 } from "lucide-react";
import { signIn, useSession } from "next-auth/react";

interface Post {
    id: number;
    title: string;
    content: string;
    cover_image_url: string | null;
    tag: string;
    created_at: string;
    accept_contributions: boolean;
    user: {
        id: number;
        fullName: string;
        profilePicture: string;
    };
}

export default function TestPost() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [loginAttempted, setLoginAttempted] = useState(false);

    // Fixed IDs for post and community
    const communityId = "38";
    const postId = "12";

    // Automatic login
    useEffect(() => {
        const autoLogin = async () => {
            if (status === 'unauthenticated' && !loginAttempted) {
                setLoginAttempted(true);
                try {
                    const result = await signIn("credentials", {
                        redirect: false,
                        email: "test@test",
                        password: "test@test"
                    });

                    if (result?.error) {
                        console.error("Login error:", result.error);
                        toast.error("Automatic login failed");
                    } else {
                        toast.success("Automatic login successful");
                    }
                } catch (error) {
                    console.error("Error during login:", error);
                    toast.error("Error during automatic login");
                }
            }
        };

        autoLogin();
    }, [status, loginAttempted]);

    // Fetch post
    useEffect(() => {
        const fetchPost = async () => {
            if (status !== 'authenticated') return;

            setLoading(true);
            try {
                // First try to fetch the published post
                let response = await fetch(`/api/communities/${communityId}/posts/${postId}`);

                // If published post is not found, try to fetch pending post
                if (!response.ok) {
                    response = await fetch(`/api/communities/${communityId}/posts/pending/${postId}`);
                    if (!response.ok) throw new Error('Post not found');
                }

                const data = await response.json();
                setPost(data);
            } catch (error) {
                toast.error("Error while fetching post");
                console.error("Fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [status]);

    // Loading component
    const LoadingComponent = () => (
        <div className="flex justify-center items-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="ml-2 text-blue-600">
                {status !== 'authenticated' ? "Logging in..." : "Loading post..."}
            </p>
        </div>
    );

    if (status !== 'authenticated' || loading || !post) return <LoadingComponent />;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold">Comments Preview</h1>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium">
                                    Logged in as: {session.user.name} (test mode)
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h3 className="text-lg font-semibold text-yellow-800 mb-2">About This Test Environment</h3>
                        <p className="text-sm text-yellow-700">
                            This is a fully functional replica of the main application's post viewing and commenting system.
                            All actions performed here (adding comments, selecting text) interact with the actual database
                            and work exactly as they would in the production environment. Feel free to test the commenting
                            features - they're identical to the main application.
                        </p>
                        <p className="text-sm text-yellow-700 mt-2">
                            View all conversations for this post: {" "}
                            <a
                                href={`/api/communities/${communityId}/posts/${postId}/conversations`}
                                className="text-blue-600 hover:text-blue-800 underline"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                API Endpoint
                            </a>
                        </p>
                    </div>

                    <div className="bg-white rounded-xl p-6">
                        {/* Post header */}
                        <div className="flex items-center space-x-3 mb-6">
                            <Image
                                src={post.user.profilePicture}
                                alt={post.user.fullName}
                                width={40}
                                height={40}
                                className="rounded-full"
                            />
                            <div>
                                <p className="font-medium">{post.user.fullName}</p>
                                <p className="text-sm text-gray-500">
                                    {formatDistanceToNow(new Date(post.created_at), {
                                        addSuffix: true,
                                        locale: fr
                                    })}
                                </p>
                            </div>
                        </div>

                        {/* Cover image */}
                        {post.cover_image_url && (
                            <div className="w-full h-48 relative mb-6 rounded-lg overflow-hidden">
                                <Image
                                    src={post.cover_image_url.startsWith('http') ? post.cover_image_url : `https://${post.cover_image_url}`}
                                    alt="Cover"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}

                        {/* Title */}
                        <h2 className="text-2xl font-bold mb-6">{post.title}</h2>

                        {/* Content with TinyMCE in comment mode */}
                        <TinyEditor
                            initialValue={post.content}
                            onChange={() => { }}
                            readOnly={true}
                            commentMode={true}
                            communityId={communityId}
                            postId={postId}
                        />

                        <div className="mt-4 p-3 bg-blue-50 rounded-md text-sm text-blue-700">
                            <p><strong>Test mode with authentication</strong> - You are logged in as {session.user.name} and can add comments.</p>
                            <p>Select text to add a comment.</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
} 