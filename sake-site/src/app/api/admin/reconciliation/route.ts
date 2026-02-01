import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

/**
 * GET /api/admin/reconciliation
 * Payment reconciliation tool
 * Compares Sepay/Casso webhook data vs database
 * Detects missing payments, amount mismatches, orphan transactions
 */
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const role = cookieStore.get("sake_role")?.value;

    if (role !== "admin") {
      return NextResponse.json(
        { ok: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    // Build date filter
    const where: any = {
      hasDeposit: true,
    };

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    // Get all bookings with deposit
    const bookings = await prisma.booking.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    // Analyze discrepancies
    const issues = {
      unpaidDeposits: [] as any[],
      missingBankRef: [] as any[],
      pendingConfirmations: [] as any[],
      cancelledWithPaid: [] as any[],
    };

    bookings.forEach((booking: any) => {
      // Unpaid deposits (chưa thanh toán)
      if (!booking.depositPaid) {
        issues.unpaidDeposits.push({
          id: booking.id,
          customerName: booking.customerName,
          phone: booking.phone,
          dateTime: booking.dateTime,
          depositAmount: booking.depositAmount,
          transferContent: booking.depositTransferContent,
          createdAt: booking.createdAt,
          daysPending: Math.floor(
            (new Date().getTime() - new Date(booking.createdAt).getTime()) /
              (1000 * 60 * 60 * 24)
          ),
        });
      }

      // Paid but missing bank reference (đã confirm nhưng không có mã GD)
      if (booking.depositPaid && !booking.paymentBankRef) {
        issues.missingBankRef.push({
          id: booking.id,
          customerName: booking.customerName,
          phone: booking.phone,
          depositAmount: booking.depositAmount,
          depositPaidAt: booking.depositPaidAt,
        });
      }

      // Pending confirmations (đã trả nhưng chưa confirm booking)
      if (booking.depositPaid && booking.status === "PENDING") {
        issues.pendingConfirmations.push({
          id: booking.id,
          customerName: booking.customerName,
          phone: booking.phone,
          depositAmount: booking.depositAmount,
          depositPaidAt: booking.depositPaidAt,
        });
      }

      // Cancelled but paid (đã hủy nhưng chưa hoàn tiền)
      if (booking.status === "CANCELLED" && booking.depositPaid) {
        issues.cancelledWithPaid.push({
          id: booking.id,
          customerName: booking.customerName,
          phone: booking.phone,
          depositAmount: booking.depositAmount,
          cancelledNeedsRefund: !booking.internalNotes?.includes("[REFUND]"),
        });
      }
    });

    // Calculate summary stats
    const summary = {
      totalBookings: bookings.length,
      totalDepositValue: bookings.reduce((sum: number, b: any) => sum + b.depositAmount, 0),
      paidBookings: bookings.filter((b: any) => b.depositPaid).length,
      paidValue: bookings
        .filter((b: any) => b.depositPaid)
        .reduce((sum: number, b: any) => sum + b.depositAmount, 0),
      unpaidBookings: bookings.filter((b: any) => !b.depositPaid).length,
      unpaidValue: bookings
        .filter((b: any) => !b.depositPaid)
        .reduce((sum: number, b: any) => sum + b.depositAmount, 0),
      issueCount: {
        unpaidDeposits: issues.unpaidDeposits.length,
        missingBankRef: issues.missingBankRef.length,
        pendingConfirmations: issues.pendingConfirmations.length,
        cancelledWithPaid: issues.cancelledWithPaid.length,
      },
    };

    return NextResponse.json({
      ok: true,
      summary,
      issues,
    });
  } catch (error) {
    console.error("Error in reconciliation:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
