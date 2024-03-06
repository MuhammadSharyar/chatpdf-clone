import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req: NextRequest) {
  const token = cookies().get("accessToken")?.value || "";

  const path = req.nextUrl.pathname;

  const isPublicPath = path === "/auth/sign-in" || path === "/auth/sign-up";

  if (isPublicPath && token) {
    try {
      const secret = new TextEncoder().encode(
        process.env.NEXT_PUBLIC_JWT_SECRET!
      );
      await jwtVerify(token, secret);
      return NextResponse.redirect(new URL("/", req.nextUrl));
    } catch (error) {
      return NextResponse.redirect(new URL("/auth/sign-in", req.nextUrl));
    }
  }

  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/auth/sign-in", req.nextUrl));
  }
}

export const config = { matcher: ["/auth/:path*", "/"] };
