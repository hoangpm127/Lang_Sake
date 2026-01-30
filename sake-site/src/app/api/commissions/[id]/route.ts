import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

// PATCH /api/commissions/[id] - Mark commission as paid (admin only)
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const userIdFromCookie = cookieStore.get("sake_user_id")?.value;
    const roleFromCookie = cookieStore.get("sake_role")?.value;

    if (!userIdFromCookie || roleFromCookie !== "admin") {
      return NextResponse.json(
        { ok: false, message: "Unauthorized. Admin only." },
        { status: 401 }
      );
    }

    const params = await context.params;
    const commissionId = params.id;

    const body = await req.json();
    const { isPaid } = body;

    if (typeof isPaid !== "boolean") {
      return NextResponse.json(
        { ok: false, message: "Invalid isPaid value" },
        { status: 400 }
      );
    }

    // Check if commission exists
    const existingCommission = await prisma.commission.findUnique({
      where: { id: commissionId },
    });

    if (!existingCommission) {
      return NextResponse.json(
        { ok: false, message: "Commission not found" },
        { status: 404 }
      );
    }

    // Update commission status
    const updatedCommission = await prisma.commission.update({
      where: { id: commissionId },
      data: { isPaid },
    });

    return NextResponse.json({
      ok: true,
      message: isPaid ? "Đã đánh dấu đã thanh toán" : "Đã đánh dấu chưa thanh toán",
      commission: updatedCommission,
    });
  } catch (error) {
    console.error("PATCH /api/commissions/[id] error:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
