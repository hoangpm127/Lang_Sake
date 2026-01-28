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
  comboPrice: number;
  finalTotal: number;
  status: string;
  source: string;
  hasDeposit: boolean;
  depositAmount: number;
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
  createdBy?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
};

type Stats = {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
  confirmedRevenue: number;
};

type SourceStats = {
  [key: string]: {
    count: number;
    revenue: number;
  };
};

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");
  const [updating, setUpdating] = useState<string | null>(null);

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
      setError("Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      setUpdating(bookingId);
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.ok) {
        // Update local state
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
        );
      } else {
        alert("Lỗi: " + data.message);
      }
    } catch (err) {
      alert("Lỗi khi cập nhật booking");
    } finally {
      setUpdating(null);
    }
  };

  const calculateStats = (): Stats => {
    return bookings.reduce(
      (acc, booking) => {
        acc.total++;
        if (booking.status === "PENDING") acc.pending++;
        if (booking.status === "CONFIRMED") {
          acc.confirmed++;
          acc.confirmedRevenue += booking.finalTotal;
          acc.totalRevenue += booking.finalTotal; // Chỉ tính doanh thu khi đã xác nhận
        }
        if (booking.status === "COMPLETED") acc.completed++;
        if (booking.status === "CANCELLED") acc.cancelled++;
        return acc;
      },
      {
        total: 0,
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
        totalRevenue: 0,
        confirmedRevenue: 0,
      }
    );
  };

  const calculateSourceStats = (): SourceStats => {
    return bookings.reduce((acc, booking) => {
      if (!acc[booking.source]) {
        acc[booking.source] = { count: 0, revenue: 0 };
      }
      acc[booking.source].count++;
      if (booking.status === "CONFIRMED") {
        acc[booking.source].revenue += booking.finalTotal;
      }
      return acc;
    }, {} as SourceStats);
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filterStatus !== "all" && booking.status !== filterStatus) return false;
    if (filterSource !== "all" && booking.source !== filterSource) return false;
    return true;
  });

  const stats = calculateStats();
  const sourceStats = calculateSourceStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case "WEB_DIRECT":
        return "Web (Khách)";
      case "F2_SELF":
        return "Thành Viên F2";
      default:
        return source;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Chờ xác nhận";
      case "CONFIRMED":
        return "Đã xác nhận";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#8b857a]">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-8">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif text-[#1a1a1a]">
          Quản Lý Đơn Hàng
        </h1>
        <button
          onClick={fetchBookings}
          className="px-4 py-2 bg-[#c9a24d] text-white rounded-lg hover:bg-[#b8933d] transition"
        >
          Làm mới
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-black/5">
          <div className="text-sm text-[#8b857a] mb-1">Tổng đơn</div>
          <div className="text-3xl font-bold text-[#1a1a1a]">{stats.total}</div>
        </div>

        <div className="bg-yellow-50 rounded-xl p-6 shadow-sm border border-yellow-200">
          <div className="text-sm text-yellow-700 mb-1">Chờ xác nhận</div>
          <div className="text-3xl font-bold text-yellow-800">{stats.pending}</div>
        </div>

        <div className="bg-blue-50 rounded-xl p-6 shadow-sm border border-blue-200">
          <div className="text-sm text-blue-700 mb-1">Đã xác nhận</div>
          <div className="text-3xl font-bold text-blue-800">{stats.confirmed}</div>
        </div>

        <div className="bg-green-50 rounded-xl p-6 shadow-sm border border-green-200">
          <div className="text-sm text-green-700 mb-1">Hoàn thành</div>
          <div className="text-3xl font-bold text-green-800">{stats.completed}</div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-black/5">
        <h2 className="text-xl font-serif text-[#1a1a1a] mb-4">Doanh Thu</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-[#8b857a] mb-2">Tổng doanh thu (chưa hủy)</div>
            <div className="text-2xl font-bold text-[#c9a24d]">
              {formatCurrency(stats.totalRevenue)}
            </div>
          </div>
          <div>
            <div className="text-sm text-[#8b857a] mb-2">Doanh thu đã xác nhận</div>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats.confirmedRevenue)}
            </div>
          </div>
        </div>
      </div>

      {/* Source Statistics */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-black/5">
        <h2 className="text-xl font-serif text-[#1a1a1a] mb-4">Thống Kê Theo Nguồn</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(sourceStats).map(([source, data]) => (
            <div key={source} className="border border-black/5 rounded-lg p-4">
              <div className="text-sm font-medium text-[#1a1a1a] mb-2">
                {getSourceLabel(source)}
              </div>
              <div className="text-2xl font-bold text-[#c9a24d] mb-1">
                {data.count} đơn
              </div>
              <div className="text-sm text-[#8b857a]">
                {formatCurrency(data.revenue)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-black/5">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm text-[#8b857a] mb-2">
              Lọc theo trạng thái
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-black/10 rounded-lg"
            >
              <option value="all">Tất cả</option>
              <option value="PENDING">Chờ xác nhận</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-[#8b857a] mb-2">
              Lọc theo nguồn
            </label>
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="px-4 py-2 border border-black/10 rounded-lg"
            >
              <option value="all">Tất cả</option>
              <option value="WEB_DIRECT">Web (Khách)</option>
              <option value="F2_SELF">Thành Viên F2</option>
            </select>
          </div>

          <div className="flex-1 flex items-end justify-end">
            <div className="text-sm text-[#8b857a]">
              Hiển thị {filteredBookings.length} / {bookings.length} đơn
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f8f6f4]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#8b857a] uppercase">
                  Khách hàng
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#8b857a] uppercase">
                  Nguồn (F2 → F1)
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#8b857a] uppercase">
                  Thời gian
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#8b857a] uppercase">
                  Combo
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[#8b857a] uppercase">
                  Số khách
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[#8b857a] uppercase">
                  Tổng tiền
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#8b857a] uppercase">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#8b857a] uppercase">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-[#8b857a]">
                    Không có đơn hàng nào
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => {
                  // Xác định nguồn đơn hàng (F2 → F1)
                  let sourceDisplay = "Web trực tiếp";
                  let sourceClass = "bg-gray-100 text-gray-700";
                  
                  if (booking.customer?.role === "F2_MEMBER") {
                    const f2Name = booking.customer.name;
                    const f1Name = booking.customer.referredBy?.name || "Không rõ";
                    sourceDisplay = `${f2Name} → ${f1Name}`;
                    sourceClass = "bg-gradient-to-r from-purple-100 to-amber-100 text-purple-900";
                  }
                  
                  return (
                  <tr key={booking.id} className="hover:bg-[#f8f6f4] transition">
                    <td className="px-4 py-4">
                      <div className="font-medium text-[#1a1a1a]">
                        {booking.customerName}
                      </div>
                      <div className="text-sm text-[#8b857a]">{booking.phone}</div>
                      {booking.email && (
                        <div className="text-xs text-[#8b857a]">{booking.email}</div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium ${sourceClass}`}>
                        {sourceDisplay}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-[#1a1a1a]">
                        {formatDate(booking.dateTime)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-[#1a1a1a]">
                        {booking.comboName}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-sm text-[#1a1a1a]">
                        {booking.guests}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="font-medium text-[#1a1a1a]">
                        {formatCurrency(booking.finalTotal)}
                      </div>
                      {booking.hasDeposit && (
                        <div className="text-xs text-[#8b857a]">
                          Đặt cọc: {formatCurrency(booking.depositAmount)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {getStatusLabel(booking.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2 justify-center">
                        {booking.status === "PENDING" && (
                          <>
                            <button 
                              onClick={() => updateBookingStatus(booking.id, "CONFIRMED")}
                              disabled={updating === booking.id}
                              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
                            >
                              {updating === booking.id ? "..." : "Xác nhận"}
                            </button>
                            <button 
                              onClick={() => updateBookingStatus(booking.id, "CANCELLED")}
                              disabled={updating === booking.id}
                              className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50"
                            >
                              {updating === booking.id ? "..." : "Hủy"}
                            </button>
                          </>
                        )}
                        {booking.status === "CONFIRMED" && (
                          <button 
                            onClick={() => updateBookingStatus(booking.id, "COMPLETED")}
                            disabled={updating === booking.id}
                            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
                          >
                            {updating === booking.id ? "..." : "Hoàn thành"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
