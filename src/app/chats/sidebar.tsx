"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatsContext } from "@/contexts/chats-context";
import { SidebarContext } from "@/contexts/sidebar-context";
import { checkSubscription } from "@/lib/subscription";
import { cn } from "@/lib/utils";
import React, { useContext } from "react";
import { useDropzone } from "react-dropzone";
import { BsStars } from "react-icons/bs";
import { PiPlusLight } from "react-icons/pi";

type ChatType = {
  id: string;
  userId: string;
  chatName: string;
  fileLink: string;
};

const getChats = async (): Promise<ChatType[]> => {
  const res = await fetch("/api/get-chats").then((res) => res.json());
  return res.chats;
};

const handleSubscription = async () => {
  try {
    const response = await fetch("/api/stripe").then((res) => res.json());
    window.location.href = response.url;
  } catch (error) {
    console.error(error);
  }
};

export default function Sidebar() {
  const { chats, setChats, selectedChat, setSelectedChat } =
    useContext(ChatsContext)!;
  const { showSidebar, setShowSidebar } = useContext(SidebarContext)!;
  const [loading, setLoading] = React.useState(true);
  const [subscription, setSubscription] = React.useState(false);

  const handleSubscription = async () => {
    try {
      const response = await fetch("/api/stripe").then((res) => res.json());
      window.location.href = response.url;
    } catch (error) {
      console.error(error);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file.size > 10 * 1024 * 1024) {
        //bigger than 10mb!
        alert("Please upload a smaller file");
        return;
      }
      try {
        setLoading(true);
        const data = new FormData();
        data.append("file", file);

        const res = await fetch("/api/create-chat", {
          method: "POST",
          body: data,
        }).then((res) => res.json());

        getChats().then((chats) => {
          setChats(chats);
          setSelectedChat(chats[0]);
        });
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log("file upload failed", error);
      }
    },
  });

  React.useEffect(() => {
    setLoading(true);
    getChats().then((chats) => {
      setChats(chats);
      setSelectedChat(chats[0]);
    });
    checkSubscription().then((res) => setSubscription(res));
    setLoading(false);
  }, []);

  return (
    <aside
      className={cn(
        "p-3 flex flex-col justify-between absolute md:relative z-50 md:z-0 bg-background w-[80%] md:w-auto transition-all",
        showSidebar ? "translate-x-0" : "-translate-x-[100%] md:translate-x-0"
      )}
    >
      <div>
        <div className="mb-3">
          <div
            {...getRootProps({
              className:
                "border-dashed border rounded-md cursor-pointer flex flex-col justify-center items-center p-2 hover:border-blue-700 transition-all",
            })}
          >
            <input {...getInputProps()} />
            <>
              <p className="text-xs font-semibold leading-3 flex items-center gap-x-1.5">
                <PiPlusLight className="text-md text-slate-400" /> New Chat
              </p>
              <p className="mt-2 text-xs text-slate-400 leading-3">
                Drop PDF Here
              </p>
            </>
          </div>
        </div>
        <ul className="h-[69vh] overflow-y-scroll scrollbar-hide scroll-smooth">
          {loading ? (
            <ChatSkeleton />
          ) : !chats ? null : chats.length === 0 ? null : (
            chats.map((chat, i) => (
              <li key={i}>
                <Button
                  size={"sm"}
                  variant={"outline"}
                  className={cn(
                    "w-full flex justify-between mb-2 text-xs",
                    selectedChat?.id === chat.id ? "bg-secondary" : ""
                  )}
                  onClick={() => {
                    setSelectedChat(chat);
                    setShowSidebar(false);
                  }}
                >
                  {chat.chatName}
                </Button>
              </li>
            ))
          )}
        </ul>
      </div>
      <Button
        size={"sm"}
        className="flex justify-between"
        onClick={handleSubscription}
      >
        {subscription ? "Manage Subscription" : "Get Pro"}
        <BsStars />
      </Button>
    </aside>
  );
}

function ChatSkeleton() {
  return (
    <ul>
      {Array.from({ length: 3 }).map((item, i) => (
        <Skeleton className="h-7 mb-2" />
      ))}
    </ul>
  );
}
