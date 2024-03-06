"use client";

import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Righteous } from "next/font/google";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { PiListLight } from "react-icons/pi";
import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PiSignOutLight, PiGearSixLight, PiUserLight } from "react-icons/pi";
import { SidebarContext } from "@/contexts/sidebar-context";

const righteous = Righteous({ subsets: ["latin"], weight: ["400"] });

const getUserDetails = async () => {
  try {
    const res = await fetch("/api/get-user-details").then((res) => res.json());
    return res.user;
  } catch (error) {
    console.log(error);
  }
};

export default function Navbar() {
  const { showSidebar, setShowSidebar } = React.useContext(SidebarContext)!;
  const path = usePathname();
  if (path.includes("/auth")) return null;

  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState({
    id: "",
    name: "",
    email: "",
    picture: "",
  });

  const signOut = async () => {
    try {
      await fetch("/api/auth/sign-out");
    } catch (error) {
      console.log(error);
    }
  };

  React.useEffect(() => {
    getUserDetails().then((user) => {
      setLoading(true);
      setUser(user);
      setLoading(false);
    });
  }, []);

  return (
    <nav className="flex justify-between items-center h-[10vh] border-b px-5">
      <div className="flex items-center gap-x-4">
        {path === "/chats" ? (
          <PiListLight
            className="text-lg md:hidden"
            onClick={() => setShowSidebar(!showSidebar)}
          />
        ) : null}
        <h1 className={cn(righteous.className, "text-2xl")}>ChatPdf</h1>
      </div>
      <div className="flex items-center gap-x-2">
        <ThemeSwitcher />
        {loading ? (
          <Skeleton className="h-10 w-10 rounded-full" />
        ) : user ? (
          <Popover>
            <PopoverTrigger asChild>
              {user.picture ? (
                <Image
                  src={user.picture}
                  alt=""
                  height={40}
                  width={40}
                  sizes="100vw"
                  className="rounded-full border p-0.5 cursor-pointer"
                />
              ) : (
                <div>
                  <PiUserLight className="border h-10 w-10 p-2.5 rounded-full cursor-pointer" />
                </div>
              )}
            </PopoverTrigger>
            <PopoverContent>
              <div className="flex flex-col">
                <div className="flex items-center gap-x-2 mb-2">
                  {user.picture ? (
                    <Image
                      src={user.picture}
                      alt=""
                      height={40}
                      width={40}
                      sizes="100vw"
                      className="rounded-full border p-0.5"
                    />
                  ) : (
                    <PiUserLight className="border h-10 w-10 p-2.5 rounded-full cursor-pointer" />
                  )}

                  <div>
                    <h4 className="text-sm font-semibold">{user.name}</h4>
                    <p className="text-xs">{user.email}</p>
                  </div>
                </div>
                <Button
                  variant={"ghost"}
                  size={"sm"}
                  className="flex justify-start items-center gap-x-5"
                >
                  <PiGearSixLight className="text-slate-600 dark:text-white" />
                  <p className="text-xs">Manage account</p>
                </Button>
                <Button
                  variant={"ghost"}
                  size={"sm"}
                  className="flex justify-start items-center gap-x-5"
                  onClick={signOut}
                >
                  <PiSignOutLight className="text-slate-600 dark:text-white" />
                  <p className="text-xs">Sign out</p>
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          <Button>Sign in</Button>
        )}
      </div>
    </nav>
  );
}
