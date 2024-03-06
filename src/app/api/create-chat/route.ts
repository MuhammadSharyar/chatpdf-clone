import { decodeToken } from "@/lib/access-token";
import { getS3Url, uploadToS3 } from "@/lib/s3";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { db } from "../../../../db";
import { chats } from "../../../../db/schema";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as unknown as File;

    const s3File = await uploadToS3(file);

    if (!s3File)
      return Response.json(
        { error: "file upload failed, please try later" },
        { status: 500 }
      );

    const token = cookies().get("accessToken")?.value;

    if (!token)
      return Response.json({ error: "token not found" }, { status: 400 });

    const user = await decodeToken({ token });

    await db.insert(chats).values({
      userId: user.id,
      chatName: s3File.fileName,
      fileLink: getS3Url(s3File.fileKey),
    });

    return Response.json({ message: "request successful" }, { status: 201 });
  } catch (error) {
    return Response.json({ message: "request failed", error }, { status: 500 });
  }
}
