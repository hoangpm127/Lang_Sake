import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

/**
 * GET /api/analytics/trends
 * Time-series analytics data for charts
 * - Revenue over time
 * - Bookings over time
 * - Commission trends
 * - Deposit rate trends
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
    const groupBy = searchParams.get("groupBy") || "day"; // day, week, month

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

    // Fetch bookings
    const bookings = await prisma.booking.findMany({
      where: dateFilter,
      orderBy: {
        createdAt: "asc",
      },
    });

    // Fetch commissions
    const commissions = await prisma.commission.findMany({
      where: {
        ...dateFilter,
        status: { notIn: ["CANCELLED", "REJECTED"] },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Group data by time period
    const groupData = (items: any[], getValue: (item: any) => number) => {
      const grouped: { [key: string]: { count: number; value: number } } = {};

      items.forEach((item: any) => {
        const date = new Date(item.createdAt);
        let key: string;

        if (groupBy === "day") {
          key = date.toISOString().split("T")[0]; // YYYY-MM-DD
        } else if (groupBy === "week") {
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split("T")[0];
        } else {
          // month
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        }

        if (!grouped[key]) {
          grouped[key] = { count: 0, value: 0 };
        }
        grouped[key].count++;
        grouped[key].value += getValue(item);
      });

      return Object.entries(grouped)
        .map(([date, data]) => ({
          date,
          count: data.count,
          value: data.value,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
    };

    // Revenue trend
    const revenueTrend = groupData(bookings, (b: any) => b.finalTotal);

    // Bookings trend
    const bookingsTrend = groupData(bookings, () => 1).map((item) => ({
      date: item.date,
      total: item.count,
      confirmed: bookings
        .filter(
          (b: any) =>
            (b.status === "CONFIRMED" || b.status === "COMPLETED") &&
            new Date(b.createdAt).toISOString().split("T")[0] === item.date
        )
        .length,
      cancelled: bookings
        .filter(
          (b: any) =>
            b.status === "CANCELLED" &&
            new Date(b.createdAt).toISOString().split("T")[0] === item.date
        )
        .length,
    }));

    // Commission trend
    const commissionTrend = groupData(commissions, (c: any) => c.amount);

    // Deposit rate trend
    const depositTrend = revenueTrend.map((item) => {
      const dateBookings = bookings.filter(
        (b: any) => new Date(b.createdAt).toISOString().split("T")[0] === item.date
      );
      const withDeposit = dateBookings.filter((b: any) => b.hasDeposit);
      const paid = withDeposit.filter((b: any) => b.depositPaid);

      return {
        date: item.date,
        depositRate: withDeposit.length > 0 ? (paid.length / withDeposit.length) * 100 : 0,
        totalDeposit: withDeposit.length,
        paidDeposit: paid.length,
      };
    });

    // Source trend (stacked area chart data)
    const sourceTrend = revenueTrend.map((item) => {
      const dateBookings = bookings.filter(
        (b: any) => new Date(b.createdAt).toISOString().split("T")[0] === item.date
      );

      const sources = {
        date: item.date,
        WEB_DIRECT: 0,
        F2_SELF: 0,
        F1_CREATE: 0,
        ADMIN_CREATE: 0,
      };

      dateBookings.forEach((b: any) => {
        if (sources[b.source as keyof typeof sources] !== undefined) {
          (sources[b.source as keyof typeof sources] as number)++;
        }
      });

      return sources;
    });

    // Commission by tier trend
    const tierTrend = revenueTrend.map((item) => {
      const dateCommissions = commissions.filter(
        (c: any) => new Date(c.createdAt).toISOString().split("T")[0] === item.date
      );

      return {
        date: item.date,
        tier1: dateCommissions
          .filter((c: any) => c.tier === 1)
          .reduce((sum: number, c: any) => sum + c.amount, 0),
        tier2: dateCommissions
          .filter((c: any) => c.tier === 2)
          .reduce((sum: number, c: any) => sum + c.amount, 0),
      };
    });

    return NextResponse.json({
      ok: true,
      revenueTrend,
      bookingsTrend,
      commissionTrend,
      depositTrend,
      sourceTrend,
      tierTrend,
    });
  } catch (error) {
    console.error("Error fetching analytics trends:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
