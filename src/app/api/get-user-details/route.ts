import { decodeToken } from "@/lib/access-token";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const token = cookies().get("accessToken")!.value;
    const user = await decodeToken({ token });
    return Response.json(
      { message: "request successful", user },
      { status: 200 }
    );
  } catch (error) {
    return Response.json({ message: "request failed", error }, { status: 500 });
  }
}
