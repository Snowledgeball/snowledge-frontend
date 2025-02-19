'use client'

import { Editor } from '@tinymce/tinymce-react';
import { useState, useEffect } from 'react';

interface TinyEditorProps {
    value: string;
    onChange: (content: string) => void;
}

const TinyEditor = ({ value, onChange }: TinyEditorProps) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleEditorChange = (content: string) => {
        onChange(content);
        console.log('Contenu édité:', content);
    };

    if (!mounted) {
        return null;
    }

    return (
        <div className="tiny-editor">
            <Editor
                id="my-tiny-editor"
                apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                value={value}
                onEditorChange={handleEditorChange}
                initialValue="<p>Écrivez ici...</p><p></p><p></p><p></p><p></p>"
                init={{
                    plugins: 'quickbars advlist autolink lists link image media table',
                    toolbar: false,
                    menubar: false,
                    inline: true,
                    quickbars_selection_toolbar: 'blocks | bold italic underline | forecolor backcolor align | link',
                    quickbars_insert_toolbar: 'blocks |bullist numlist | table | image media | link',
                    advlist_bullet_styles: 'default',
                    advlist_number_styles: 'default',
                    file_picker_types: 'image',
                    automatic_uploads: true,
                    images_upload_url: '/api/upload',
                    images_upload_handler: async (blobInfo) => {
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
                }}
            />
        </div>
    );
};

export default TinyEditor;