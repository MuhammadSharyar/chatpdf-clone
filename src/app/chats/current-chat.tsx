"use client";

import { Button } from "@/components/ui/button";
import { AiOutlineSend } from "react-icons/ai";
import React from "react";
import { ChatsContext } from "@/contexts/chats-context";
import { Skeleton } from "@/components/ui/skeleton";

type MessageType = {
  id: string;
  role: string;
  content: string;
};

export default function CurrentChat() {
  const { selectedChat } = React.useContext(ChatsContext)!;
  const [prompt, setPrompt] = React.useState("");
  const [messages, setMessages] = React.useState<MessageType[]>([]);
  const messageEndRef = React.useRef<null | HTMLDivElement>(null);
  const [messageLoading, setMessageLoading] = React.useState(false);

  const getMessages = async () => {
    const res = await fetch(
      `/api/chat/messages?chat-id=${selectedChat?.id}`
    ).then((res) => res.json());
    return res.messages;
  };

  const handleChat = async () => {
    setMessageLoading(true);
    const res = await fetch(`/api/chat`, {
      method: "POST",
      body: JSON.stringify({
        prompt,
        fileLink: selectedChat?.fileLink,
        chatId: selectedChat?.id,
      }),
    }).then((res) => res.json());
    setPrompt("");
    setMessageLoading(false);
    setMessages(res.messages);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessages([...messages, { id: "", role: "user", content: prompt }]);
    await handleChat();
  };

  React.useEffect(() => {
    if (selectedChat) {
      getMessages().then((messages) => setMessages(messages));
    }
  }, [selectedChat]);

  React.useEffect(() => {
    messageEndRef.current?.scrollIntoView();
  }, [messages]);

  return (
    <main className="py-1 px-3 md:p-3  flex flex-col justify-between md:h-[91vh]">
      <div>
        <h3 className="mb-5">Chat</h3>
        <ul className="h-[68vh] overflow-y-auto scrollbar-hide scroll-smooth">
          {messages.map((m) => (
            <li key={m.id}>
              {m.role === "user" ? (
                <p className="text-xs border rounded-sm p-2 ml-10 bg-secondary text-secondary-foreground mb-2">
                  {m.content}
                </p>
              ) : (
                <p className="text-xs border rounded-sm p-2 mb-2">
                  {m.content}
                </p>
              )}
            </li>
          ))}
          {messageLoading ? <Skeleton className="rounded-sm p-3 mb-2" /> : null}
          <div ref={messageEndRef} />
        </ul>
      </div>
      <form className="flex z-20" onSubmit={handleSubmit}>
        <input
          className="flex-1 bg-transparent border rounded-l-md p-2 md:text-xs outline-none"
          placeholder="Ask any question..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <Button size={"icon"} className="rounded-l-none h-auto" type="submit">
          <AiOutlineSend />
        </Button>
      </form>
    </main>
  );
}
