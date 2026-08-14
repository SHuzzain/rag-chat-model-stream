import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getSessionCookie } from "better-auth/cookies";

const PUBLIC_EXACT = new Set(["/", "/sign-in"]);

function isPublicPath(pathname: string) {
  if (PUBLIC_EXACT.has(pathname)) return true;
  return (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/b/") ||
    pathname.startsWith("/embed/") ||
    pathname.startsWith("/api/chat/v1") ||
    pathname.startsWith("/sign-in")
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) return NextResponse.next();

  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api)(.*)",
  ],
};
