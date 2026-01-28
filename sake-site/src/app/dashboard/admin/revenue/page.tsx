"use client";

import { useEffect, useState } from "react";

type Booking = {
  id: string;
  dateTime: string;
  finalTotal: number;
  status: string;
  createdAt: string;
};

type DailyRevenue = {
  date: string;
  revenue: number;
  bookingCount: number;
};

type MonthlyRevenue = {
  month: string;
  revenue: number;
  bookingCount: number;
};

export default function RevenuePage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"daily" | "monthly">("daily");
  const [chartType, setChartType] = useState<"bar" | "line">("bar");
  const [selectedMonth, setSelectedMonth] = useState(new Date());

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
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getDailyRevenue = (): DailyRevenue[] => {
    const revenueMap = new Map<string, { revenue: number; count: number }>();

    bookings
      .filter((b) => b.status === "CONFIRMED")
      .forEach((booking) => {
        const date = new Date(booking.dateTime).toISOString().split("T")[0];
        const current = revenueMap.get(date) || { revenue: 0, count: 0 };
        revenueMap.set(date, {
          revenue: current.revenue + booking.finalTotal,
          count: current.count + 1,
        });
      });

    return Array.from(revenueMap.entries())
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        bookingCount: data.count,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30); // Last 30 days
  };

  const getMonthlyRevenue = (): MonthlyRevenue[] => {
    const revenueMap = new Map<string, { revenue: number; count: number }>();

    bookings
      .filter((b) => b.status === "CONFIRMED")
      .forEach((booking) => {
        const date = new Date(booking.dateTime);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        const current = revenueMap.get(monthKey) || { revenue: 0, count: 0 };
        revenueMap.set(monthKey, {
          revenue: current.revenue + booking.finalTotal,
          count: current.count + 1,
        });
      });

    return Array.from(revenueMap.entries())
      .map(([month, data]) => ({
        month,
        revenue: data.revenue,
        bookingCount: data.count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12); // Last 12 months
  };

  const getTotalStats = () => {
    const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED");
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + b.finalTotal, 0);
    const avgRevenue = confirmedBookings.length > 0 ? totalRevenue / confirmedBookings.length : 0;

    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const thisMonthBookings = confirmedBookings.filter((b) => {
      const date = new Date(b.dateTime);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    });
    const thisMonthRevenue = thisMonthBookings.reduce((sum, b) => sum + b.finalTotal, 0);

    return {
      totalRevenue,
      avgRevenue,
      totalBookings: confirmedBookings.length,
      thisMonthRevenue,
      thisMonthBookings: thisMonthBookings.length,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#8b857a]">Đang tải dữ liệu...</div>
      </div>
    );
  }

  const dailyRevenue = getDailyRevenue();
  const monthlyRevenue = getMonthlyRevenue();
  const stats = getTotalStats();
  const maxRevenue =
    view === "daily"
      ? Math.max(...dailyRevenue.map((d) => d.revenue))
      : Math.max(...monthlyRevenue.map((m) => m.revenue));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif text-[#1a1a1a]">Biểu Đồ Doanh Thu</h1>

        <div className="flex gap-3">
          {/* Chart Type Toggle */}
          <div className="flex gap-2 bg-white border border-black/10 rounded-lg p-1">
            <button
              onClick={() => setChartType("bar")}
              className={`px-3 py-1.5 rounded text-xs font-medium transition ${
                chartType === "bar"
                  ? "bg-[#c9a24d] text-white"
                  : "text-[#8b857a] hover:bg-[#f8f6f4]"
              }`}
            >
              📊 Cột
            </button>
            <button
              onClick={() => setChartType("line")}
              className={`px-3 py-1.5 rounded text-xs font-medium transition ${
                chartType === "line"
                  ? "bg-[#c9a24d] text-white"
                  : "text-[#8b857a] hover:bg-[#f8f6f4]"
              }`}
            >
              📈 Đường
            </button>
          </div>

          {/* Time Period Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setView("daily")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                view === "daily"
                  ? "bg-[#c9a24d] text-white"
                  : "bg-white text-[#8b857a] border border-black/10"
              }`}
            >
              30 ngày
            </button>
            <button
              onClick={() => setView("monthly")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                view === "monthly"
                  ? "bg-[#c9a24d] text-white"
                  : "bg-white text-[#8b857a] border border-black/10"
              }`}
            >
              12 tháng
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-black/5">
          <div className="text-sm text-[#8b857a] mb-1">Tổng doanh thu</div>
          <div className="text-2xl font-bold text-[#c9a24d]">
            {formatCurrency(stats.totalRevenue)}
          </div>
          <div className="text-xs text-[#8b857a] mt-1">
            {stats.totalBookings} đơn hàng
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-black/5">
          <div className="text-sm text-[#8b857a] mb-1">Doanh thu tháng này</div>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(stats.thisMonthRevenue)}
          </div>
          <div className="text-xs text-[#8b857a] mt-1">
            {stats.thisMonthBookings} đơn hàng
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-black/5">
          <div className="text-sm text-[#8b857a] mb-1">Doanh thu trung bình/đơn</div>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(stats.avgRevenue)}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-black/5">
          <div className="text-sm text-[#8b857a] mb-1">Doanh thu cao nhất</div>
          <div className="text-2xl font-bold text-purple-600">
            {formatCurrency(maxRevenue)}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-black/5">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-serif text-[#1a1a1a]">
            {view === "daily" ? "30 ngày gần nhất" : "12 tháng gần nhất"}
          </h2>
          <div className="text-xs text-[#8b857a]">
            {chartType === "bar" ? "Biểu đồ cột" : "Biểu đồ đường"}
          </div>
        </div>

        {chartType === "bar" ? (
          /* Bar Chart */
          <div className="space-y-3">
            {view === "daily"
              ? dailyRevenue.map((item) => {
                  const percentage = (item.revenue / maxRevenue) * 100;
                  return (
                    <div key={item.date} className="flex items-center gap-4">
                      <div className="w-20 text-xs text-[#8b857a]">
                        {new Date(item.date).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-8 bg-[#f8f6f4] rounded-lg overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#c9a24d] to-[#b8933d] transition-all duration-500 flex items-center justify-end pr-2"
                              style={{ width: `${percentage}%` }}
                            >
                              {percentage > 20 && (
                                <span className="text-xs font-medium text-white">
                                  {formatCurrency(item.revenue)}
                                </span>
                              )}
                            </div>
                          </div>
                          {percentage <= 20 && (
                            <span className="text-xs font-medium text-[#8b857a] w-32">
                              {formatCurrency(item.revenue)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="w-14 text-xs text-[#8b857a] text-right">
                        {item.bookingCount} đơn
                      </div>
                    </div>
                  );
                })
              : monthlyRevenue.map((item) => {
                  const percentage = (item.revenue / maxRevenue) * 100;
                  return (
                    <div key={item.month} className="flex items-center gap-4">
                      <div className="w-20 text-xs text-[#8b857a]">
                        {item.month.split("-")[1]}/{item.month.split("-")[0].slice(2)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-10 bg-[#f8f6f4] rounded-lg overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#c9a24d] to-[#b8933d] transition-all duration-500 flex items-center justify-end pr-3"
                              style={{ width: `${percentage}%` }}
                            >
                              {percentage > 20 && (
                                <span className="text-sm font-medium text-white">
                                  {formatCurrency(item.revenue)}
                                </span>
                              )}
                            </div>
                          </div>
                          {percentage <= 20 && (
                            <span className="text-sm font-medium text-[#8b857a] w-32">
                              {formatCurrency(item.revenue)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="w-14 text-xs text-[#8b857a] text-right">
                        {item.bookingCount} đơn
                      </div>
                    </div>
                  );
                })}
          </div>
        ) : (
          /* Line Chart */
          <div className="relative h-80">
            <svg className="w-full h-full" viewBox="0 0 800 320">
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <line
                  key={i}
                  x1="60"
                  y1={60 + i * 50}
                  x2="780"
                  y2={60 + i * 50}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              ))}

              {/* Y-axis labels */}
              {[0, 1, 2, 3, 4].map((i) => {
                const value = maxRevenue - (i * maxRevenue) / 4;
                return (
                  <text
                    key={i}
                    x="50"
                    y={65 + i * 50}
                    textAnchor="end"
                    fontSize="10"
                    fill="#8b857a"
                  >
                    {(value / 1000000).toFixed(0)}M
                  </text>
                );
              })}

              {/* Line path */}
              {(() => {
                const data = view === "daily" ? dailyRevenue : monthlyRevenue;
                if (data.length === 0) return null;

                const points = data.map((item, index) => {
                  const x = 60 + (index / (data.length - 1 || 1)) * 720;
                  const y = 260 - (item.revenue / maxRevenue) * 200;
                  return `${x},${y}`;
                });

                return (
                  <>
                    {/* Line */}
                    <polyline
                      points={points.join(" ")}
                      fill="none"
                      stroke="#c9a24d"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Dots and labels */}
                    {data.map((item, index) => {
                      const x = 60 + (index / (data.length - 1 || 1)) * 720;
                      const y = 260 - (item.revenue / maxRevenue) * 200;
                      return (
                        <g key={index}>
                          {/* Dot */}
                          <circle cx={x} cy={y} r="5" fill="#c9a24d" />
                          <circle cx={x} cy={y} r="3" fill="white" />

                          {/* X-axis label */}
                          <text
                            x={x}
                            y="290"
                            textAnchor="middle"
                            fontSize="9"
                            fill="#8b857a"
                          >
                            {view === "daily"
                              ? new Date(item.date).getDate()
                              : item.month.split("-")[1]}
                          </text>

                          {/* Value tooltip */}
                          {index % Math.ceil(data.length / 10) === 0 && (
                            <text
                              x={x}
                              y={y - 12}
                              textAnchor="middle"
                              fontSize="9"
                              fill="#1a1a1a"
                              fontWeight="600"
                            >
                              {(item.revenue / 1000000).toFixed(1)}M
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </>
                );
              })()}
            </svg>
          </div>
        )}

        {(view === "daily" ? dailyRevenue : monthlyRevenue).length === 0 && (
          <div className="text-center text-[#8b857a] py-12">
            Chưa có dữ liệu doanh thu đã xác nhận
          </div>
        )}
      </div>
    </div>
  );
}
