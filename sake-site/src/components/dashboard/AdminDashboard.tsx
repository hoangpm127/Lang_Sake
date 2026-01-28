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
  };
  createdBy?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
};

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

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

  const getSourceLabel = (source: string) => {
    switch (source) {
      case "WEB_DIRECT":
        return "Web";
      case "ADMIN_CREATE":
        return "Admin";
      case "F1_CREATE":
        return "F1 Partner";
      case "F2_SELF":
        return "F2 Member";
      default:
        return source;
    }
  };

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

  // Tính toán thống kê
  const totalRevenue = bookings
    .filter((b) => b.status !== "CANCELLED")
    .reduce((sum, b) => sum + b.finalTotal, 0);

  const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED").length;
  const pendingBookings = bookings.filter((b) => b.status === "PENDING").length;

  const sourceStats = bookings.reduce((acc, booking) => {
    acc[booking.source] = (acc[booking.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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
    <div className="space-y-8">
      {/* Statistics Cards */}
      <div className="grid gap-6 lg:grid-cols-4">
        <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-[#8b857a]">
            Tổng doanh thu
          </p>
          <p className="mt-4 font-serif text-3xl text-[#1a1a1a]">
            {formatCurrency(totalRevenue)}
          </p>
        </div>

        <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-[#8b857a]">
            Đã xác nhận
          </p>
          <p className="mt-4 font-serif text-3xl text-green-600">
            {confirmedBookings}
          </p>
        </div>

        <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-[#8b857a]">
            Chờ xác nhận
          </p>
          <p className="mt-4 font-serif text-3xl text-yellow-600">
            {pendingBookings}
          </p>
        </div>

        <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-[#8b857a]">
            Tổng bookings
          </p>
          <p className="mt-4 font-serif text-3xl text-[#1a1a1a]">
            {bookings.length}
          </p>
        </div>
      </div>

      {/* Source Statistics */}
      <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-serif text-[#1a1a1a] mb-4">Nguồn Booking</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(sourceStats).map(([source, count]) => (
            <div key={source} className="border-l-4 border-[#c9a24d] pl-4">
              <p className="text-xs text-[#8b857a]">{getSourceLabel(source)}</p>
              <p className="text-2xl font-serif text-[#1a1a1a]">{count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="rounded-3xl border border-black/5 bg-white shadow-sm overflow-hidden">
        <div className="p-6 border-b border-black/5">
          <h3 className="text-lg font-serif text-[#1a1a1a]">
            Tất cả Bookings ({bookings.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f8f6f4] text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 text-left text-[#8b857a]">ID</th>
                <th className="px-6 py-4 text-left text-[#8b857a]">Khách hàng</th>
                <th className="px-6 py-4 text-left text-[#8b857a]">Combo</th>
                <th className="px-6 py-4 text-left text-[#8b857a]">Thời gian</th>
                <th className="px-6 py-4 text-left text-[#8b857a]">Số người</th>
                <th className="px-6 py-4 text-left text-[#8b857a]">Nguồn</th>
                <th className="px-6 py-4 text-left text-[#8b857a]">Tạo bởi</th>
                <th className="px-6 py-4 text-left text-[#8b857a]">Giá trị</th>
                <th className="px-6 py-4 text-left text-[#8b857a]">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-[#f8f6f4]/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-[#8b857a]">
                    {booking.id.slice(0, 8)}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-[#1a1a1a]">
                      {booking.customerName}
                    </p>
                    <p className="text-xs text-[#8b857a]">{booking.phone}</p>
                    {booking.email && (
                      <p className="text-xs text-[#8b857a]">{booking.email}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#1a1a1a]">
                    {booking.comboName}
                  </td>
                  <td className="px-6 py-4 text-xs text-[#8b857a]">
                    {formatDateTime(booking.dateTime)}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#1a1a1a]">
                    {booking.guests}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                      {getSourceLabel(booking.source)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-[#8b857a]">
                    {booking.createdBy ? booking.createdBy.name : "-"}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-[#c9a24d]">
                    {formatCurrency(booking.finalTotal)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs px-3 py-1 rounded-full ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {bookings.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-[#8b857a]">Chưa có booking nào</p>
          </div>
        )}
      </div>
    </div>
  );
}

            />
            <defs>
              <linearGradient id="goldFade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c9a24d" />
                <stop offset="100%" stopColor="#c9a24d" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-[#8b857a]">
            Total Guests
          </p>
          <p className="mt-4 font-serif text-3xl text-[#1a1a1a]">18.420</p>
          <p className="mt-2 text-xs text-[#8b857a]">Realtime sync từ booking</p>
          <div className="mt-6 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full border border-[#c9a24d]" />
            <p className="text-xs text-[#8b857a]">
              Trung bình 612 khách/ngày
            </p>
          </div>
        </div>
        <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-[#8b857a]">
            System Health
          </p>
          <div className="mt-5 space-y-4 text-sm text-[#1a1a1a]">
            <div className="flex items-center justify-between">
              <span>Active F1s</span>
              <span className="font-semibold">24</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Active F2s</span>
              <span className="font-semibold">168</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Alerts</span>
              <span className="rounded-full bg-[#f2e6c9] px-3 py-1 text-xs text-[#8b6a2e]">
                3 cần xử lý
              </span>
            </div>
          </div>
        </div>
      </div>

      <section id="hierarchy" className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#8b857a]">
            Master Hierarchy
          </p>
          <h2 className="mt-2 font-serif text-2xl text-[#1a1a1a]">
            Hệ thống F1 / F2
          </h2>
        </div>
        <div className="space-y-4">
          {hierarchy.map((f1) => (
            <details
              key={f1.id}
              className="rounded-2xl border border-black/10 bg-white"
            >
              <summary className="grid cursor-pointer list-none grid-cols-5 gap-4 px-6 py-4 text-sm font-semibold text-[#1a1a1a]">
                <span>{f1.name}</span>
                <span>{f1.region}</span>
                <span>{f1.f2Count} F2</span>
                <span>{f1.revenue}</span>
                <span className="text-right text-[#8b6a2e]">
                  {f1.status}
                </span>
              </summary>
              <div className="border-t border-black/5 px-6 py-4 text-xs text-[#6f665a]">
                <div className="grid grid-cols-4 gap-4 pb-2 font-semibold uppercase tracking-[0.2em]">
                  <span>F2</span>
                  <span>Bookings</span>
                  <span>Revenue</span>
                  <span className="text-right">Status</span>
                </div>
                {f1.team.map((member) => (
                  <div
                    key={member.name}
                    className="grid grid-cols-4 gap-4 py-2 text-sm text-[#1a1a1a]"
                  >
                    <span>{member.name}</span>
                    <span>{member.bookings}</span>
                    <span>{member.revenue}</span>
                    <span className="text-right text-[#8b857a]">
                      {member.status}
                    </span>
                  </div>
                ))}
                <div className="mt-4 flex justify-end gap-3 text-xs uppercase tracking-[0.2em]">
                  <button className="rounded-full border border-black/10 px-4 py-2">
                    Toggle Status
                  </button>
                  <button className="rounded-full border border-black/10 px-4 py-2">
                    Commission History
                  </button>
                </div>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section id="bookings" className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#8b857a]">
            Customer Data
          </p>
          <h2 className="mt-2 font-serif text-2xl text-[#1a1a1a]">
            Bookings gần đây
          </h2>
        </div>
        <div className="rounded-3xl border border-black/10 bg-white p-6">
          <div className="grid grid-cols-5 gap-4 text-xs uppercase tracking-[0.2em] text-[#8b857a]">
            <span>ID</span>
            <span>Khách</span>
            <span>Combo</span>
            <span>Khách</span>
            <span className="text-right">Trạng thái</span>
          </div>
          <div className="mt-4 space-y-3 text-sm text-[#1a1a1a]">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="grid grid-cols-5 gap-4 rounded-2xl border border-black/5 bg-[#fafafa] px-4 py-3"
              >
                <span>{booking.id}</span>
                <span>{booking.guest}</span>
                <span>{booking.combo}</span>
                <span>{booking.guests}</span>
                <span className="text-right">
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      booking.status === "Paid"
                        ? "bg-[#e7efe2] text-[#5f8f52]"
                        : booking.status === "Deposited"
                          ? "bg-[#f2e6c9] text-[#8b6a2e]"
                          : "bg-[#fde4e7] text-[#a63b45]"
                    }`}
                  >
                    {booking.status}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
