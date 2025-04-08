import React from "react";

interface TinyMCEStyledTextProps {
  content: string;
}

export default function TinyMCEStyledText({ content }: TinyMCEStyledTextProps) {
  return (
    <div
      className="tinymce-content diff-view-container prose prose-sm"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
