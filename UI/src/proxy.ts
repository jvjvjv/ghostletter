import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

export const config = {
  matcher: ["/((?!sign-in|sign-up|terms|privacy|api|_next/static|_next/image|.*\\.(?:png|svg)$).*)"],
};

export default function proxy(req: NextRequest) {
  if (!req.cookies.has("auth")) return NextResponse.redirect(new URL("/sign-in", req.nextUrl));
  return NextResponse.next();
}
