import { NextResponse } from "next/server";
import { sendBookingConfirmationEmail } from "@/lib/email";

export async function GET() {
  try {
    const result = await sendBookingConfirmationEmail({
      bookingId: "test12345678abcd",
      customerName: "Nguyễn Văn A (Test)",
      customerEmail: process.env.EMAIL_USER || "test@example.com", // Send to self for testing
      phone: "0901234567",
      dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      guests: 4,
      comboName: "Combo Gia Đình",
      finalTotal: 2400000,
      depositAmount: 240000,
      discount: 240000,
      notes: "Test booking - vui lòng không xử lý đơn này",
    });

    return NextResponse.json({
      ok: true,
      message: "Test email sent!",
      result,
      sentTo: process.env.EMAIL_USER,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        message: "Email test failed",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
