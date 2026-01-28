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
};

export default function F1Dashboard() {
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
    <div className="space-y-8">
      {/* Statistics Cards */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-[#8b857a]">
            Tổng bookings
          </p>
          <p className="mt-4 font-serif text-3xl text-[#1a1a1a]">
            {bookings.length}
          </p>
        </div>

        <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-[#8b857a]">
            Doanh thu
          </p>
          <p className="mt-4 font-serif text-3xl text-[#1a1a1a]">
            {formatCurrency(totalRevenue)}
          </p>
        </div>

        <div className="rounded-3xl border border-black/5 bg-gradient-to-br from-[#c9a24d]/10 to-[#c9a24d]/5 p-6 shadow-sm border-[#c9a24d]/20">
          <p className="text-xs uppercase tracking-[0.2em] text-[#c9a24d]">
            Hoa hồng dự kiến
          </p>
          <p className="mt-4 font-serif text-3xl text-[#c9a24d]">
            {formatCurrency(totalCommission)}
          </p>
          <p className="mt-2 text-xs text-[#8b857a]">~10% doanh thu</p>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="rounded-3xl border border-black/5 bg-white shadow-sm overflow-hidden">
        <div className="p-6 border-b border-black/5">
          <h3 className="text-lg font-serif text-[#1a1a1a]">
            Bookings của bạn ({bookings.length})
          </h3>
          <p className="text-sm text-[#8b857a] mt-1">
            Danh sách các booking do bạn tạo
          </p>
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
                <th className="px-6 py-4 text-left text-[#8b857a]">Giá trị</th>
                <th className="px-6 py-4 text-left text-[#8b857a]">Hoa hồng</th>
                <th className="px-6 py-4 text-left text-[#8b857a]">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {bookings.map((booking) => {
                const commission = booking.finalTotal * 0.1;
                return (
                  <tr
                    key={booking.id}
                    className="hover:bg-[#f8f6f4]/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-mono text-[#8b857a]">
                      {booking.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-[#1a1a1a]">
                        {booking.customerName}
                      </p>
                      <p className="text-xs text-[#8b857a]">{booking.phone}</p>
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
                    <td className="px-6 py-4 text-sm font-medium text-[#1a1a1a]">
                      {formatCurrency(booking.finalTotal)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-[#c9a24d]">
                      {formatCurrency(commission)}
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
                );
              })}
            </tbody>
          </table>
        </div>

        {bookings.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-[#8b857a]">Bạn chưa tạo booking nào</p>
            <p className="text-xs text-[#8b857a] mt-2">
              Tạo booking cho khách hàng để nhận hoa hồng
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
            <span>Doanh thu</span>
            <span>Hoa hồng</span>
            <span className="text-right">Ghi chú</span>
          </div>
          <div className="mt-4 space-y-3">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className="grid grid-cols-5 gap-4 rounded-2xl border border-black/5 bg-[#fafafa] px-4 py-3 text-sm"
              >
                <span>{member.name}</span>
                <span>{member.bookings}</span>
                <span>{formatVnd(member.revenue)} đ</span>
                <span>{formatVnd(member.commission)} đ</span>
                <span className="text-right">
                  {member.top ? (
                    <span className="rounded-full bg-[#f2e6c9] px-3 py-1 text-xs text-[#8b6a2e]">
                      Top Performer
                    </span>
                  ) : (
                    <span className="text-xs text-[#8b857a]">Ổn định</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="referral" className="space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-[#8b857a]">
          Referral Link Generator
        </p>
        <div className="rounded-3xl border border-black/10 bg-white p-6">
          <div className="space-y-4">
            <label className="text-xs uppercase tracking-[0.2em] text-[#8b857a]">
              Mã giới thiệu
            </label>
            <div className="flex flex-wrap gap-3">
              <input
                value={code}
                onChange={(event) => setCode(event.target.value)}
                className="flex-1 rounded-full border border-black/10 px-4 py-2 text-sm"
              />
              <button
                onClick={handleCopy}
                className="rounded-full border border-black/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#6b5f4b]"
                type="button"
              >
                Copy link
              </button>
            </div>
            <div className="rounded-2xl border border-black/5 bg-[#fafafa] px-4 py-3 text-xs text-[#6b5f4b]">
              {referralLink}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
