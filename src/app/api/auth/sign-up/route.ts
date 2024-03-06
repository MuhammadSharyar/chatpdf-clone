import { NextRequest } from "next/server";
import { db } from "../../../../../db";
import { users } from "../../../../../db/schema";
import { eq } from "drizzle-orm";
import { generateAccessToken } from "@/lib/access-token";
import { setCookies } from "@/lib/cookies";
import CryptoJS from "crypto-js";

type UserDataType = {
  name: string;
  email: string;
  password: string;
};

export async function POST(req: NextRequest) {
  try {
    const userData: UserDataType = await req.json();

    if (Object.values(userData).some((val) => val === null || val === ""))
      return Response.json(
        { error: "please fill all fields" },
        { status: 400 }
      );

    let user = await db
      .select()
      .from(users)
      .limit(1)
      .where(eq(users.email, userData.email));

    if (user.length !== 0)
      return Response.json({ error: "user already exists" }, { status: 400 });

    userData.password = CryptoJS.AES.encrypt(
      userData.password,
      process.env.NEXT_PUBLIC_AES_SECRET!
    ).toString();

    user = await db
      .insert(users)
      .values({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        provider: "Email",
      })
      .returning();

    const accessToken = generateAccessToken({
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
  } catch (error) {
    return Response.json({ message: "request failed", error }, { status: 500 });
  }
}
