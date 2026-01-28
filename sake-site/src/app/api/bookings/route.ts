import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

type BookingPayload = {
  customerName?: string;
  phone?: string;
  dateTime?: string;
  guests?: number;
  comboName?: string;
  comboPrice?: number;
  hasDeposit?: boolean;
};

export async function POST(request: Request) {
  const role = cookies().get("sake_role")?.value;
  if (role !== "f2") {
    return NextResponse.json(
      { ok: false, message: "Không có quyền tạo booking." },
      { status: 403 }
    );
  }

  const payload = (await request.json()) as BookingPayload;

  const customerName = (payload.customerName ?? "").trim();
  const phone = (payload.phone ?? "").trim();
  const dateTimeValue = payload.dateTime ? new Date(payload.dateTime) : null;
  const guests = Math.max(1, Number(payload.guests ?? 1));
  const comboName = (payload.comboName ?? "").trim();
  const comboPrice = Math.max(0, Number(payload.comboPrice ?? 0));
  const hasDeposit = Boolean(payload.hasDeposit);

  if (!customerName || !phone || !dateTimeValue || !comboName || !comboPrice) {
    return NextResponse.json(
      { ok: false, message: "Thiếu thông tin đặt lịch." },
      { status: 400 }
    );
  }

  const subtotal = Math.round(guests * comboPrice);
  const discount = hasDeposit ? Math.round(subtotal * 0.1) : 0;
  const finalTotal = subtotal - discount;
  const depositAmount = hasDeposit ? Math.round(finalTotal * 0.1) : 0;

  const booking = await prisma.booking.create({
    data: {
      customerName,
      phone,
      dateTime: dateTimeValue,
      guests,
      comboName,
      comboPrice,
      hasDeposit,
      subtotal,
      discount,
      finalTotal,
      depositAmount,
      status: hasDeposit ? "deposit" : "pending",
    },
  });

  return NextResponse.json({ ok: true, booking });
}
