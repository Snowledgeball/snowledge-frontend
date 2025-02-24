'use client'

import TinyEditor from "@/components/shared/TinyEditor";
import { useState } from "react";
export default function TestPage() {
    const [content, setContent] = useState("");
    return <TinyEditor commentMode={true} initialValue={content} onChange={function (content: string): void {
        setContent(content);
        console.log(content);
    }} />;
}