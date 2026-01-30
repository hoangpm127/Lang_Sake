import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

/**
 * POST /api/users - Admin/F1 tạo user mới
 * Admin có thể tạo: F1_PARTNER, F2_MEMBER
 * F1 chỉ có thể tạo: F2_MEMBER (và tự động liên kết với F1)
 */
export async function POST(request: Request) {
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

    const body = await request.json();
    const { email, password, name, phone, role, referredById } = body;

    // Validate input
    if (!email || !password || !name || !phone || !role) {
      return NextResponse.json(
        { ok: false, message: "Thiếu thông tin bắt buộc" },
        { status: 400 }
      );
    }

    // Authorization check
    if (roleFromCookie === "f1") {
      // F1 chỉ được tạo F2, và phải là F2 dưới quản lý của mình
      if (role !== "F2_MEMBER") {
        return NextResponse.json(
          { ok: false, message: "F1 chỉ được tạo tài khoản F2 Member" },
          { status: 403 }
        );
      }
    } else if (roleFromCookie !== "admin") {
      // Chỉ admin và F1 mới được tạo user
      return NextResponse.json(
        { ok: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    // Check email exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { ok: false, message: "Email đã tồn tại" },
        { status: 400 }
      );
    }

    // Generate referral code based on role
    let referralCode = "";
    if (role === "F1_PARTNER") {
      referralCode = `F1${Date.now().toString(36).toUpperCase()}`;
    } else if (role === "F2_MEMBER") {
      referralCode = `F2${Date.now().toString(36).toUpperCase()}`;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Determine referredById
    let finalReferredById = referredById;
    
    // Nếu F1 tạo F2, tự động gán F1 là người giới thiệu
    if (roleFromCookie === "f1" && role === "F2_MEMBER") {
      finalReferredById = userIdFromCookie;
    }

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        role,
        referralCode,
        referredById: finalReferredById || null,
        isActive: true,
        commissionRate: role === "F1_PARTNER" ? 10 : 0, // F1 default 10%
        discountRate: role === "F2_MEMBER" ? 10 : 0, // F2 default 10%
        membershipLevel: role === "F2_MEMBER" ? "SILVER" : undefined,
      },
      include: {
        referredBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    console.log(`✅ User created: ${newUser.role} - ${newUser.name} (${newUser.referralCode})`);

    return NextResponse.json({
      ok: true,
      message: "Tạo tài khoản thành công",
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        phone: newUser.phone,
        role: newUser.role,
        referralCode: newUser.referralCode,
        referredBy: newUser.referredBy,
      },
    });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Lỗi tạo tài khoản",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/users - Admin lấy danh sách users
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const roleFromCookie = cookieStore.get("sake_role")?.value;

    if (roleFromCookie !== "admin") {
      return NextResponse.json(
        { ok: false, message: "Forbidden - Admin only" },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ["F1_PARTNER", "F2_MEMBER"],
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        referralCode: true,
        isActive: true,
        commissionRate: true,
        discountRate: true,
        totalCommission: true,
        createdAt: true,
        referredBy: {
          select: {
            id: true,
            name: true,
            referralCode: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ ok: true, users });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Lỗi lấy danh sách",
      },
      { status: 500 }
    );
  }
}
