import { NextRequest } from "next/server";
import { db } from "../../../../db";
import { chats } from "../../../../db/schema";
import { desc, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { decodeToken } from "@/lib/access-token";

export async function GET(req: NextRequest) {
  try {
    const token = cookies().get("accessToken")?.value;

    if (!token)
      return Response.json(
        { error: "user is not authorized" },
        { status: 400 }
      );

    const user = await decodeToken({ token });

    const allChats = await db
      .select()
      .from(chats)
      .where(eq(chats.userId, user.id))
      .orderBy(desc(chats.createdAt));

    return Response.json(
      { message: "request successful", chats: allChats },
      { status: 200 }
    );
  } catch (error) {
    return Response.json({ message: "request failed", error }, { status: 500 });
  }
}
