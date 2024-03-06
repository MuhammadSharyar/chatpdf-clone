import { NextRequest } from "next/server";
import { db } from "../../../../../db";
import { users } from "../../../../../db/schema";
import { eq } from "drizzle-orm";
import { generateAccessToken } from "@/lib/access-token";
import { setCookies } from "@/lib/cookies";
import CryptoJS from "crypto-js";

type GoogleUserDataType = {
  name: string;
  email: string;
  picture: string | null;
  email_verified: boolean;
};

type EmailUserDataType = {
  email: string;
  password: string;
};

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const provider = searchParams.get("provider");

    if (!provider)
      return Response.json(
        { error: "provider is missing in url params" },
        { status: 400 }
      );

    if (provider === "google") {
      const userData: GoogleUserDataType = await req.json();

      let user = await db
        .select()
        .from(users)
        .limit(1)
        .where(eq(users.email, userData.email));

      if (user.length === 0) {
        user = await db
          .insert(users)
          .values({
            name: userData.name,
            email: userData.email,
            emailVerified: userData.email_verified,
            picture: userData.picture,
            provider: "Google",
          })
          .returning();
      }

      const accessToken = await generateAccessToken({
        payload: {
          id: user[0].id,
          name: user[0].name,
          email: user[0].email,
          picture: user[0].picture,
          emailVerified: user[0].emailVerified,
          provider: user[0].provider,
        },
      });

      setCookies({ key: "accessToken", value: accessToken });

      return Response.json({ message: "request successful" }, { status: 200 });
    }
    if (provider === "email") {
      const userData: EmailUserDataType = await req.json();

      if (Object.values(userData).some((val) => val === null || val === ""))
        return Response.json(
          { error: "please fill all fields" },
          { status: 400 }
        );

      const user = await db
        .select()
        .from(users)
        .limit(1)
        .where(eq(users.email, userData.email));

      if (user.length === 0)
        return Response.json({ error: "user does not exist" }, { status: 400 });

      var bytes = CryptoJS.AES.decrypt(
        user[0].password!,
        process.env.NEXT_PUBLIC_AES_SECRET!
      );
      var originalPassword = bytes.toString(CryptoJS.enc.Utf8);

      if (originalPassword !== userData.password)
        return Response.json(
          { error: "email or password is invalid" },
          { status: 400 }
        );

      const accessToken = await generateAccessToken({
        payload: {
          id: user[0].id,
          name: user[0].name,
          email: user[0].email,
          picture: user[0].picture,
          emailVerified: user[0].emailVerified,
          provider: user[0].provider,
        },
      });

      console.log(accessToken);

      setCookies({ key: "accessToken", value: accessToken });

      return Response.json({ message: "request successful" }, { status: 200 });
    }
  } catch (error) {
    return Response.json({ message: "request failed", error }, { status: 500 });
  }
}
