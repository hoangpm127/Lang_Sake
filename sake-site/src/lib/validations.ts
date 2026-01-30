import { z } from "zod";

// ==================== AUTH SCHEMAS ====================

export const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

export const registerSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  phone: z.string().regex(/^[0-9]{10}$/, "Số điện thoại phải có 10 chữ số").optional(),
  role: z.enum(["ADMIN", "F1_PARTNER", "F2_MEMBER", "CUSTOMER"]).optional(),
  referralCode: z.string().optional(),
  referredById: z.string().optional(),
  commissionRate: z.number().min(0).max(100).optional(),
  discountRate: z.number().min(0).max(100).optional(),
  membershipLevel: z.string().optional(),
});

// ==================== BOOKING SCHEMAS ====================

export const createBookingSchema = z.object({
  // Customer info
  customerName: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  phone: z.string().regex(/^[0-9]{10}$/, "Số điện thoại phải có 10 chữ số"),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  
  // Booking details
  dateTime: z.string().refine((val) => {
    const date = new Date(val);
    return date > new Date();
  }, "Thời gian đặt bàn phải sau thời điểm hiện tại"),
  
  guests: z.number().int().min(1, "Số khách phải ít nhất 1").max(50, "Số khách không được quá 50"),
  
  comboName: z.string().min(1, "Vui lòng chọn combo"),
  comboPrice: z.number().int().min(0, "Giá combo không hợp lệ"),
  
  // Optional fields
  hasDeposit: z.boolean().optional(),
  referralCode: z.string().optional(),
  notes: z.string().max(500, "Ghi chú không được quá 500 ký tự").optional(),
});

export const updateBookingSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
  depositPaid: z.boolean().optional(),
  internalNotes: z.string().max(1000).optional(),
  notes: z.string().max(500).optional(),
});

// ==================== USER SCHEMAS ====================

export const updateUserProfileSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự").optional(),
  phone: z.string().regex(/^[0-9]{10}$/, "Số điện thoại phải có 10 chữ số").optional(),
  email: z.string().email("Email không hợp lệ").optional(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(6, "Mật khẩu hiện tại phải có ít nhất 6 ký tự"),
  newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
  confirmPassword: z.string().min(6, "Xác nhận mật khẩu phải có ít nhất 6 ký tự"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu mới và xác nhận mật khẩu không khớp",
  path: ["confirmPassword"],
});

// ==================== TYPE EXPORTS ====================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
