"use client";

import { useEffect, useState } from "react";

type Booking = {
  id: string;
  customerName: string;
  phone: string;
  email?: string;
  dateTime: string;
  guests: number;
  comboName: string;
  finalTotal: number;
  status: string;
  source: string;
  customer?: {
    id: string;
    name: string;
    email: string;
    role: string;
    referredBy?: {
      id: string;
      name: string;
      referralCode: string;
      role: string;
    };
  };
};

export default function F1Dashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState<string>("");
  const [userName, setUserName] = useState<string>("Partner");

  useEffect(() => {
    fetchBookings();
    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/user/profile");
      const data = await response.json();
      
      if (data.ok && data.user) {
        setReferralCode(data.user.referralCode || "");
        setUserName(data.user.name || "Partner");
      }
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
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

  const totalRevenue = bookings
    .filter((b) => b.status !== "CANCELLED")
    .reduce((sum, b) => sum + b.finalTotal, 0);

  const totalCommission = totalRevenue * 0.1; // Giả sử 10% hoa hồng

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
        <p className="text-red-800">❌ {error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-serif mb-2">Chào mừng, {userName}!</h1>
            <p className="text-white/80">Quản lý đơn hàng và theo dõi hoa hồng</p>
          </div>
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

      {/* Referral Code Card */}
      {referralCode && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border-2 border-[#c9a24d] shadow-md">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#c9a24d] rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-[#8b857a]">Mã giới thiệu của bạn</p>
                <p className="text-xs text-[#8b857a]/70">Chia sẻ cho F2 để họ được giảm 10%</p>
              </div>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(referralCode);
                alert("Đã copy mã giới thiệu!");
              }}
              className="px-3 py-1.5 bg-[#c9a24d] hover:bg-[#b8914d] text-white text-xs font-medium rounded-lg transition flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </button>
          </div>
          <div className="bg-white rounded-lg p-4 border border-[#c9a24d]/30">
            <p className="text-2xl font-bold text-[#1a1a1a] tracking-wider text-center font-mono">{referralCode}</p>
          </div>
          <div className="mt-3 p-3 bg-white/60 rounded-lg">
            <p className="text-xs text-[#8b857a] leading-relaxed">
              💡 <strong>Link đăng ký:</strong> <span className="font-mono text-[#c9a24d]">langsake.vn/affiliate?ref={referralCode}</span>
            </p>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid gap-4 lg:grid-cols-3">
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-[#8b857a]">Doanh thu</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-black/5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#c9a24d]/10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-[#c9a24d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-[#8b857a]">Hoa hồng dự kiến</p>
              <p className="text-xl font-bold text-[#c9a24d]">{formatCurrency(totalCommission)}</p>
              <p className="text-xs text-[#8b857a] mt-1">~10% doanh thu</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-black/5 overflow-hidden">
        <div className="p-6 border-b border-black/5">
          <h2 className="text-xl font-serif text-[#1a1a1a]">Đơn hàng của bạn</h2>
          <p className="text-sm text-[#8b857a] mt-1">
            Tổng doanh thu: <span className="font-semibold text-green-600">{formatCurrency(totalRevenue)}</span> • 
            Hoa hồng: <span className="font-semibold text-[#c9a24d]">{formatCurrency(totalCommission)}</span>
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-[#f8f6f4] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#8b857a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-[#8b857a]">Chưa có đơn hàng nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f8f6f4]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#8b857a] uppercase">Khách hàng</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#8b857a] uppercase">Nguồn</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#8b857a] uppercase">Combo</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#8b857a] uppercase">Thời gian</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#8b857a] uppercase">Số khách</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-[#8b857a] uppercase">Giá trị</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-[#8b857a] uppercase">Hoa hồng</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-[#8b857a] uppercase">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {bookings.map((booking) => {
                  const commission = booking.finalTotal * 0.1;
                  const statusConfig = {
                    CONFIRMED: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: "Đã xác nhận" },
                    PENDING: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", label: "Chờ xác nhận" },
                    COMPLETED: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", label: "Hoàn thành" },
                    CANCELLED: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", label: "Đã hủy" },
                  };
                  const config = statusConfig[booking.status as keyof typeof statusConfig] || statusConfig.PENDING;
                  
                  // Xác định nguồn đơn hàng
                  let sourceLabel = "Web trực tiếp";
                  let sourceClass = "bg-gray-50 text-gray-600";
                  
                  if (booking.customer?.role === "F2_MEMBER") {
                    sourceLabel = `F2: ${booking.customer.name}`;
                    sourceClass = "bg-purple-50 text-purple-700";
                  }
                  
                  return (
                    <tr key={booking.id} className="hover:bg-[#f8f6f4] transition">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-[#1a1a1a]">{booking.customerName}</p>
                        <p className="text-xs text-[#8b857a]">{booking.phone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${sourceClass}`}>
                          {sourceLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-[#1a1a1a]">{booking.comboName}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-[#8b857a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm text-[#1a1a1a]">{formatDateTime(booking.dateTime)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[#1a1a1a]">{booking.guests} người</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-semibold text-green-600">{formatCurrency(booking.finalTotal)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-bold text-[#c9a24d]">{formatCurrency(commission)}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
                          {config.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
