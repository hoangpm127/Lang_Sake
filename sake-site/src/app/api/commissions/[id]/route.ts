import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

// PATCH /api/commissions/[id] - Update commission status (admin only)
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
    const { 
      action, // 'approve', 'pay', 'reject', 'cancel'
      paymentMethod, 
      paymentRef, 
      paymentNotes,
      rejectionReason 
    } = body;

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

    let updateData: any = {};
    let message = "";

    switch (action) {
      case "approve":
        if (existingCommission.status !== "PENDING") {
          return NextResponse.json(
            { ok: false, message: "Chỉ có thể duyệt commission PENDING" },
            { status: 400 }
          );
        }
        updateData = {
          status: "APPROVED",
          approvedAt: new Date(),
          approvedBy: userIdFromCookie,
        };
        message = "Đã duyệt commission";
        break;

      case "pay":
        if (existingCommission.status !== "APPROVED") {
          return NextResponse.json(
            { ok: false, message: "Chỉ có thể thanh toán commission đã APPROVED" },
            { status: 400 }
          );
        }
        updateData = {
          status: "PAID",
          isPaid: true,
          paidAt: new Date(),
          paymentMethod,
          paymentRef,
          paymentNotes,
        };
        message = "Đã thanh toán commission";
        break;

      case "reject":
        if (existingCommission.status !== "PENDING") {
          return NextResponse.json(
            { ok: false, message: "Chỉ có thể từ chối commission PENDING" },
            { status: 400 }
          );
        }
        updateData = {
          status: "REJECTED",
          rejectedAt: new Date(),
          rejectedBy: userIdFromCookie,
          rejectionReason,
        };
        message = "Đã từ chối commission";
        break;

      case "cancel":
        updateData = {
          status: "CANCELLED",
        };
        message = "Đã hủy commission";
        break;

      default:
        return NextResponse.json(
          { ok: false, message: "Invalid action. Use: approve, pay, reject, cancel" },
          { status: 400 }
        );
    }

    // Update commission
    const updatedCommission = await prisma.commission.update({
      where: { id: commissionId },
      data: updateData,
    });

    return NextResponse.json({
      ok: true,
      message,
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
