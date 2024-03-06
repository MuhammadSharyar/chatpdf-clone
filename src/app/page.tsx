"use client";

import { Button } from "@/components/ui/button";
import { checkSubscription } from "@/lib/subscription";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { useDropzone } from "react-dropzone";
import { LuInbox } from "react-icons/lu";

const getChats = async () => {
  const res = await fetch("/api/get-chats").then((res) => res.json());
  return res.chats;
};

const handleSubscription = async (subscription: boolean) => {
  try {
    const response = await fetch("/api/stripe").then((res) => res.json());
    window.location.href = response.url;
  } catch (error) {
    console.error(error);
  }
};

export default function Home() {
  const [subscription, setSubscription] = React.useState(false);
  const [chats, setChats] = React.useState([]);
  React.useEffect(() => {
    getChats().then((chats) => setChats(chats));
    checkSubscription().then((res) => setSubscription(res));
  });
  return (
    <main className="flex h-[90vh] justify-center items-center">
      <div className="text-center w-[90%] sm:w-[80%] md:w-[60%] lg:w-[50%]">
        <h2 className="text-3xl font-bold mb-2">Chat with any PDF</h2>
        <p className="mb-5">
          Join millions of students, researchers and professionals to instantly
          answer questions and understand research with AI
        </p>
        <div className="mb-2">
          {chats.length > 0 ? (
            <Link href={"/chats"}>
              <Button size={"sm"} className="mr-4">
                Go to Chats
              </Button>
            </Link>
          ) : null}
          {subscription ? (
            <Button
              size={"sm"}
              variant={"outline"}
              onClick={() => handleSubscription(subscription)}
            >
              {subscription ? "Manage Subscription" : "Get Pro"}
            </Button>
          ) : null}
        </div>
        <FileUpload />
      </div>
    </main>
  );
}

function FileUpload() {
  const { push } = useRouter();
  const [loading, setLoading] = React.useState(false);
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (loading) return;

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

        setLoading(false);
        push("/chats");
      } catch (error) {
        setLoading(false);
        console.log("file upload failed", error);
      }
    },
  });
  return (
    <div className="p-2 rounded-xl hover:scale-105 active:scale-100 transition-all">
      <div
        {...getRootProps({
          className:
            "border-dashed border-2 rounded-xl cursor-pointer py-8 flex flex-col justify-center items-center",
        })}
      >
        <input {...getInputProps()} />
        <>
          <LuInbox
            className={cn(
              "w-10 h-10",
              loading ? "text-gray-600" : "text-blue-700"
            )}
          />
          <p className="mt-2 text-sm text-slate-400">
            {loading ? "Uploading ..." : "Drop PDF Here"}
          </p>
        </>
      </div>
    </div>
  );
}
