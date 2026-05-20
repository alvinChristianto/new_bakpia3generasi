// middleware.ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");

  if (isDashboard && !isLoggedIn) {
    // Jika mencoba akses dashboard tapi belum login, lempar ke login
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  return NextResponse.next();
});

// Tentukan route mana saja yang perlu dicek oleh middleware ini
export const config = {
  matcher: ["/dashboard/:path*"],
};
