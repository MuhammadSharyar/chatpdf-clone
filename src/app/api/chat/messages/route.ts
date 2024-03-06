import { NextRequest } from "next/server";
import { db } from "../../../../../db";
import { chatMessages } from "../../../../../db/schema";
import { asc, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const chatId = searchParams.get("chat-id");
    if (!chatId)
      return Response.json(
        { error: "chat-id is missing in params" },
        { status: 404 }
      );

    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.chatId, chatId))
      .orderBy(asc(chatMessages.createdAt));

    return Response.json(
      { message: "request successful", messages },
      { status: 200 }
    );
  } catch (error) {
    return Response.json({ message: "request failed", error }, { status: 500 });
  }
}
