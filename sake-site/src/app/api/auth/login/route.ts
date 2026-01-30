import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";

type LoginPayload = {
  email?: string;
  password?: string;
  requested_scope?: string; // 'admin', 'f1', 'f2', 'customer'
};

const normalize = (value: string | undefined) => (value ?? "").trim();

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginPayload;
    const requestedScope = normalize(body.requested_scope);

    // Validate with Zod
    const validation = loginSchema.safeParse({
      email: body.email,
      password: body.password,
    });

    if (!validation.success) {
      const errors = validation.error.issues.map((issue) => issue.message).join(", ");
      return NextResponse.json(
        { ok: false, message: errors },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

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

    // Verify password with bcrypt
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { ok: false, message: "Mật khẩu không chính xác." },
        { status: 401 }
      );
    }

    // Map role to route
    let roleRoute = "";
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
        // Customer doesn't need dashboard, redirect to home
        roleRoute = "home";
        break;
    }

    // STRICT SCOPE VALIDATION: User must login at the correct portal
    // Customers are exempt from scope validation
    if (requestedScope && requestedScope !== roleRoute && user.role !== "CUSTOMER") {
      const portalNames: Record<string, string> = {
        admin: "Quản trị viên",
        f1: "Đối tác chiến lược",
        f2: "Thành viên",
        customer: "Khách hàng"
      };
      
      const userPortal = portalNames[roleRoute] || roleRoute;
      const requestedPortal = portalNames[requestedScope] || requestedScope;
      
      console.log(`[Login DENIED] User ${user.email} (${userPortal}) attempted login at ${requestedPortal} portal`);
      
      return NextResponse.json(
        { 
          ok: false, 
          message: `Tài khoản này thuộc portal "${userPortal}". Vui lòng chọn đúng tab để đăng nhập.`,
          correctPortal: roleRoute
        },
        { status: 403 }
      );
    }

    console.log(`[Login] User: ${user.email}, DB Role: ${user.role}, Cookie Role: ${roleRoute}`);

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
      redirect: user.role === "CUSTOMER" ? "/" : `/dashboard/${roleRoute}`,
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
