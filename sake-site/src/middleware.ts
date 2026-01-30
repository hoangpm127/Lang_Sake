import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const roleByPrefix: Record<string, string> = {
  "/dashboard/admin": "admin",
  "/dashboard/f1": "f1",
  "/dashboard/f2": "f2",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const roleCookie = request.cookies.get("sake_role")?.value;
  console.log(`[Middleware] Path: ${pathname}, Role Cookie: ${roleCookie}`);
  
  if (!roleCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("error", "unauthorized");
    return NextResponse.redirect(url);
  }

  if (pathname === "/dashboard") {
    const url = request.nextUrl.clone();
    // Customer doesn't have dashboard, redirect to home
    if (roleCookie === "customer") {
      url.pathname = "/";
    } else {
      url.pathname = `/dashboard/${roleCookie}`;
    }
    return NextResponse.redirect(url);
  }

  const requiredRole = Object.entries(roleByPrefix).find(([prefix]) =>
    pathname.startsWith(prefix)
  )?.[1];

  console.log(`[Middleware] Required Role: ${requiredRole}, User Role: ${roleCookie}`);

  if (requiredRole && roleCookie !== requiredRole) {
    console.log(`[Middleware] FORBIDDEN: Required ${requiredRole}, got ${roleCookie}`);
    const url = request.nextUrl.clone();
    url.pathname = `/dashboard/${roleCookie}`;
    url.searchParams.set("error", "forbidden");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
