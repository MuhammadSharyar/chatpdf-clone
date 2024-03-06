import { cookies } from "next/headers";

export const setCookies = ({ key, value }: { key: string; value: any }) => {
  cookies().set({
    name: key,
    value: value,
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
};
