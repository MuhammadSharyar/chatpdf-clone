"use client";

import React from "react";
import GoogleProvider from "../google-provider";
import { Righteous } from "next/font/google";
import { cn } from "@/lib/utils";
import EmailProvider from "./email-provider";

const righteous = Righteous({ subsets: ["latin"], weight: ["400"] });

export default function SignUpPage() {
  return (
    <main className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <div className="border shadow-lg p-14 rounded-lg">
        <h2 className={cn(righteous.className, "text-xl mb-5")}>ChatPdf</h2>
        <h4 className="font-semibold">Create your account</h4>
        <p className="text-sm text-slate-500 mb-5">to continue to ChatPdf</p>
        <GoogleProvider />
        <div className="flex items-center my-5">
          <hr className="w-full" />
          <p className="px-4 text-sm">or</p>
          <hr className="w-full" />
        </div>
        <EmailProvider />
      </div>
    </main>
  );
}
