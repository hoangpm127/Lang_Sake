import { NextResponse } from "next/server";
import { sendZaloOABookingConfirmation } from "@/lib/zalo";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone"); // Test with: ?phone=0901234567

  if (!phone) {
    return NextResponse.json(
      {
        ok: false,
        message: "Vui lòng cung cấp số điện thoại: /api/test/zalo?phone=0901234567",
      },
      { status: 400 }
    );
  }

  try {
    const result = await sendZaloOABookingConfirmation({
      bookingId: "test12345678abcd",
      customerName: "Nguyễn Văn A (Test)",
      phone: phone,
      dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      guests: 4,
      comboName: "Combo Gia Đình",
      finalTotal: 2400000,
      depositAmount: 240000,
    });

    return NextResponse.json({
      ok: true,
      message: "Test Zalo message sent!",
      result,
      sentTo: phone,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        message: "Zalo test failed",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
