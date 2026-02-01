import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

/**
 * GET /api/admin/payments
 * Admin payment management API
 * - List all bookings with payment info
 * - Filter by payment status, date range
 * - Search by customer name, phone, transaction ref
 * - Manual deposit confirmation
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
    const paymentStatus = searchParams.get("paymentStatus") || "all"; // all, paid, unpaid, pending
    const source = searchParams.get("source") || "all";
    const search = searchParams.get("search") || "";
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    // Build where clause
    const where: any = {
      hasDeposit: true, // Only show bookings with deposit requirement
    };

    // Payment status filter
    if (paymentStatus === "paid") {
      where.depositPaid = true;
    } else if (paymentStatus === "unpaid") {
      where.depositPaid = false;
    } else if (paymentStatus === "pending") {
      where.depositPaid = false;
      where.status = "PENDING";
    }

    // Source filter
    if (source !== "all") {
      where.source = source;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      where.dateTime = {};
      if (dateFrom) {
        where.dateTime.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.dateTime.lte = new Date(dateTo);
      }
    }

    // Search filter (customer name, phone, bank ref)
    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { paymentBankRef: { contains: search, mode: "insensitive" } },
        { depositTransferContent: { contains: search, mode: "insensitive" } },
      ];
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate statistics
    const stats = {
      total: bookings.length,
      totalDeposit: bookings.reduce((sum: number, b: any) => sum + b.depositAmount, 0),
      paidCount: bookings.filter((b: any) => b.depositPaid).length,
      paidAmount: bookings
        .filter((b: any) => b.depositPaid)
        .reduce((sum: number, b: any) => sum + b.depositAmount, 0),
      unpaidCount: bookings.filter((b: any) => !b.depositPaid).length,
      unpaidAmount: bookings
        .filter((b: any) => !b.depositPaid)
        .reduce((sum: number, b: any) => sum + b.depositAmount, 0),
    };

    return NextResponse.json({
      ok: true,
      bookings,
      stats,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/payments
 * Manual payment actions:
 * - Confirm deposit (depositPaid = true)
 * - Mark as refunded
 * - Update payment reference
 */
export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const role = cookieStore.get("sake_role")?.value;

    if (role !== "admin") {
      return NextResponse.json(
        { ok: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { bookingId, action, paymentBankRef, notes } = body;

    if (!bookingId || !action) {
      return NextResponse.json(
        { ok: false, message: "Missing bookingId or action" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json(
        { ok: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    let updateData: any = {};

    switch (action) {
      case "confirm_deposit":
        updateData = {
          depositPaid: true,
          depositPaidAt: new Date(),
          status: "CONFIRMED",
        };
        if (paymentBankRef) {
          updateData.paymentBankRef = paymentBankRef;
        }
        if (notes) {
          updateData.internalNotes = notes;
        }
        break;

      case "mark_refunded":
        updateData = {
          status: "CANCELLED",
          internalNotes: `${booking.internalNotes || ""}\n[REFUND] ${
            notes || "Hoàn tiền cọc"
          }`,
        };
        break;

      case "update_reference":
        if (!paymentBankRef) {
          return NextResponse.json(
            { ok: false, message: "Missing payment reference" },
            { status: 400 }
          );
        }
        updateData = {
          paymentBankRef,
        };
        if (notes) {
          updateData.internalNotes = `${booking.internalNotes || ""}\n${notes}`;
        }
        break;

      default:
        return NextResponse.json(
          { ok: false, message: "Invalid action" },
          { status: 400 }
        );
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: updateData,
    });

    return NextResponse.json({
      ok: true,
      message: "Payment updated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Error updating payment:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
