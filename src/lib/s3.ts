import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export async function uploadToS3(file: File) {
  try {
    const s3Client = new S3Client({
      credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY!,
        secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
      },
      region: "us-east-1",
    });

    const fileKey = `uploads/${Date.now().toString()}${file.name.replaceAll(
      " ",
      "-"
    )}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const params = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: fileKey,
      ContentType: "application/pdf",
      Body: buffer,
      ACL: "public-read",
    };

    await s3Client //@ts-ignore
      .send(new PutObjectCommand(params))
      .then((data) => console.log(`file uploaded successfully ${data}`));

    return { fileKey, fileName: file.name };
  } catch (error) {
    console.log(`request failed\n${error}`);
  }
}

export function getS3Url(fileKey: string) {
  return `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.amazonaws.com/${fileKey}`;
}
