'use client'

import { Editor } from '@tinymce/tinymce-react';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

type tinycomments_fetch = {
    conversations: {
        [conversationUid: string]: {
            uid: string,
            comments: [
                {
                    uid: string,
                    author: string,
                    authorName?: string,
                    authorAvatar?: string,
                    content: string,
                    createdAt: string, // ISO 8601 date string
                    modifiedAt: string // ISO 8601 date string
                },
                // ... more comments
            ]
        },
        // ... more conversations
    }
}

interface TinyEditorProps {
    onChange?: (content: string) => void;
    initialValue?: string;
    readOnly?: boolean;
    commentMode?: boolean;
    commentOnly?: boolean;
    communityId?: string;
    postId?: string;
}

interface BlobInfo {
    blob: () => Blob;
}

const TinyEditor = ({
    onChange,
    initialValue,
    readOnly,
    commentMode,
    commentOnly,
    communityId,
    postId
}: TinyEditorProps) => {
    const { data: session } = useSession();
    const [mounted, setMounted] = useState(false);
    const [editorContent, setEditorContent] = useState(initialValue || "<p>Écrivez ici...</p><p></p><p></p><p></p><p></p>");

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleEditorChange = (content: string) => {
        setEditorContent(content);
        onChange && onChange(content);
    };

    const baseConfig = {
        plugins: commentMode ? ['tinycomments', 'quickbars'] : ['quickbars', 'advlist', 'autolink', 'lists', 'link', 'image', 'media', 'table', 'tinycomments'].join(' '),
        toolbar: false,
        menubar: false,
        sidebar_show: commentMode ? 'showcomments' : undefined,
        quickbars_selection_toolbar: commentMode ? 'addcomment showcomments' : 'blocks | bold italic underline | forecolor backcolor align | link',
        quickbars_insert_toolbar: commentMode ? false : 'blocks |bullist numlist | table | image media | link',
        advlist_bullet_styles: 'default',
        advlist_number_styles: 'default',
        tinycomments_mode: 'callback',
        tinycomments_access: (req: any) => {
            return {
                canRead: true,
                canDelete: session?.user?.id === req.author,
                canEdit: session?.user?.id === req.author
            };
        },
        tinycomments_author: session?.user?.id?.toString() || '',
        tinycomments_author_name: session?.user?.name || 'Anonymous',
        tinycomments_author_avatar: session?.user?.image || '',
        file_picker_types: 'image',
        automatic_uploads: true,
        images_upload_url: '/api/upload',
        images_upload_handler: async (blobInfo: BlobInfo) => {
            const formData = new FormData();
            formData.append('file', blobInfo.blob());

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            return `https://${data.url}`;
        },
        content_style: `
            #my-tiny-editor {
                padding: 1.5rem 2rem;
                border-radius: 0.5rem;
                border: 1px solid #e5e7eb;
             }
                    .tiny-editor h1 {
                        font-size: 2em;
                        margin-bottom: 0.5em;
                    }
                    .tiny-editor h2 {
                        font-size: 1.5em;
                        margin-bottom: 0.5em;
                    }
                    .tiny-editor h3 {
                        font-size: 1.17em;
                        margin-bottom: 0.5em;
                    }

                    .tiny-editor h4 {
                        font-size: 1em;
                        margin-bottom: 0.5em;
                    }

                    .tiny-editor h5 {
                        font-size: 0.83em;
                        margin-bottom: 0.5em;
                    }

                    .tiny-editor h6 {
                        font-size: 0.67em;
                        margin-bottom: 0.5em;
                    }

                    .tiny-editor p {
                        font-size: 1em;
                    }

                    .tiny-editor table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 1em;
                    }

                    .tiny-editor td {
                        border: 1px solid #ccc;
                        padding: 0.5em;
                    }

                    .tiny-editor ul {
                        list-style-type: disc;
                    }
                
                    .tiny-editor ol {
                        list-style-type: decimal;
                    }
            `,

        // Callbacks pour les commentaires
        tinycomments_create: async (req: any, done: Function, fail: Function) => {
            try {
                const response = await fetch(`/api/communities/${communityId}/posts/${postId}/comments/conversations`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        content: req.content,
                        createdAt: new Date().toISOString()
                    })
                });

                if (!response.ok) throw new Error('Failed to create comment');
                const data = await response.json();

                done({
                    conversationUid: data.conversationUid,
                    author: session?.user?.id?.toString() || '',
                    authorName: session?.user?.name || 'Anonymous',
                    authorAvatar: session?.user?.image || '',
                    createdAt: new Date().toISOString()
                });
            } catch (err) {
                console.error('Error creating comment:', err);
                fail(err);
            }
        },

        tinycomments_reply: async (req: any, done: Function, fail: Function) => {
            try {
                const response = await fetch(`/api/communities/${communityId}/posts/${postId}/comments/conversations/${req.conversationUid}/comments`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        content: req.content,
                        createdAt: new Date().toISOString()
                    })
                });

                if (!response.ok) throw new Error('Failed to reply');
                const data = await response.json();

                done({
                    commentUid: data.commentUid,
                    author: session?.user?.id?.toString() || '',
                    authorName: session?.user?.name || 'Anonymous',
                    authorAvatar: session?.user?.image || '',
                    createdAt: new Date().toISOString()
                });
            } catch (err) {
                console.error('Error replying:', err);
                fail(err);
            }
        },

        tinycomments_delete: async (req: any, done: Function, fail: Function) => {
            try {
                const response = await fetch(`/api/communities/${communityId}/posts/${postId}/comments/conversations/${req.conversationUid}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    if (response.status === 403) {
                        done({ canDelete: false, reason: "Non autorisé à supprimer cette conversation" });
                        return;
                    }
                    throw new Error('Failed to delete conversation');
                }
                done({ canDelete: true });
            } catch (err) {
                console.error('Error deleting conversation:', err);
                fail(err);
            }
        },

        tinycomments_delete_comment: async (req: any, done: Function, fail: Function) => {
            try {
                const response = await fetch(`/api/communities/${communityId}/posts/${postId}/comments/conversations/${req.conversationUid}/comments/${req.commentUid}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    if (response.status === 403) {
                        done({ canDelete: false, reason: "Non autorisé à supprimer ce commentaire" });
                        return;
                    }
                    throw new Error('Failed to delete comment');
                }

                done({ canDelete: true });
            } catch (err) {
                console.error('Error deleting comment:', err);
                fail(err);
            }
        },

        tinycomments_lookup: async (req: any, done: Function, fail: Function) => {
            try {
                const response = await fetch(`/api/communities/${communityId}/posts/${postId}/comments/conversations/${req.conversationUid}`);
                if (!response.ok) throw new Error('Failed to lookup conversation');
                const data = await response.json();

                const obj = {
                    conversation: {
                        uid: req.conversationUid,
                        comments: data.comments
                    }
                };
                done(obj);
            } catch (err) {
                console.error('Error looking up conversation:', err);
                fail(err);
            }
        },

        tinycomments_fetch: (conversationUids: string[], done: (data: tinycomments_fetch) => void, fail: Function) => {
            console.log("tinycomments_fetch", conversationUids);

            // Récupérer tous les commentaires du post
            fetch(`/api/communities/${communityId}/posts/${postId}/comments/conversations`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            })
                .then(response => response.json())
                .then((data: tinycomments_fetch) => {
                    console.log('Toutes les conversations:', data);
                    done(data);
                })
                .catch(err => {
                    console.error('Erreur fetch:', err);
                    fail('Fetching conversations failed');
                });
        },

        tinycomments_edit_comment: async (req: any, done: Function, fail: Function) => {
            try {
                const response = await fetch(
                    `/api/communities/${communityId}/posts/${postId}/comments/conversations/${req.conversationUid}/comments/${req.commentUid}`,
                    {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            content: req.content,
                            modifiedAt: req.modifiedAt
                        })
                    }
                );

                if (!response.ok) {
                    if (response.status === 403) {
                        done({ canEdit: false, reason: "Non autorisé à modifier ce commentaire" });
                        return;
                    }
                    throw new Error('Failed to edit comment');
                }

                done({ canEdit: true });
            } catch (err) {
                console.error('Error editing comment:', err);
                fail(err);
            }
        },

        tinycomments_delete_all: async (_req: any, done: Function, fail: Function) => {
            try {
                const response = await fetch(
                    `/api/communities/${communityId}/posts/${postId}/comments/conversations`,
                    {
                        method: 'DELETE'
                    }
                );

                if (!response.ok) {
                    if (response.status === 403) {
                        done({ canDelete: false, reason: "Non autorisé à supprimer tous les commentaires" });
                        return;
                    }
                    throw new Error('Failed to delete all comments');
                }

                done({ canDelete: true });
            } catch (err) {
                console.error('Error deleting all comments:', err);
                fail(err);
            }
        },

        tinycomments_resolve: async (req: any, done: Function, fail: Function) => {
            try {
                const response = await fetch(
                    `/api/communities/${communityId}/posts/${postId}/comments/conversations/${req.conversationUid}/resolve`,
                    {
                        method: 'PUT'
                    }
                );

                if (!response.ok) {
                    if (response.status === 403) {
                        done({ canResolve: false, reason: "Non autorisé à résoudre cette conversation" });
                        return;
                    }
                    throw new Error('Failed to resolve conversation');
                }

                done({ canResolve: true });
            } catch (err) {
                console.error('Error resolving conversation:', err);
                fail(err);
            }
        }
    };

    if (!mounted) return null;

    return (
        <div className="tiny-editor" >
            <Editor
                id="my-tiny-editor"
                apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                onEditorChange={handleEditorChange}
                initialValue={editorContent}
                init={baseConfig}
            />
        </div >
    );
};

export default TinyEditor;