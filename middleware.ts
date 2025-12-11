import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // If user opens root `/`, redirect to `/dss/management`
  if (req.nextUrl.pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/dss/management";
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}
