"use client";

import React from "react";

type SidebarContextType = {
  showSidebar: boolean;
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
};

export const SidebarContext = React.createContext<
  SidebarContextType | undefined
>(undefined);

export default function SidebarContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showSidebar, setShowSidebar] = React.useState(false);
  return (
    <SidebarContext.Provider value={{ showSidebar, setShowSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}
