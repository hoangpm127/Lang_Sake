import { NextResponse } from "next/server";
export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set("sake_role", "", { path: "/", maxAge: 0 });
  response.cookies.set("sake_user", "", { path: "/", maxAge: 0 });
  return response;
}
