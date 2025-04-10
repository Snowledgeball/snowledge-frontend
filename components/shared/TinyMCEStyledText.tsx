import React from "react";

interface TinyMCEStyledTextProps {
  content: string;
}

export default function TinyMCEStyledText({ content }: TinyMCEStyledTextProps) {
  return (
    <div
      className="tinymce-content prose prose-sm max-w-none text-ellipsis overflow-hidden"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
