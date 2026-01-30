import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { updateBookingSchema } from "@/lib/validations";

// GET /api/bookings/[id] - Get single booking
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    const cookieStore = await cookies();
    const roleFromCookie = cookieStore.get("sake_role")?.value;
    const userIdFromCookie = cookieStore.get("sake_user_id")?.value;

    if (!roleFromCookie || !userIdFromCookie) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { ok: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    // Check permissions
    if (roleFromCookie !== "admin") {
      // F1/F2/Customer can only see their own bookings
      if (booking.customerId !== userIdFromCookie && booking.createdById !== userIdFromCookie) {
        return NextResponse.json(
          { ok: false, message: "Forbidden" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ ok: true, booking });
  } catch (error) {
    console.error("Error getting booking:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to get booking" },
      { status: 500 }
    );
  }
}

// PUT /api/bookings/[id] - Update booking (Admin only)
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    const cookieStore = await cookies();
    const roleFromCookie = cookieStore.get("sake_role")?.value;

    if (roleFromCookie !== "admin") {
      return NextResponse.json(
        { ok: false, message: "Unauthorized - Admin only" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate with Zod
    const validation = updateBookingSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.issues.map((issue) => issue.message).join(", ");
      return NextResponse.json(
        { ok: false, message: errors },
        { status: 400 }
      );
    }

    // Update booking
    const booking = await prisma.booking.update({
      where: { id },
      data: validation.data,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
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

// DELETE /api/bookings/[id] - Delete/Cancel booking (Admin only)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    const cookieStore = await cookies();
    const roleFromCookie = cookieStore.get("sake_role")?.value;

    if (roleFromCookie !== "admin") {
      return NextResponse.json(
        { ok: false, message: "Unauthorized - Admin only" },
        { status: 403 }
      );
    }

    // Get booking first
    const existingBooking = await prisma.booking.findUnique({ where: { id } });
    if (!existingBooking) {
      return NextResponse.json(
        { ok: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    // Soft delete: Change status to CANCELLED instead of actually deleting
    const booking = await prisma.booking.update({
      where: { id },
      data: { 
        status: "CANCELLED",
        internalNotes: existingBooking.internalNotes 
          ? `${existingBooking.internalNotes}\n[Cancelled by admin]`
          : "[Cancelled by admin]"
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to cancel booking" },
      { status: 500 }
    );
  }
}

// PATCH /api/bookings/[id] - Update booking status (kept for backward compatibility)
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

    // If booking is being cancelled, void related commissions
    if (status === "CANCELLED" || status === "NO_SHOW") {
      await prisma.commission.updateMany({
        where: { bookingId: id },
        data: { isPaid: false }, // Reset payment status to unpaid/void
      });
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
