import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/bookings/lookup?id=xxx&phone=xxx
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const bookingId = searchParams.get("id");
    const phone = searchParams.get("phone");

    if (!bookingId || !phone) {
      return NextResponse.json(
        { ok: false, message: "Vui lòng cung cấp mã đặt bàn và số điện thoại" },
        { status: 400 }
      );
    }

    // Tìm booking theo ID và phone để xác thực
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        phone: phone,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { ok: false, message: "Không tìm thấy đặt bàn với thông tin này" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      booking: {
        id: booking.id,
        customerName: booking.customerName,
        phone: booking.phone,
        email: booking.email,
        dateTime: booking.dateTime,
        guests: booking.guests,
        comboName: booking.comboName,
        finalTotal: booking.finalTotal,
        discount: booking.discount,
        depositAmount: booking.depositAmount,
        status: booking.status,
        notes: booking.notes,
        createdAt: booking.createdAt,
        source: booking.source,
      },
    });
  } catch (error) {
    console.error("Booking lookup error:", error);
    return NextResponse.json(
      { ok: false, message: "Lỗi hệ thống" },
      { status: 500 }
    );
  }
}
