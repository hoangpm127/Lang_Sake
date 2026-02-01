"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

type Booking = {
  id: string;
  customerName: string;
  phone: string;
  email?: string;
  dateTime: string;
  guests: number;
  comboName: string;
  finalTotal: number;
  discount: number;
  depositAmount: number;
  status: string;
  notes?: string;
  createdAt: string;
  source: string;
};

function BookingLookupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [bookingId, setBookingId] = useState(searchParams.get("id") || "");
  const [phone, setPhone] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-search if both params are present
  useEffect(() => {
    const id = searchParams.get("id");
    const phoneParam = searchParams.get("phone");
    if (id && phoneParam) {
      setBookingId(id);
      setPhone(phoneParam);
      handleSearch(id, phoneParam);
    }
  }, [searchParams]);

  const handleSearch = async (id?: string, phoneNumber?: string) => {
    const searchId = id || bookingId;
    const searchPhone = phoneNumber || phone;

    if (!searchId || !searchPhone) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setLoading(true);
    setError(null);
    setBooking(null);

    try {
      const response = await fetch(
        `/api/bookings/lookup?id=${encodeURIComponent(searchId)}&phone=${encodeURIComponent(searchPhone)}`
      );
      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Không tìm thấy đặt bàn");
      }

      setBooking(data.booking);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Có lỗi xảy ra";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      weekday: "long",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { bg: string; text: string; label: string; icon: string }> = {
      PENDING: { bg: "bg-yellow-50", text: "text-yellow-700", label: "Chờ xác nhận", icon: "⏳" },
      CONFIRMED: { bg: "bg-blue-50", text: "text-blue-700", label: "Đã xác nhận", icon: "✓" },
      COMPLETED: { bg: "bg-green-50", text: "text-green-700", label: "Hoàn thành", icon: "✓" },
      CANCELLED: { bg: "bg-red-50", text: "text-red-700", label: "Đã hủy", icon: "✕" },
    };
    return configs[status] || configs.PENDING;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f6f4] to-[#f0ebe6]">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 text-[#8b857a] hover:text-[#c9a24d] transition mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Về trang chủ
          </button>
          <h1 className="text-4xl font-serif text-[#1a1a1a] mb-3">Tra cứu đặt bàn</h1>
          <p className="text-[#8b857a]">Nhập mã đặt bàn và số điện thoại để xem thông tin</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-black/5 p-8 mb-8">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
                Mã đặt bàn <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                placeholder="Nhập 8 ký tự đầu của mã đặt bàn"
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-[#1a1a1a] outline-none focus:border-[#c9a24d] transition font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Số điện thoại khi đặt bàn"
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-[#1a1a1a] outline-none focus:border-[#c9a24d] transition"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
            </div>

            <button
              onClick={() => handleSearch()}
              disabled={loading || !bookingId || !phone}
              className="w-full px-6 py-4 bg-gradient-to-r from-[#c9a24d] to-[#b8914d] text-white rounded-xl font-medium hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Đang tìm kiếm...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Tra cứu
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="text-3xl">❌</div>
              <div>
                <p className="font-semibold text-red-900">Không tìm thấy</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Booking Details */}
        {booking && (
          <div className="space-y-6">
            {/* Status Banner */}
            <div className={`rounded-2xl p-6 ${getStatusConfig(booking.status).bg} border-2 border-current ${getStatusConfig(booking.status).text}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{getStatusConfig(booking.status).icon}</span>
                  <div>
                    <p className="text-sm opacity-80">Trạng thái</p>
                    <p className="text-xl font-bold">{getStatusConfig(booking.status).label}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(booking.id);
                    toast.success("Đã copy mã đặt bàn!");
                  }}
                  className="px-4 py-2 bg-white/50 hover:bg-white/80 rounded-lg transition text-sm font-medium"
                >
                  Copy mã
                </button>
              </div>
            </div>

            {/* Main Info */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-[#c9a24d] overflow-hidden">
              <div className="bg-gradient-to-r from-[#c9a24d] to-[#b8914d] p-6 text-white">
                <p className="text-sm opacity-90 mb-2">Mã đặt bàn</p>
                <p className="text-2xl font-bold tracking-wider font-mono">
                  {booking.id.substring(0, 8).toUpperCase()}
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div>
                  <h3 className="text-sm font-semibold text-[#8b857a] uppercase mb-3">Thông tin khách hàng</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-[#8b857a]">Họ tên:</span>
                      <span className="text-sm font-semibold text-[#1a1a1a]">{booking.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[#8b857a]">Số điện thoại:</span>
                      <span className="text-sm font-semibold text-[#1a1a1a]">{booking.phone}</span>
                    </div>
                    {booking.email && (
                      <div className="flex justify-between">
                        <span className="text-sm text-[#8b857a]">Email:</span>
                        <span className="text-sm font-semibold text-[#1a1a1a]">{booking.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Booking Info */}
                <div className="border-t border-black/10 pt-6">
                  <h3 className="text-sm font-semibold text-[#8b857a] uppercase mb-3">Thông tin đặt bàn</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-[#8b857a]">Thời gian:</span>
                      <span className="text-sm font-semibold text-[#1a1a1a]">{formatDateTime(booking.dateTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[#8b857a]">Combo:</span>
                      <span className="text-sm font-semibold text-[#1a1a1a]">{booking.comboName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[#8b857a]">Số khách:</span>
                      <span className="text-sm font-semibold text-[#1a1a1a]">{booking.guests} người</span>
                    </div>
                    {booking.notes && (
                      <div className="flex justify-between">
                        <span className="text-sm text-[#8b857a]">Ghi chú:</span>
                        <span className="text-sm font-semibold text-[#1a1a1a]">{booking.notes}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Info */}
                <div className="border-t border-black/10 pt-6">
                  <h3 className="text-sm font-semibold text-[#8b857a] uppercase mb-3">Thanh toán</h3>
                  <div className="space-y-2">
                    {booking.discount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-green-600">Giảm giá:</span>
                        <span className="text-sm font-semibold text-green-600">-{formatCurrency(booking.discount)}</span>
                      </div>
                    )}
                    {booking.depositAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-600">Đã đặt cọc:</span>
                        <span className="text-sm font-semibold text-blue-600">{formatCurrency(booking.depositAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-black/10">
                      <span className="font-medium text-[#1a1a1a]">Tổng cộng:</span>
                      <span className="text-2xl font-bold text-[#c9a24d]">{formatCurrency(booking.finalTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Support */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-amber-900 mb-1">Cần hỗ trợ?</h4>
                  <p className="text-sm text-amber-700">
                    Liên hệ hotline để được tư vấn hoặc thay đổi thông tin đặt bàn
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push("/")}
              className="w-full px-6 py-3 bg-white border-2 border-[#c9a24d] text-[#c9a24d] rounded-xl font-medium hover:bg-[#c9a24d] hover:text-white transition"
            >
              Về trang chủ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookingLookupPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Đang tải...</div>}>
      <BookingLookupContent />
    </Suspense>
  );
}
