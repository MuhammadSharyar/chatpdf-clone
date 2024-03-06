"use client";

import React from "react";

type ChatType = {
  id: string;
  userId: string;
  chatName: string;
  fileLink: string;
};

type MessageType = {
  role: string;
  content: string;
};

type ChatsContextType = {
  selectedChat: ChatType | undefined;
  setSelectedChat: React.Dispatch<React.SetStateAction<ChatType | undefined>>;
  chats: ChatType[] | undefined;
  setChats: React.Dispatch<React.SetStateAction<ChatType[] | undefined>>;
  messages: MessageType[] | undefined;
  setMessages: React.Dispatch<React.SetStateAction<MessageType[] | undefined>>;
};

export const ChatsContext = React.createContext<ChatsContextType | undefined>(
  undefined
);

export default function ChatsContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedChat, setSelectedChat] = React.useState<
    ChatType | undefined
  >();
  const [chats, setChats] = React.useState<ChatType[] | undefined>();
  const [messages, setMessages] = React.useState<MessageType[] | undefined>();

  return (
    <ChatsContext.Provider
      value={{
        selectedChat,
        setSelectedChat,
        chats,
        setChats,
        messages,
        setMessages,
      }}
    >
      {children}
    </ChatsContext.Provider>
  );
}
