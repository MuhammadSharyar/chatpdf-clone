"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";

export default function GoogleProvider() {
  const { replace } = useRouter();
  const login = useGoogleLogin({
    onSuccess: async (creds) => {
      try {
        const userObject = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${creds.access_token}`,
            },
          }
        ).then((res) => res.json());

        const res = await fetch("/api/auth/sign-in?provider=google", {
          method: "POST",
          body: JSON.stringify(userObject),
        });

        if (res.ok) {
          replace("/");
        }
      } catch (error) {}
    },
    onError: (error) => {
      console.log(error);
    },
  });

  return (
    <Button variant={"outline"} onClick={() => login()}>
      <FcGoogle className="text-xl mr-4" />{" "}
      <p className="text-sm font-light">Continue with Google</p>
    </Button>
  );
}
