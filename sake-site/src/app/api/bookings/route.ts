import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { createBookingSchema } from "@/lib/validations";

type BookingPayload = {
  customerName?: string;
  phone?: string;
  email?: string;
  dateTime?: string;
  guests?: number;
  comboName?: string;
  comboPrice?: number;
  hasDeposit?: boolean;
  referralCode?: string; // Mã giới thiệu (optional)
  notes?: string;
};

// Helper: Tính discount dựa trên referral code
async function calculateDiscount(
  referralCode: string | undefined,
  subtotal: number
) {
  if (!referralCode) return { discount: 0, discountReason: null };

  // Tìm user có mã giới thiệu này
  const referrer = await prisma.user.findUnique({
    where: { referralCode },
  });

  if (!referrer || !referrer.isActive) {
    return { discount: 0, discountReason: null };
  }

  // F2 Member có discount
  if (referrer.role === "F2_MEMBER" && referrer.discountRate) {
    const discount = Math.round(subtotal * (referrer.discountRate / 100));
    return { discount, discountReason: "F2_MEMBER" };
  }

  return { discount: 0, discountReason: null };
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const roleFromCookie = cookieStore.get("sake_role")?.value;
    const userIdFromCookie = cookieStore.get("sake_user_id")?.value;

    const payload = (await request.json()) as BookingPayload;

    // Validate with Zod
    const validation = createBookingSchema.safeParse({
      customerName: payload.customerName,
      phone: payload.phone,
      email: payload.email,
      dateTime: payload.dateTime,
      guests: payload.guests,
      comboName: payload.comboName,
      comboPrice: payload.comboPrice,
      hasDeposit: payload.hasDeposit,
      referralCode: payload.referralCode,
      notes: payload.notes,
    });

    if (!validation.success) {
      const errors = validation.error.issues.map((issue) => issue.message).join(", ");
      return NextResponse.json(
        { ok: false, message: errors },
        { status: 400 }
      );
    }

    const {
      customerName,
      phone,
      email,
      dateTime,
      guests,
      comboName,
      comboPrice,
      hasDeposit,
      referralCode,
      notes,
    } = validation.data;

    const dateTimeValue = new Date(dateTime);
    const subtotal = Math.round(comboPrice * guests);

    // Tính discount nếu có referral code
    const { discount, discountReason } = await calculateDiscount(
      referralCode,
      subtotal
    );

    const finalTotal = subtotal - discount;
    const depositAmount = hasDeposit ? Math.round(finalTotal * 0.2) : 0;

    // Xác định source và customer
    let source: "WEB_DIRECT" | "F2_SELF" = "WEB_DIRECT"; // Default cho khách vãng lai
    let customerId: string | undefined = undefined;

    // Chỉ F2 member mới có source khác
    if (roleFromCookie === "f2" && userIdFromCookie) {
      source = "F2_SELF";
      customerId = userIdFromCookie;
    }

    // Tạo booking
    const booking = await prisma.booking.create({
      data: {
        customerId,
        customerName,
        phone,
        email,
        dateTime: dateTimeValue,
        guests,
        comboName,
        comboPrice,
        hasDeposit,
        subtotal,
        discount,
        discountReason,
        finalTotal,
        depositAmount,
        source,
        status: "PENDING",
        referralCode,
        notes,
      },
    });

    return NextResponse.json({ ok: true, booking });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error ? error.message : "Lỗi tạo booking.",
      },
      { status: 500 }
    );
  }
}

// GET: Lấy danh sách bookings theo role
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const roleFromCookie = cookieStore.get("sake_role")?.value;
    const userIdFromCookie = cookieStore.get("sake_user_id")?.value;

    if (!roleFromCookie || !userIdFromCookie) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    let bookings;

    if (roleFromCookie === "admin") {
      // Admin xem tất cả bookings với đầy đủ thông tin F2 -> F1
      bookings = await prisma.booking.findMany({
        include: {
          customer: {
            select: { 
              id: true, 
              name: true, 
              email: true, 
              phone: true, 
              role: true,
              referredBy: {
                select: { id: true, name: true, referralCode: true, role: true }
              }
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (roleFromCookie === "f1") {
      // F1 Partner CHỈ xem bookings từ F2 member mình giới thiệu
      bookings = await prisma.booking.findMany({
        where: {
          customer: {
            role: "F2_MEMBER",
            referredById: userIdFromCookie, // Chỉ F2 do F1 này giới thiệu
          },
        },
        include: {
          customer: {
            select: { 
              id: true, 
              name: true, 
              email: true, 
              phone: true, 
              role: true,
              referredBy: {
                select: { id: true, name: true, referralCode: true, role: true }
              }
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (roleFromCookie === "f2" || roleFromCookie === "customer") {
      // F2/Customer chỉ xem bookings của chính mình
      bookings = await prisma.booking.findMany({
        where: { customerId: userIdFromCookie },
        orderBy: { createdAt: "desc" },
      });
    } else {
      return NextResponse.json(
        { ok: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    return NextResponse.json({ ok: true, bookings });
  } catch (error) {
    console.error("Get bookings error:", error);
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Lỗi lấy bookings.",
      },
      { status: 500 }
    );
  }
}
