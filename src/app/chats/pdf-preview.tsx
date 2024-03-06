"use client";

import { ChatsContext } from "@/contexts/chats-context";
import { useContext } from "react";

export default function PdfPreview() {
  const { selectedChat } = useContext(ChatsContext)!;
  return (
    <main className="flex">
      <iframe
        src={`https://docs.google.com/gview?url=${selectedChat?.fileLink}&embedded=true`}
        className="min-h-[91vh] w-full"
      ></iframe>
    </main>
  );
}
