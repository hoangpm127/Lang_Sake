import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  
  // Clear all sake cookies
  response.cookies.set("sake_role", "", { path: "/", maxAge: 0 });
  response.cookies.set("sake_user_id", "", { path: "/", maxAge: 0 });
  response.cookies.set("sake_user_email", "", { path: "/", maxAge: 0 });
  
  return response;
}
