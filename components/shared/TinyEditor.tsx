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
        <div>
            <Editor
                id="my-tiny-editor"
                apiKey='lyx7gw5lsafqowwgdrssfaqry5mv32gvr8l03sbrjfda7sbi'
                inline={true}
                initialValue="<p>Écrivez ici...</p>"
                init={{
                    menubar: false,
                    plugins: 'advlist autolink lists link image',
                    toolbar: 'blocks | undo redo | bold italic | alignleft aligncenter alignright | bullist numlist | link image',
                    toolbar_mode: 'sliding',
                    toolbar_sticky: true,
                    toolbar_location: 'top',
                    height: 'auto',
                    block_formats: 'Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3',
                    content_style: `
                        body { 
                            padding: 1rem;
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                            font-size: 16px;
                            line-height: 1.5;
                        }
                        h1 {
                            font-size: 2em;
                            margin-bottom: 0.5em;
                        }
                        h2 {
                            font-size: 1.5em;
                            margin-bottom: 0.5em;
                        }
                        h3 {
                            font-size: 1.17em;
                            margin-bottom: 0.5em;
                        }
                    `
                }}
                onEditorChange={handleEditorChange}
            />
            <p>Contenu édité : {content}</p>
        </div>
    );
};

export default TinyEditor;