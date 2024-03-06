import { NextRequest } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { cookies } from "next/headers";
import { decodeToken } from "@/lib/access-token";

const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
  region: "us-east-1",
});

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get("chat-id");

    if (!chatId)
      return Response.json(
        { error: "chat-id is missing in params" },
        { status: 404 }
      );

    const data = await req.formData();
    const file = data.get("file") as unknown as File;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const token = cookies().get("accessToken")?.value;

    if (!token)
      return Response.json({ error: "token not found" }, { status: 400 });

    const user = await decodeToken({ token });

    const fileKey = `uploads/${
      user.id
    }/${chatId}/${Date.now().toString()}${file.name.replaceAll(" ", "-")}`;

    await s3Client
      .send(
        new PutObjectCommand({
          Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
          Key: fileKey,
          ContentType: "application/pdf",
          Body: buffer,
          ACL: "public-read",
        })
      )
      .then((data) => console.log(`file uploaded successfully ${data}`));

    return Response.json({ fileKey, fileName: file.name });
  } catch (error) {
    return Response.json({ message: "request failed", error });
  }
}
