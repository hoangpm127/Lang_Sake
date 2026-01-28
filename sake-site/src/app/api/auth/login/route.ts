import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type LoginPayload = {
  email?: string;
  password?: string;
};

const normalize = (value: string | undefined) => (value ?? "").trim();

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginPayload;
    const email = normalize(body.email);
    const password = normalize(body.password);

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, message: "Thiếu thông tin đăng nhập." },
        { status: 400 }
      );
    }

    // Tìm user theo email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Email không tồn tại." },
        { status: 401 }
      );
    }

    // Kiểm tra active
    if (!user.isActive) {
      return NextResponse.json(
        { ok: false, message: "Tài khoản đã bị vô hiệu hóa." },
        { status: 403 }
      );
    }

    // TODO: Implement password hashing (bcrypt) sau
    // Tạm thời so sánh plain text
    if (user.password !== password) {
      return NextResponse.json(
        { ok: false, message: "Mật khẩu không chính xác." },
        { status: 401 }
      );
    }

    // Map role to route
    let roleRoute = "customer";
    switch (user.role) {
      case "ADMIN":
        roleRoute = "admin";
        break;
      case "F1_PARTNER":
        roleRoute = "f1";
        break;
      case "F2_MEMBER":
        roleRoute = "f2";
        break;
      case "CUSTOMER":
        roleRoute = "customer";
        break;
    }

    const response = NextResponse.json({
      ok: true,
      role: roleRoute,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        referralCode: user.referralCode,
      },
      redirect: `/dashboard/${roleRoute}`,
    });

    // Set cookies
    response.cookies.set("sake_role", roleRoute, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 hours
    });

    response.cookies.set("sake_user_id", user.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    response.cookies.set("sake_user_email", user.email, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error ? error.message : "Lỗi đăng nhập hệ thống.",
      },
      { status: 500 }
    );
  }
}
