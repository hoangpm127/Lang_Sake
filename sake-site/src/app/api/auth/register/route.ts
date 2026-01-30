import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";

type RegisterPayload = {
  email?: string;
  password?: string;
  name?: string;
  phone?: string;
  referralCode?: string; // Mã giới thiệu
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterPayload;
    
    // Validate with Zod
    const validation = registerSchema.safeParse({
      email: body.email,
      password: body.password,
      name: body.name,
      phone: body.phone,
    });

    if (!validation.success) {
      const errors = validation.error.issues.map((issue) => issue.message).join(", ");
      return NextResponse.json(
        { ok: false, message: errors },
        { status: 400 }
      );
    }

    const { email, password, name, phone } = validation.data;
    const referralCode = (body.referralCode ?? "").trim();

    // Check email exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { ok: false, message: "Email đã được sử dụng." },
        { status: 400 }
      );
    }

    // Find referrer (người giới thiệu)
    let referrerId: string | null = null;
    let membershipLevel = "BRONZE";
    let discountRate = 5; // Default 5%

    if (referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode },
      });

      if (referrer && referrer.isActive) {
        referrerId = referrer.id;
        
        // Nếu được giới thiệu bởi F1 hoặc F2, set discount cao hơn
        if (referrer.role === "F1_PARTNER") {
          membershipLevel = "GOLD";
          discountRate = 10;
        } else if (referrer.role === "F2_MEMBER") {
          membershipLevel = "SILVER";
          discountRate = 8;
        }
      }
    }

    // Generate unique referral code for new user
    const newReferralCode = `F2${Date.now().toString(36).toUpperCase()}`;

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new F2 member
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        role: "F2_MEMBER",
        referralCode: newReferralCode,
        discountRate,
        membershipLevel,
        referredById: referrerId,
        isActive: true,
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Đăng ký thành công!",
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        referralCode: newUser.referralCode,
        discountRate: newUser.discountRate,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Lỗi đăng ký.",
      },
      { status: 500 }
    );
  }
}
