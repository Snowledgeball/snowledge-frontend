import React from "react";

export default function TinyMCEStyledText({ content }: { content: string }) {
  return (
    <div id="post-preview-content">
      <style jsx global>{`
        #post-preview-content h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          color: #1f2937;
          line-height: 1.3;
        }
        #post-preview-content h2 {
          font-size: 1.75rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          color: #1f2937;
          line-height: 1.3;
        }
        #post-preview-content h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.75rem;
          color: #1f2937;
        }
        #post-preview-content p {
          margin-bottom: 1rem;
          line-height: 1.7;
          color: #4b5563;
        }
        #post-preview-content ul,
        #post-preview-content ol {
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }
        #post-preview-content ul {
          list-style-type: disc;
        }
        #post-preview-content ol {
          list-style-type: decimal;
        }
        #post-preview-content a {
          color: #2563eb;
          text-decoration: underline;
        }
        #post-preview-content blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          font-style: italic;
          color: #6b7280;
          margin: 1.5rem 0;
        }
        #post-preview-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1.5rem 0;
        }
        #post-preview-content pre {
          background-color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1.5rem 0;
        }
        #post-preview-content code {
          background-color: #f3f4f6;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: monospace;
        }
        #post-preview-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
        }
        #post-preview-content th,
        #post-preview-content td {
          border: 1px solid #e5e7eb;
          padding: 0.5rem;
        }
        #post-preview-content th {
          background-color: #f9fafb;
          font-weight: 600;
        }
      `}</style>
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
