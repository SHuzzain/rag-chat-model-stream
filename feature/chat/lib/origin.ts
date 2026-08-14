import type { NextRequest } from "next/server";

export function isOriginAllowed(
  request: NextRequest,
  allowedDomains: string[]
) {
  if (!allowedDomains.length) return true;
  const originHeader =
    request.headers.get("origin") ?? request.headers.get("referer");
  if (!originHeader) return true;
  try {
    const host = new URL(originHeader).host;
    return allowedDomains.some(
      (domain) => host === domain || host.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}
