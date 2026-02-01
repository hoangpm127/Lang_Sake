import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

/**
 * GET /api/analytics/overview
 * Analytics overview metrics
 * - Total revenue, bookings, customers
 * - Deposit rate, conversion rate
 * - Source breakdown
 * - Top performers
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
    const dateFilter: any = {};
    if (dateFrom || dateTo) {
      dateFilter.createdAt = {};
      if (dateFrom) {
        dateFilter.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        dateFilter.createdAt.lte = new Date(dateTo);
      }
    }

    // Fetch all bookings in date range
    const bookings = await prisma.booking.findMany({
      where: dateFilter,
      include: {
        customer: true,
        commissions: true,
      },
    });

    // Calculate metrics
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum: number, b: any) => sum + b.finalTotal, 0);
    const confirmedBookings = bookings.filter((b: any) => 
      b.status === "CONFIRMED" || b.status === "COMPLETED"
    ).length;
    const cancelledBookings = bookings.filter((b: any) => b.status === "CANCELLED").length;

    // Deposit metrics
    const bookingsWithDeposit = bookings.filter((b: any) => b.hasDeposit);
    const depositsPaid = bookingsWithDeposit.filter((b: any) => b.depositPaid).length;
    const depositRate = bookingsWithDeposit.length > 0
      ? (depositsPaid / bookingsWithDeposit.length) * 100
      : 0;
    const totalDepositValue = bookingsWithDeposit.reduce(
      (sum: number, b: any) => sum + b.depositAmount,
      0
    );

    // Conversion rate
    const conversionRate = totalBookings > 0 
      ? (confirmedBookings / totalBookings) * 100 
      : 0;

    // Source breakdown
    const sourceBreakdown = bookings.reduce((acc: any, b: any) => {
      const source = b.source;
      if (!acc[source]) {
        acc[source] = { count: 0, revenue: 0 };
      }
      acc[source].count++;
      acc[source].revenue += b.finalTotal;
      return acc;
    }, {});

    // Commission metrics
    const allCommissions = await prisma.commission.findMany({
      where: {
        ...dateFilter,
        status: { notIn: ["CANCELLED", "REJECTED"] },
      },
      include: {
        partner: true,
      },
    });

    const totalCommission = allCommissions.reduce(
      (sum: number, c: any) => sum + c.amount,
      0
    );
    const paidCommission = allCommissions
      .filter((c: any) => c.status === "PAID")
      .reduce((sum: number, c: any) => sum + c.amount, 0);
    const pendingCommission = allCommissions
      .filter((c: any) => c.status === "PENDING" || c.status === "APPROVED")
      .reduce((sum: number, c: any) => sum + c.amount, 0);

    // Top F1 partners
    const f1Performance = allCommissions
      .filter((c: any) => c.partner.role === "F1_PARTNER")
      .reduce((acc: any, c: any) => {
        const partnerId = c.partnerId;
        if (!acc[partnerId]) {
          acc[partnerId] = {
            id: partnerId,
            name: c.partner.name,
            email: c.partner.email,
            totalCommission: 0,
            bookingCount: 0,
            tier1: 0,
            tier2: 0,
          };
        }
        acc[partnerId].totalCommission += c.amount;
        acc[partnerId].bookingCount++;
        if (c.tier === 1) {
          acc[partnerId].tier1 += c.amount;
        } else if (c.tier === 2) {
          acc[partnerId].tier2 += c.amount;
        }
        return acc;
      }, {});

    const topF1Partners = Object.values(f1Performance)
      .sort((a: any, b: any) => b.totalCommission - a.totalCommission)
      .slice(0, 10);

    // Customer metrics
    const uniqueCustomers = new Set(
      bookings.filter((b: any) => b.customerId).map((b: any) => b.customerId)
    ).size;

    const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    return NextResponse.json({
      ok: true,
      metrics: {
        // Revenue metrics
        totalRevenue,
        avgBookingValue,
        totalDepositValue,

        // Booking metrics
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        conversionRate,

        // Deposit metrics
        depositRate,
        depositsPaid,
        depositsTotal: bookingsWithDeposit.length,

        // Commission metrics
        totalCommission,
        paidCommission,
        pendingCommission,

        // Customer metrics
        uniqueCustomers,
      },
      sourceBreakdown,
      topF1Partners,
    });
  } catch (error) {
    console.error("Error fetching analytics overview:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
