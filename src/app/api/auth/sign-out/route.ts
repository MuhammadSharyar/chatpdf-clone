import { decodeToken } from "@/lib/access-token";
import { googleLogout } from "@react-oauth/google";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const token = cookies().get("accessToken")!.value;
    const user = await decodeToken({ token });
    cookies().delete("accessToken");
    if (user.provider === "Google") {
      googleLogout();
    }
    return Response.json({ message: "request successful" }, { status: 200 });
  } catch (error) {
    return Response.json({ message: "request failed", error }, { status: 500 });
  }
}
