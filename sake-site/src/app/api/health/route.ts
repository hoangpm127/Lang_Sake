import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/health
 * Health check endpoint for monitoring
 */
export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Check environment
    const hasEmailConfig = !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);
    const hasPaymentConfig = !!(
      process.env.SEPAY_API_KEY || process.env.CASSO_API_KEY
    );
    const hasBankConfig = !!(
      process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER &&
      process.env.NEXT_PUBLIC_BANK_BIN
    );

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
      services: {
        email: hasEmailConfig ? "configured" : "not configured",
        payment: hasPaymentConfig ? "configured" : "not configured",
        bank: hasBankConfig ? "configured" : "not configured",
      },
      environment: process.env.NODE_ENV || "development",
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Database connection failed",
      },
      { status: 503 }
    );
  }
}
