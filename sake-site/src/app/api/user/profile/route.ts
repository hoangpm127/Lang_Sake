import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("sake_user_id")?.value;

    if (!userId) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        referralCode: true,
        discountRate: true,
        commissionRate: true,
        membershipLevel: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, user });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Failed to get profile",
      },
      { status: 500 }
    );
  }
}
