import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

// GET /api/commissions - Get all commissions (admin) or own commissions (F1)
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userIdFromCookie = cookieStore.get("sake_user_id")?.value;
    const roleFromCookie = cookieStore.get("sake_role")?.value;

    if (!userIdFromCookie || !roleFromCookie) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    let commissions;
    
    if (roleFromCookie === "admin") {
      // Admin can see all commissions
      commissions = await prisma.commission.findMany({
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
    } else if (roleFromCookie === "f1") {
      // F1 partners can only see their own commissions
      commissions = await prisma.commission.findMany({
        where: {
          partnerId: userIdFromCookie,
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
    } else if (roleFromCookie === "f2") {
      // F2 members can see their own tier 1 commissions
      commissions = await prisma.commission.findMany({
        where: {
          partnerId: userIdFromCookie,
          tier: 1, // F2 only gets tier 1 commissions
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
    } else {
      return NextResponse.json(
        { ok: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    // Calculate stats
    const stats = {
      totalCommissions: commissions.length,
      paidCommissions: commissions.filter((c: any) => c.isPaid).length,
      unpaidCommissions: commissions.filter((c: any) => !c.isPaid).length,
      totalAmount: commissions.reduce((sum: number, c: any) => sum + c.amount, 0),
      paidAmount: commissions.filter((c: any) => c.isPaid).reduce((sum: number, c: any) => sum + c.amount, 0),
      unpaidAmount: commissions.filter((c: any) => !c.isPaid).reduce((sum: number, c: any) => sum + c.amount, 0),
    };

    return NextResponse.json({
      ok: true,
      commissions,
      stats,
    });
  } catch (error) {
    console.error("GET /api/commissions error:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
