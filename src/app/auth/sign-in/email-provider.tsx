"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import React from "react";

export default function EmailProvider() {
  const { replace } = useRouter();
  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    setError("");

    setLoading(true);

    const res = await fetch("/api/auth/sign-in?provider=email", {
      method: "POST",
      body: JSON.stringify(formData),
    }).then((res) => res.json());

    setLoading(false);

    if (res.error) {
      setError(res.error);
      return;
    }

    replace("/");
  };

  return (
    <form className="flex flex-col gap-y-2" onSubmit={handleSubmit}>
      <input
        type="email"
        name="email"
        placeholder="Email"
        className="bg-transparent border p-1.5 text-sm rounded-md w-full outline-none"
        onChange={handleInputChange}
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        className="bg-transparent border p-1.5 text-sm rounded-md w-full outline-none"
        onChange={handleInputChange}
      />
      {error && (
        <p className="text-xs text-red-500 first-letter:capitalize">{error}</p>
      )}
      <Button type="submit" className="">
        {loading ? <Spinner /> : "Sign in"}
      </Button>
    </form>
  );
}
