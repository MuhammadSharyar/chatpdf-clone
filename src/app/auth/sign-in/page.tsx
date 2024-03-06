"use client";

import React from "react";
import GoogleProvider from "../google-provider";
import { Righteous } from "next/font/google";
import { cn } from "@/lib/utils";
import EmailProvider from "./email-provider";
import Link from "next/link";

const righteous = Righteous({ subsets: ["latin"], weight: ["400"] });

export default function SignInPage() {
  return (
    <main className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <div className="border p-14 shadow-lg rounded-lg">
        <h2 className={cn(righteous.className, "text-xl mb-5")}>ChatPdf</h2>
        <h4 className="font-semibold">Sign in</h4>
        <p className="text-sm text-slate-500 mb-5">to continue to ChatPdf</p>
        <GoogleProvider />
        <div className="flex items-center my-5">
          <hr className="w-full" />
          <p className="px-4 text-sm">or</p>
          <hr className="w-full" />
        </div>
        <EmailProvider />
        <p className="text-xs text-right mt-2">
          Do not have an account?{" "}
          <Link
            href={"/auth/sign-up"}
            className="underline hover:text-blue-700 transition-all"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
