"use client";

import { useEffect, useState } from "react";
import BookingForm from "@/components/booking/BookingForm";

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
  status: string;
  createdBy?: {
    id: string;
    name: string;
    role: string;
  };
};

export default function F2Dashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [userName, setUserName] = useState("Thành viên");

  useEffect(() => {
    fetchBookings();
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/user/profile");
      const data = await response.json();
      if (data.ok && data.user) {
        setUserName(data.user.name || "Thành viên");
      }
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/bookings");
      const data = await response.json();

      if (data.ok) {
        setBookings(data.bookings);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const totalSpent = bookings
    .filter((b) => b.status !== "CANCELLED")
    .reduce((sum, b) => sum + b.finalTotal, 0);

  const totalSaved = bookings.reduce((sum, b) => sum + b.discount, 0);

  const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED").length;
  const upcomingBookings = bookings.filter((b) => {
    return new Date(b.dateTime) > new Date() && b.status !== "CANCELLED";
  }).length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      CONFIRMED: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: "Đã xác nhận" },
      PENDING: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", label: "Chờ xác nhận" },
      COMPLETED: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", label: "Hoàn thành" },
      CANCELLED: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", label: "Đã hủy" },
    };
    const config = configs[status as keyof typeof configs] || configs.PENDING;
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#c9a24d] border-r-transparent"></div>
          <p className="mt-4 text-sm text-[#8b857a]">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-red-800">❌ {error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-[#c9a24d] to-[#b8933d] rounded-2xl p-8 text-white shadow-lg relative">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-serif mb-2">Chào mừng, {userName}!</h1>
            <p className="text-white/80">Quản lý đặt bàn và tận hưởng ưu đãi độc quyền</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/dashboard/f2/commissions"
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition text-white text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Hoa hồng
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition text-white text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Đăng xuất
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-black/5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-[#8b857a]">Tổng đơn</p>
              <p className="text-2xl font-bold text-[#1a1a1a]">{bookings.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-black/5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-[#8b857a]">Đã xác nhận</p>
              <p className="text-2xl font-bold text-green-600">{confirmedBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-black/5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-[#8b857a]">Sắp tới</p>
              <p className="text-2xl font-bold text-purple-600">{upcomingBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-black/5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#c9a24d]/10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-[#c9a24d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-[#8b857a]">Đã tiết kiệm</p>
              <p className="text-xl font-bold text-[#c9a24d]">{formatCurrency(totalSaved)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action - Booking Button */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-black/5">
        <button
          onClick={() => setShowBookingForm(!showBookingForm)}
          className="w-full py-4 bg-gradient-to-r from-[#c9a24d] to-[#b8933d] text-white rounded-lg font-medium text-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {showBookingForm ? "Đóng form đặt bàn" : "Đặt bàn ngay"}
        </button>

        {showBookingForm && (
          <div className="mt-6 p-6 bg-[#f8f6f4] rounded-xl">
            <h3 className="text-xl font-serif text-[#1a1a1a] mb-4">Đặt bàn mới</h3>
            <BookingForm onSuccess={() => {
              setShowBookingForm(false);
              fetchBookings();
            }} />
          </div>
        )}
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-xl shadow-sm border border-black/5 overflow-hidden">
        <div className="p-6 border-b border-black/5">
          <h2 className="text-xl font-serif text-[#1a1a1a]">Lịch sử đặt bàn</h2>
          <p className="text-sm text-[#8b857a] mt-1">
            Tổng chi tiêu: <span className="font-semibold text-[#c9a24d]">{formatCurrency(totalSpent)}</span>
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-[#f8f6f4] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#8b857a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-[#8b857a]">Chưa có lịch đặt bàn nào</p>
            <button
              onClick={() => setShowBookingForm(true)}
              className="mt-4 px-6 py-2 bg-[#c9a24d] text-white rounded-lg hover:bg-[#b8933d] transition"
            >
              Đặt bàn đầu tiên
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f8f6f4]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#8b857a] uppercase">Thời gian</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#8b857a] uppercase">Combo</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#8b857a] uppercase">Số khách</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#8b857a] uppercase">Người đặt</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-[#8b857a] uppercase">Giảm giá</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-[#8b857a] uppercase">Tổng tiền</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-[#8b857a] uppercase">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-[#f8f6f4] transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-[#8b857a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm text-[#1a1a1a]">{formatDateTime(booking.dateTime)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-[#1a1a1a]">{booking.comboName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[#1a1a1a]">{booking.guests} người</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-[#1a1a1a]">{booking.customerName}</div>
                        <div className="text-xs text-[#8b857a]">{booking.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {booking.discount > 0 && (
                        <span className="text-sm font-medium text-green-600">
                          -{formatCurrency(booking.discount)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-semibold text-[#c9a24d]">
                        {formatCurrency(booking.finalTotal)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(booking.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
