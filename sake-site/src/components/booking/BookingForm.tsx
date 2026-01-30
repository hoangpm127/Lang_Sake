"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DateTimePicker } from "@/components/ui/datetime-picker";

type BookingFormData = {
  customerName: string;
  phone: string;
  email: string;
  dateTime: string;
  guests: number;
  comboName: string;
  comboPrice: number;
  hasDeposit: boolean;
  referralCode: string;
  notes: string;
};

const COMBOS = [
  { name: "Combo Cặp Đôi", price: 666000, description: "2 người" },
  { name: "Combo Gia Đình", price: 2400000, description: "6 người" },
  { name: "Combo Sinh Viên", price: 396000, description: "4 người" },
  { name: "Premium Sake Tasting", price: 2000000, description: "4-6 người" },
  { name: "Sake & Sushi Combo", price: 1500000, description: "4 người" },
];

export default function BookingForm({ userId, onSuccess, isF1Creating }: { userId?: string; onSuccess?: () => void; isF1Creating?: boolean }) {
  const router = useRouter();
  const [formData, setFormData] = useState<BookingFormData>({
    customerName: "",
    phone: "",
    email: "",
    dateTime: "",
    guests: 2,
    comboName: COMBOS[0].name,
    comboPrice: COMBOS[0].price,
    hasDeposit: false,
    referralCode: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleComboChange = (comboName: string) => {
    const combo = COMBOS.find((c) => c.name === comboName);
    if (combo) {
      setFormData({
        ...formData,
        comboName: combo.name,
        comboPrice: combo.price,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Add isF1Creating flag to the request body
      const bodyData = isF1Creating 
        ? { ...formData, isF1Creating: true }
        : formData;

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Đặt bàn thất bại");
      }

      setSuccess(true);
      toast.success("Đặt bàn thành công!");
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        // Redirect after success
        setTimeout(() => {
          if (userId) {
            router.refresh(); // Refresh dashboard
          } else {
            router.push("/"); // Back to home
          }
        }, 2000);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Đặt bàn thất bại";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotal = () => {
    const subtotal = formData.comboPrice * formData.guests;
    // Simple estimate - actual discount calculated on server
    const discount = formData.referralCode ? Math.round(subtotal * 0.1) : 0;
    const finalTotal = subtotal - discount;
    return { subtotal, discount, finalTotal };
  };

  const { subtotal, discount, finalTotal } = calculateTotal();

  if (success) {
    return (
      <div className="rounded-3xl border border-green-500/20 bg-green-50 p-8 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h3 className="text-2xl font-serif text-green-800 mb-2">
          Đặt bàn thành công!
        </h3>
        <p className="text-green-600">
          Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-50 p-4">
          <p className="text-sm text-red-800">❌ {error}</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Tên khách hàng */}
        <div>
          <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
            Họ và tên <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.customerName}
            onChange={(e) =>
              setFormData({ ...formData, customerName: e.target.value })
            }
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-[#1a1a1a] outline-none focus:border-[#c9a24d] transition"
            placeholder="Nguyễn Văn A"
          />
        </div>

        {/* Số điện thoại */}
        <div>
          <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
            Số điện thoại <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-[#1a1a1a] outline-none focus:border-[#c9a24d] transition"
            placeholder="0901234567"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-[#1a1a1a] outline-none focus:border-[#c9a24d] transition"
            placeholder="email@example.com"
          />
        </div>

        {/* Thời gian */}
        <div className="md:col-span-2">
          <DateTimePicker
            label="Thời gian đặt bàn"
            value={formData.dateTime}
            onChange={(value) => setFormData({ ...formData, dateTime: value })}
          />
        </div>

        {/* Số người */}
        <div>
          <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
            Số người <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            required
            min="1"
            max="20"
            value={formData.guests}
            onChange={(e) =>
              setFormData({ ...formData, guests: parseInt(e.target.value) })
            }
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-[#1a1a1a] outline-none focus:border-[#c9a24d] transition"
          />
        </div>

        {/* Combo */}
        <div>
          <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
            Chọn combo <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={formData.comboName}
            onChange={(e) => handleComboChange(e.target.value)}
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-[#1a1a1a] outline-none focus:border-[#c9a24d] transition"
          >
            {COMBOS.map((combo) => (
              <option key={combo.name} value={combo.name}>
                {combo.name} - {combo.price.toLocaleString("vi-VN")}₫ (
                {combo.description})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mã giới thiệu */}
      <div>
        <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
          Mã giới thiệu / Mã thành viên
        </label>
        <input
          type="text"
          value={formData.referralCode}
          onChange={(e) =>
            setFormData({ ...formData, referralCode: e.target.value.trim() })
          }
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-[#1a1a1a] outline-none focus:border-[#c9a24d] transition"
          placeholder="PARTNER001 hoặc MEMBER001"
        />
        <p className="mt-1 text-xs text-[#8b857a]">
          Nhập mã để nhận ưu đãi (nếu có)
        </p>
      </div>

      {/* Ghi chú */}
      <div>
        <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
          Ghi chú
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-[#1a1a1a] outline-none focus:border-[#c9a24d] transition resize-none"
          placeholder="Yêu cầu đặc biệt, dị ứng thực phẩm..."
        />
      </div>

      {/* Đặt cọc */}
      <div className="rounded-2xl border border-black/5 bg-[#f8f6f4] p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.hasDeposit}
            onChange={(e) =>
              setFormData({ ...formData, hasDeposit: e.target.checked })
            }
            className="mt-1 h-4 w-4 rounded border-black/20 text-[#c9a24d] focus:ring-[#c9a24d]"
          />
          <div>
            <p className="text-sm font-medium text-[#1a1a1a]">
              Đặt cọc trước 10%
            </p>
            <p className="text-xs text-[#8b857a] mt-1">
              Đặt cọc để đảm bảo chỗ và nhận ưu đãi
            </p>
          </div>
        </label>
      </div>

      {/* Tổng tiền */}
      <div className="rounded-2xl border border-[#c9a24d]/20 bg-gradient-to-br from-[#c9a24d]/5 to-[#c9a24d]/10 p-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[#8b857a]">Tạm tính:</span>
            <span className="text-[#1a1a1a]">
              {subtotal.toLocaleString("vi-VN")}₫
            </span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Giảm giá:</span>
              <span className="text-green-600 font-medium">
                -{discount.toLocaleString("vi-VN")}₫
              </span>
            </div>
          )}
          <div className="border-t border-black/10 pt-2 flex justify-between">
            <span className="font-medium text-[#1a1a1a]">Tổng cộng:</span>
            <span className="text-xl font-serif text-[#c9a24d]">
              {finalTotal.toLocaleString("vi-VN")}₫
            </span>
          </div>
          {formData.hasDeposit && (
            <div className="flex justify-between text-sm pt-1">
              <span className="text-[#8b857a]">Cần đặt cọc:</span>
              <span className="font-medium text-[#c9a24d]">
                {Math.round(finalTotal * 0.1).toLocaleString("vi-VN")}₫
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-[#c9a24d] px-8 py-4 text-sm font-medium text-white transition hover:bg-[#b89043] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Đang xử lý..." : "Xác nhận đặt bàn"}
      </button>

      <p className="text-xs text-center text-[#8b857a]">
        Bằng việc đặt bàn, bạn đồng ý với{" "}
        <a href="/terms" className="text-[#c9a24d] hover:underline">
          điều khoản sử dụng
        </a>{" "}
        của chúng tôi
      </p>
    </form>
  );
}
