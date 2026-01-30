import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

// GET /api/commissions/history - Get commission history for F1/F2
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

    // Only F1 and F2 can access their commission history
    if (roleFromCookie !== "f1" && roleFromCookie !== "f2") {
      return NextResponse.json(
        { ok: false, message: "Forbidden. Only F1/F2 can view commission history." },
        { status: 403 }
      );
    }

    // Get commissions for this partner
    const commissions = await prisma.commission.findMany({
      where: {
        partnerId: userIdFromCookie,
      },
      include: {
        booking: {
          select: {
            id: true,
            customerName: true,
            phone: true,
            dateTime: true,
            finalTotal: true,
            status: true,
            source: true,
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate stats
    const stats = {
      total: commissions.length,
      pending: commissions.filter((c) => c.status === "PENDING").length,
      approved: commissions.filter((c) => c.status === "APPROVED").length,
      paid: commissions.filter((c) => c.status === "PAID").length,
      rejected: commissions.filter((c) => c.status === "REJECTED").length,
      totalAmount: commissions.reduce((sum, c) => sum + c.amount, 0),
      pendingAmount: commissions
        .filter((c) => c.status === "PENDING")
        .reduce((sum, c) => sum + c.amount, 0),
      approvedAmount: commissions
        .filter((c) => c.status === "APPROVED")
        .reduce((sum, c) => sum + c.amount, 0),
      paidAmount: commissions
        .filter((c) => c.status === "PAID")
        .reduce((sum, c) => sum + c.amount, 0),
      // Tier breakdown
      tier1Count: commissions.filter((c) => c.tier === 1).length,
      tier2Count: commissions.filter((c) => c.tier === 2).length,
      tier1Amount: commissions
        .filter((c) => c.tier === 1)
        .reduce((sum, c) => sum + c.amount, 0),
      tier2Amount: commissions
        .filter((c) => c.tier === 2)
        .reduce((sum, c) => sum + c.amount, 0),
    };

    // For F2, also get their F1 manager's commission from their bookings
    let f1ManagerCommissions = null;
    if (roleFromCookie === "f2") {
      const user = await prisma.user.findUnique({
        where: { id: userIdFromCookie },
        select: { referredById: true },
      });

      if (user?.referredById) {
        f1ManagerCommissions = await prisma.commission.findMany({
          where: {
            partnerId: user.referredById,
            tier: 2, // F1 manager's tier 2 commissions
            booking: {
              customerId: userIdFromCookie,
            },
          },
          include: {
            partner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            booking: {
              select: {
                id: true,
                customerName: true,
                dateTime: true,
                finalTotal: true,
                status: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });
      }
    }

    return NextResponse.json({
      ok: true,
      commissions,
      stats,
      f1ManagerCommissions,
    });
  } catch (error) {
    console.error("GET /api/commissions/history error:", error);
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
