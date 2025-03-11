"use client";

import { Editor as TinyMCEEditor } from "@tinymce/tinymce-react";
import { Editor } from "tinymce";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

type tinycomments_fetch = {
  conversations: {
    [conversationUid: string]: {
      uid: string;
      comments: [
        {
          uid: string;
          author: string;
          authorName?: string;
          authorAvatar?: string;
          content: string;
          createdAt: string; // ISO 8601 date string
          modifiedAt: string; // ISO 8601 date string
        }
        // ... more comments
      ];
    };
    // ... more conversations
  };
};

// Définir des types pour les paramètres de callback
type CallbackFunction = (response: any) => void;
type TinyCommentsRequest = {
  author?: string;
  content?: string;
  conversationUid?: string;
  commentUid?: string;
  modifiedAt?: string;
};

interface TinyEditorProps {
  onChange?: (content: string) => void;
  initialValue?: string;
  commentMode?: boolean;
  communityId?: string;
  postId?: string;
  placeholder?: string;
  protectImages?: boolean;
}

interface BlobInfo {
  blob: () => Blob;
}

// Ajout de nouveaux types pour les callbacks et les requêtes
type DoneCallback<T> = (response: T) => void;
type FailCallback = (error: unknown) => void;

type DeleteResponse = {
  canDelete: boolean;
  reason?: string;
};

type EditResponse = {
  canEdit: boolean;
  reason?: string;
};

type ResolveResponse = {
  canResolve: boolean;
  reason?: string;
};

type CommentRequest = {
  conversationUid: string;
  commentUid?: string;
  content?: string;
  modifiedAt?: string;
};

// Ajout du type pour la fonction fail
type TinyCommentsFetchFailCallback = (error: string) => void;

const TinyEditor = ({
  onChange,
  initialValue,
  commentMode,
  communityId,
  postId,
  placeholder,
  protectImages,
}: TinyEditorProps) => {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const editorRef = useRef<Editor | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(commentMode);

  // Initialiser le contenu une seule fois
  const [initialContent] = useState(
    initialValue || ""
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Supprimer l'effet qui met l'éditeur en mode readonly
  useEffect(() => {
    setIsReadOnly(commentMode);
  }, [commentMode]);

  const handleEditorChange = (content: string) => {
    // En mode commentaire, ne pas permettre les changements au contenu principal
    if (!commentMode && onChange) {
      onChange(content);
    }
  };

  const saveContent = async (content: string) => {
    try {
      const response = await fetch(
        `/api/communities/${communityId}/posts/${postId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, is_comment: true }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save content");
      }
    } catch (error) {
      console.error("Error saving content:", error);
    }
  };

  const baseConfig = {
    plugins: commentMode
      ? ["tinycomments", "quickbars"]
      : [
        "quickbars",
        "advlist",
        "autolink",
        "lists",
        "link",
        "image",
        "media",
        "table",
        "tinycomments",
      ].join(" "),
    toolbar: false,
    menubar: false,
    sidebar_show: commentMode ? "showcomments" : undefined,
    quickbars_selection_toolbar: commentMode
      ? "addcomment showcomments"
      : "blocks | bold italic underline | forecolor backcolor align | link",
    quickbars_insert_toolbar: commentMode
      ? false
      : "blocks |bullist numlist | table | image media | link",
    advlist_bullet_styles: "default",
    advlist_number_styles: "default",
    tinycomments_mode: "callback",
    tinycomments_author: session?.user?.id?.toString() || "",
    tinycomments_author_name: session?.user?.name || "Anonymous",
    tinycomments_author_avatar: session?.user?.image || "",
    file_picker_types: "image",
    automatic_uploads: true,
    images_upload_url: "/api/upload",
    // Configuration pour empêcher la suppression des images
    ...(protectImages ? {
      noneditable_class: "protected-image",
      noneditable_noneditable_class: "protected-image",
      extended_valid_elements: "img[*]",
      protect: [
        /\<img[^>]*\>/g, // Protéger toutes les balises img
      ],
    } : {}),
    // Fin de la configuration pour empêcher la suppression des images
    images_upload_handler: async (blobInfo: BlobInfo) => {
      const formData = new FormData();
      formData.append("file", blobInfo.blob());

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
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
    placeholder: placeholder ? placeholder : "<p>Écrivez ici...</p><p></p><p></p><p></p><p></p>",

    // Callbacks pour les commentaires
    tinycomments_create: async (
      req: TinyCommentsRequest,
      done: CallbackFunction,
      fail: CallbackFunction
    ) => {
      try {
        const response = await fetch(
          `/api/communities/${communityId}/posts/${postId}/conversations`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: req.content,
              createdAt: new Date().toISOString(),
            }),
          }
        );

        if (!response.ok) throw new Error("Failed to create comment");
        const data = await response.json();

        done({
          conversationUid: data.conversationUid,
          author: session?.user?.id?.toString() || "",
          authorName: session?.user?.name || "Anonymous",
          authorAvatar: session?.user?.image || "",
          createdAt: new Date().toISOString(),
        });

        sessionStorage.setItem("isAfterAddOrDeleteOrResolveComment", "true");
      } catch (err) {
        console.error("Error creating comment:", err);
        fail(err);
      }
    },

    tinycomments_reply: async (
      req: TinyCommentsRequest,
      done: CallbackFunction,
      fail: CallbackFunction
    ) => {
      try {
        const response = await fetch(
          `/api/communities/${communityId}/posts/${postId}/conversations/${req.conversationUid}/comments`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: req.content,
              createdAt: new Date().toISOString(),
            }),
          }
        );

        if (!response.ok) throw new Error("Failed to reply");
        const data = await response.json();

        done({
          commentUid: data.commentUid,
          author: session?.user?.id?.toString() || "",
          authorName: session?.user?.name || "Anonymous",
          authorAvatar: session?.user?.image || "",
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error("Error replying:", err);
        fail(err);
      }
    },

    tinycomments_delete: async (
      req: CommentRequest,
      done: DoneCallback<DeleteResponse>,
      fail: FailCallback
    ) => {
      try {
        const response = await fetch(
          `/api/communities/${communityId}/posts/${postId}/conversations/${req.conversationUid}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          if (response.status === 403) {
            done({
              canDelete: false,
              reason: "Non autorisé à supprimer cette conversation",
            });
            return;
          }
          throw new Error("Failed to delete conversation");
        }

        sessionStorage.setItem("isAfterAddOrDeleteOrResolveComment", "true");

        done({ canDelete: true });
      } catch (err) {
        console.error("Error deleting conversation:", err);
        fail(err);
      }
    },

    tinycomments_delete_comment: async (
      req: CommentRequest,
      done: DoneCallback<DeleteResponse>,
      fail: FailCallback
    ) => {
      try {
        const response = await fetch(
          `/api/communities/${communityId}/posts/${postId}/conversations/${req.conversationUid}/comments/${req.commentUid}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          if (response.status === 403) {
            done({
              canDelete: false,
              reason: "Non autorisé à supprimer ce commentaire",
            });
            return;
          }
          throw new Error("Failed to delete comment");
        }

        done({ canDelete: true });
      } catch (err) {
        console.error("Error deleting comment:", err);
        fail(err);
      }
    },

    tinycomments_lookup: async (
      req: CommentRequest,
      done: DoneCallback<{ conversation: { uid: string; comments: any[] } }>,
      fail: FailCallback
    ) => {
      try {
        const response = await fetch(
          `/api/communities/${communityId}/posts/${postId}/conversations/${req.conversationUid}`
        );
        if (!response.ok) throw new Error("Failed to lookup conversation");
        const data = await response.json();

        const obj = {
          conversation: {
            uid: req.conversationUid,
            comments: data.comments,
          },
        };
        done(obj);
      } catch (err) {
        console.error("Error looking up conversation:", err);
        fail(err);
      }
    },

    tinycomments_fetch: async (
      conversationUids: string[],
      done: (data: tinycomments_fetch) => void,
      fail: TinyCommentsFetchFailCallback
    ) => {
      console.log("tinycomments_fetch", conversationUids);

      const isAfterAddOrDeleteOrResolveComment =
        sessionStorage.getItem("isAfterAddOrDeleteOrResolveComment") === "true";
      if (isAfterAddOrDeleteOrResolveComment) {
        const editor = (window as any).tinymce.get("my-tiny-editor");
        if (editor) {
          await saveContent(editor.getContent());
          console.log("saveContent");
          sessionStorage.removeItem("isAfterAddOrDeleteOrResolveComment"); // Nettoyer après utilisation
        }
      }

      fetch(`/api/communities/${communityId}/posts/${postId}/conversations`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
        .then((response) => response.json())
        .then((data: tinycomments_fetch) => {
          console.log("Toutes les conversations:", data);
          done(data);
        })
        .catch((err) => {
          console.error("Erreur fetch:", err);
          fail("Fetching conversations failed");
        });
    },

    tinycomments_edit_comment: async (
      req: CommentRequest,
      done: DoneCallback<EditResponse>,
      fail: FailCallback
    ) => {
      try {
        const response = await fetch(
          `/api/communities/${communityId}/posts/${postId}/conversations/${req.conversationUid}/comments/${req.commentUid}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: req.content,
              modifiedAt: req.modifiedAt,
            }),
          }
        );

        if (!response.ok) {
          if (response.status === 403) {
            done({
              canEdit: false,
              reason: "Non autorisé à modifier ce commentaire",
            });
            return;
          }
          throw new Error("Failed to edit comment");
        }

        done({ canEdit: true });
      } catch (err) {
        console.error("Error editing comment:", err);
        fail(err);
      }
    },

    tinycomments_delete_all: async (
      req: CommentRequest,
      done: DoneCallback<DeleteResponse>,
      fail: FailCallback
    ) => {
      try {
        const response = await fetch(
          `/api/communities/${communityId}/posts/${postId}/conversations`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          if (response.status === 403) {
            done({
              canDelete: false,
              reason: "Non autorisé à supprimer tous les commentaires",
            });
            return;
          }
          throw new Error("Failed to delete all comments");
        }

        done({ canDelete: true });
      } catch (err) {
        console.error("Error deleting all comments:", err);
        fail(err);
      }
    },

    tinycomments_resolve: async (
      req: CommentRequest,
      done: DoneCallback<ResolveResponse>,
      fail: FailCallback
    ) => {
      try {
        const response = await fetch(
          `/api/communities/${communityId}/posts/${postId}/conversations/${req.conversationUid}/resolve`,
          {
            method: "PUT",
          }
        );

        if (!response.ok) {
          if (response.status === 403) {
            done({
              canResolve: false,
              reason: "Non autorisé à résoudre cette conversation",
            });
            return;
          }
          throw new Error("Failed to resolve conversation");
        }

        sessionStorage.setItem("isAfterAddOrDeleteOrResolveComment", "true");

        done({ canResolve: true });
      } catch (err) {
        console.error("Error resolving conversation:", err);
        fail(err);
      }
    },

    // Ajouter cette fonction setup pour désactiver l'édition du contenu mais permettre les commentaires
    setup: (editor: Editor) => {
      editor.on("init", () => {
        if (commentMode) {
          // Désactiver l'édition du contenu principal
          const originalExecCommand = editor.execCommand;

          // Remplacer execCommand pour bloquer les commandes d'édition
          editor.execCommand = function (cmd: string, ui: any, value: any) {
            const allowedCommands = [
              "mceToggleComment",
              "mceShowComments",
              "mceAddComment",
            ];

            if (allowedCommands.includes(cmd) || !cmd.startsWith("mce")) {
              return originalExecCommand.call(editor, cmd, ui, value);
            }

            // Bloquer les autres commandes d'édition
            return false;
          };

          // Désactiver les événements de frappe pour le contenu principal
          editor.on("keydown", (e) => {
            // Vérifier si l'utilisateur est dans un commentaire
            const node = editor.selection.getNode();
            const isInComment = node.closest(".tox-comment") !== null;

            // Permettre la frappe uniquement dans les commentaires
            if (!isInComment) {
              e.preventDefault();
              e.stopPropagation();
              return false;
            }
          });

          // Activer les commentaires
          setTimeout(() => {
            editor.execCommand("mceShowComments");
          }, 200);
        }

        // Protection des images - uniquement si protectImages est true
        if (protectImages) {
          // Empêcher la suppression des images
          editor.on('PreInit', () => {
            // Ajouter une classe aux images pour les identifier
            editor.dom.addClass(editor.dom.select('img'), 'protected-image');

            // Ajouter un style pour mettre en évidence les images protégées
            editor.dom.addStyle(`
              img.protected-image {
                border: 2px solid #4caf50;
                padding: 2px;
              }
            `);
          });

          // Empêcher la suppression des images avec la touche Delete ou Backspace
          editor.on('keydown', (e) => {
            const node = editor.selection.getNode();
            const isImage = node.nodeName === 'IMG' || node.closest('img') !== null;

            if (isImage && (e.keyCode === 8 || e.keyCode === 46)) { // 8 = Backspace, 46 = Delete
              e.preventDefault();
              e.stopPropagation();
              // Afficher un message à l'utilisateur
              editor.notificationManager.open({
                text: 'Les images ne peuvent pas être supprimées',
                type: 'info',
                timeout: 2000
              });
              return false;
            }
          });

          // Empêcher la suppression des images par d'autres moyens (couper, etc.)
          editor.on('BeforeSetContent', (e) => {
            // Sauvegarder les images existantes avant de modifier le contenu
            const existingImages = editor.dom.select('img');

            // Après la modification du contenu, vérifier si des images ont été supprimées
            setTimeout(() => {
              const currentImages = editor.dom.select('img');
              if (existingImages.length > currentImages.length) {
                // Restaurer le contenu précédent
                editor.undoManager.undo();

                // Afficher un message à l'utilisateur
                editor.notificationManager.open({
                  text: 'Les images ne peuvent pas être supprimées',
                  type: 'info',
                  timeout: 2000
                });
              }
            }, 0);
          });

          // Intercepter les commandes de suppression
          const originalExecCommand = editor.execCommand;
          editor.execCommand = function (cmd: string, ui: boolean, value: any) {
            // Vérifier si la commande est liée à la suppression et si une image est sélectionnée
            if ((cmd === 'Delete' || cmd === 'ForwardDelete') && editor.selection.getNode().nodeName === 'IMG') {
              editor.notificationManager.open({
                text: 'Les images ne peuvent pas être supprimées',
                type: 'info',
                timeout: 2000
              });
              return false;
            }

            // Pour toutes les autres commandes, utiliser le comportement par défaut
            return originalExecCommand.call(editor, cmd, ui, value);
          };

          // Observer les mutations du DOM pour empêcher la suppression des images
          const observer = new MutationObserver((mutations) => {
            let imagesRemoved = false;

            mutations.forEach((mutation) => {
              if (mutation.type === 'childList') {
                // Vérifier si des nœuds ont été supprimés
                mutation.removedNodes.forEach((node) => {
                  if (node.nodeName === 'IMG' || (node.nodeType === 1 && (node as Element).querySelector('img'))) {
                    imagesRemoved = true;
                  }
                });
              }
            });

            if (imagesRemoved) {
              // Annuler la dernière action
              editor.undoManager.undo();

              // Informer l'utilisateur
              editor.notificationManager.open({
                text: 'Les images ne peuvent pas être supprimées',
                type: 'info',
                timeout: 2000
              });
            }
          });

          // Démarrer l'observation du contenu de l'éditeur
          observer.observe(editor.getBody(), {
            childList: true,
            subtree: true
          });
        }
      });
    },
  };

  return (
    <div className="tiny-editor">
      {mounted && (
        <TinyMCEEditor
          id="my-tiny-editor"
          apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
          onEditorChange={handleEditorChange}
          initialValue={initialContent}
          onInit={(_, editor) => {
            editorRef.current = editor;
            // Ne pas utiliser mode.set("readonly") car cela désactive les commentaires
          }}
          init={baseConfig}
        />
      )}
    </div>
  );
};

export default TinyEditor;
