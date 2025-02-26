'use server'

import ChatBox from "@/components/shared/ChatBox";
import { getSession } from "next-auth/react";

export default async function ChatPage() {
  const session = await getSession();
  const user = session?.user || {
    id: "guest", email: "unknown", name: "Anonyme", image: "", address: ""
  }

  return (
    <div>
      <h1>Chat en Temps Réel</h1>
      <ChatBox user={user} />
    </div >
  );
}
