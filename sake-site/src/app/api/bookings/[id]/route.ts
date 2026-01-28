import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

// PATCH /api/bookings/[id] - Update booking status
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    // Check authentication
    const cookieStore = await cookies();
    const roleFromCookie = cookieStore.get("sake_role")?.value;

    if (roleFromCookie !== "admin") {
      return NextResponse.json(
        { ok: false, message: "Unauthorized - Admin only" },
        { status: 403 }
      );
    }

    const { status } = await request.json();

    // Validate status
    const validStatuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { ok: false, message: "Invalid status" },
        { status: 400 }
      );
    }

    // Update booking
    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        customer: true,
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Booking updated successfully",
      booking,
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to update booking" },
      { status: 500 }
    );
  }
}
