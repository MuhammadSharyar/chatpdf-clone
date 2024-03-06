import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "./navbar";
import Script from "next/script";
import { GoogleOAuthProvider } from "@react-oauth/google";
import ChatsContextProvider from "@/contexts/chats-context";
import SidebarContextProvider from "@/contexts/sidebar-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ChatPdf",
  description:
    "Join millions of students, researchers and professionals to instantly answer questions and understand research with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SidebarContextProvider>
              <Navbar />
              <ChatsContextProvider>{children}</ChatsContextProvider>
            </SidebarContextProvider>
          </ThemeProvider>
        </body>
      </html>
    </GoogleOAuthProvider>
  );
}
