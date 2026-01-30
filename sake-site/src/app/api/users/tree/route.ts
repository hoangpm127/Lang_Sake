import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

/**
 * GET /api/users/tree - Lấy cấu trúc cây users (Admin → F1 → F2)
 * Chỉ admin mới được xem
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const roleFromCookie = cookieStore.get("sake_role")?.value;

    if (roleFromCookie !== "admin") {
      return NextResponse.json(
        { ok: false, message: "Forbidden - Admin only" },
        { status: 403 }
      );
    }

    // Lấy admin users
    const admins = await prisma.user.findMany({
      where: {
        role: "ADMIN",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        referralCode: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Lấy tất cả F1 partners
    const f1Partners = await prisma.user.findMany({
      where: {
        role: "F1_PARTNER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        referralCode: true,
        isActive: true,
        commissionRate: true,
        totalCommission: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Lấy tất cả F2 members với thông tin người giới thiệu
    const f2Members = await prisma.user.findMany({
      where: {
        role: "F2_MEMBER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        referralCode: true,
        isActive: true,
        discountRate: true,
        totalCommission: true,
        referredById: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Lấy số liệu thống kê cho từng user
    const bookingStats = await prisma.booking.groupBy({
      by: ["createdById"],
      where: {
        status: {
          not: "CANCELLED",
        },
      },
      _count: {
        id: true,
      },
      _sum: {
        finalTotal: true,
      },
    });

    const statsMap = new Map(
      bookingStats.map((stat) => [
        stat.createdById,
        {
          bookingCount: stat._count.id,
          totalRevenue: stat._sum.finalTotal || 0,
        },
      ])
    );

    // Build tree structure
    const tree = admins.map((admin) => ({
      ...admin,
      stats: statsMap.get(admin.id) || { bookingCount: 0, totalRevenue: 0 },
      children: f1Partners.map((f1) => ({
        ...f1,
        stats: statsMap.get(f1.id) || { bookingCount: 0, totalRevenue: 0 },
        children: f2Members
          .filter((f2) => f2.referredById === f1.id)
          .map((f2) => ({
            ...f2,
            stats: statsMap.get(f2.id) || { bookingCount: 0, totalRevenue: 0 },
            children: [],
          })),
      })),
    }));

    return NextResponse.json({ ok: true, tree });
  } catch (error) {
    console.error("Get users tree error:", error);
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Lỗi lấy cấu trúc cây",
      },
      { status: 500 }
    );
  }
}
