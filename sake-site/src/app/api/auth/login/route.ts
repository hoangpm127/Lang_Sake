import { NextResponse } from "next/server";

type LoginPayload = {
  role?: "admin" | "f1" | "f2";
  identifier?: string;
  password?: string;
  otp?: string;
};

const normalize = (value: string | undefined) => (value ?? "").trim();

const parseAccounts = (raw: string) =>
  raw
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [identifier, password] = entry.split(":");
      return {
        identifier: (identifier ?? "").trim(),
        password: (password ?? "").trim(),
      };
    });

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginPayload;
    const role = body.role;
    const identifier = normalize(body.identifier);
    const password = normalize(body.password);
    const otp = normalize(body.otp);

    if (!role || !identifier || !password) {
      return NextResponse.json(
        { ok: false, message: "Thiếu thông tin đăng nhập." },
        { status: 400 }
      );
    }

    let isValid = false;

    if (role === "admin") {
      const adminId = normalize(process.env.ADMIN_ID) || "admin";
      const adminPassword = normalize(process.env.ADMIN_PASSWORD) || "admin123";
      const adminOtp = normalize(process.env.ADMIN_OTP);

      isValid =
        identifier.toLowerCase() === adminId.toLowerCase() &&
        password === adminPassword &&
        (!adminOtp || !otp || otp === adminOtp);
    }

    if (role === "f1") {
      const accounts = parseAccounts(
        process.env.F1_ACCOUNTS || "f1@langsake.vn:welcome123"
      );
      isValid = accounts.some(
        (account) =>
          account.identifier.toLowerCase() === identifier.toLowerCase() &&
          account.password === password
      );
    }

    if (role === "f2") {
      const accounts = parseAccounts(
        process.env.F2_ACCOUNTS || "0900000000:welcome123"
      );
      isValid = accounts.some(
        (account) =>
          account.identifier.toLowerCase() === identifier.toLowerCase() &&
          account.password === password
      );
    }

    if (!isValid) {
      return NextResponse.json(
        { ok: false, message: "Thông tin đăng nhập không chính xác." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      ok: true,
      role,
      redirect: `/dashboard/${role}`,
    });
    response.cookies.set("sake_role", role, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    response.cookies.set("sake_user", identifier, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error) {
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
