'use client'

import { Editor } from '@tinymce/tinymce-react';
import { useState, useEffect } from 'react';

const TinyEditor = () => {
    const [content, setContent] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleEditorChange = (content: string) => {
        setContent(content);
        console.log('Contenu édité:', content);
    };

    if (!mounted) {
        return null;
    }


    return (
        <div className="tiny-editor p-2">
            <Editor
                id="my-tiny-editor"
                apiKey='lyx7gw5lsafqowwgdrssfaqry5mv32gvr8l03sbrjfda7sbi'
                inline={true}
                initialValue="<p>Écrivez ici...</p>"
                init={{
                    plugins: 'quickbars advlist autolink lists link image media table',
                    toolbar: false,
                    menubar: false,
                    inline: true,
                    quickbars_selection_toolbar: 'blocks | bold italic underline | forecolor backcolor align | bullist numlist | link',
                    quickbars_insert_toolbar: 'bullist numlist | table | image media | link',
                    advlist_bullet_styles: 'default',
                    advlist_number_styles: 'default',
                    content_style: `
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
                        margin-bottom: 0.5em;
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
                `
                }}
                onEditorChange={handleEditorChange}
            />



        </div>
    );
};

export default TinyEditor;