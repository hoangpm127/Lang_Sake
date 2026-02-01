import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const roleFromCookie = cookieStore.get("sake_role")?.value;
    const userIdFromCookie = cookieStore.get("sake_user_id")?.value;

    if (!roleFromCookie || !userIdFromCookie) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Chỉ F1 Partner mới được xem danh sách F2
    if (roleFromCookie !== "f1") {
      return NextResponse.json(
        { ok: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    // Lấy tất cả F2 members được giới thiệu bởi F1 này
    const f2Members = await prisma.user.findMany({
      where: {
        role: "F2_MEMBER",
        referredById: userIdFromCookie,
        isActive: true,
      },
      include: {
        bookingsAsCustomer: {
          where: {
            status: {
              not: "CANCELLED",
            },
          },
          select: {
            id: true,
            finalTotal: true,
            status: true,
            dateTime: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Tính toán stats cho từng F2
    const f2Stats = f2Members.map((f2: typeof f2Members[0]) => {
      const totalBookings = f2.bookingsAsCustomer.length;
      const totalRevenue = f2.bookingsAsCustomer.reduce((sum: number, b: { finalTotal: number }) => sum + b.finalTotal, 0);
      const completedBookings = f2.bookingsAsCustomer.filter((b: { status: string }) => b.status === "COMPLETED").length;

      return {
        id: f2.id,
        name: f2.name,
        email: f2.email,
        phone: f2.phone,
        referralCode: f2.referralCode,
        discountRate: f2.discountRate,
        createdAt: f2.createdAt,
        stats: {
          totalBookings,
          totalRevenue,
          completedBookings,
          tier1Commission: totalRevenue * 0.1, // F2 tier 1: 10%
        },
      };
    });

    return NextResponse.json({ ok: true, f2Members: f2Stats });
  } catch (error) {
    console.error("Get F2 members error:", error);
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Lỗi lấy danh sách F2.",
      },
      { status: 500 }
    );
  }
}
