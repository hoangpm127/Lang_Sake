"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  FaChartLine,
  FaMoneyBillWave,
  FaUsers,
  FaShoppingCart,
  FaPercentage,
  FaFileExport,
  FaSync,
  FaCalendarAlt,
} from "react-icons/fa";

const COLORS = ["#c9a24d", "#8b7355", "#4a90e2", "#50c878", "#ff6b6b"];

type Metrics = {
  totalRevenue: number;
  avgBookingValue: number;
  totalDepositValue: number;
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  conversionRate: number;
  depositRate: number;
  depositsPaid: number;
  depositsTotal: number;
  totalCommission: number;
  paidCommission: number;
  pendingCommission: number;
  uniqueCustomers: number;
};

type SourceBreakdown = {
  [key: string]: {
    count: number;
    revenue: number;
  };
};

type TopPartner = {
  id: string;
  name: string;
  email: string;
  totalCommission: number;
  bookingCount: number;
  tier1: number;
  tier2: number;
};

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [sourceBreakdown, setSourceBreakdown] = useState<SourceBreakdown>({});
  const [topPartners, setTopPartners] = useState<TopPartner[]>([]);

  // Trends data
  const [revenueTrend, setRevenueTrend] = useState<any[]>([]);
  const [bookingsTrend, setBookingsTrend] = useState<any[]>([]);
  const [commissionTrend, setCommissionTrend] = useState<any[]>([]);
  const [sourceTrend, setSourceTrend] = useState<any[]>([]);
  const [tierTrend, setTierTrend] = useState<any[]>([]);

  // Filters
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [groupBy, setGroupBy] = useState("day");

  useEffect(() => {
    // Set default date range: last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    setDateFrom(thirtyDaysAgo.toISOString().split("T")[0]);
    setDateTo(today.toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    if (dateFrom && dateTo) {
      fetchAnalytics();
    }
  }, [dateFrom, dateTo, groupBy]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch overview metrics
      const overviewParams = new URLSearchParams();
      if (dateFrom) overviewParams.append("dateFrom", dateFrom);
      if (dateTo) overviewParams.append("dateTo", dateTo);

      const overviewRes = await fetch(`/api/analytics/overview?${overviewParams.toString()}`);
      const overviewData = await overviewRes.json();

      if (overviewData.ok) {
        setMetrics(overviewData.metrics);
        setSourceBreakdown(overviewData.sourceBreakdown);
        setTopPartners(overviewData.topF1Partners);
      } else {
        toast.error(overviewData.message);
      }

      // Fetch trends
      const trendsParams = new URLSearchParams();
      if (dateFrom) trendsParams.append("dateFrom", dateFrom);
      if (dateTo) trendsParams.append("dateTo", dateTo);
      trendsParams.append("groupBy", groupBy);

      const trendsRes = await fetch(`/api/analytics/trends?${trendsParams.toString()}`);
      const trendsData = await trendsRes.json();

      if (trendsData.ok) {
        setRevenueTrend(trendsData.revenueTrend);
        setBookingsTrend(trendsData.bookingsTrend);
        setCommissionTrend(trendsData.commissionTrend);
        setSourceTrend(trendsData.sourceTrend);
        setTierTrend(trendsData.tierTrend);
      } else {
        toast.error(trendsData.message);
      }
    } catch (err) {
      toast.error("Lỗi khi tải analytics");
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

  const exportReport = () => {
    if (!metrics) {
      toast.error("Không có dữ liệu để export");
      return;
    }

    const reportData = [
      ["BÁNH CÁO PHÂN TÍCH"],
      [`Từ ngày: ${dateFrom} - Đến ngày: ${dateTo}`],
      [""],
      ["TỔNG QUAN"],
      ["Tổng doanh thu", formatCurrency(metrics.totalRevenue)],
      ["Tổng booking", metrics.totalBookings],
      ["Booking xác nhận", metrics.confirmedBookings],
      ["Tỷ lệ chuyển đổi", `${metrics.conversionRate.toFixed(2)}%`],
      ["Giá trị TB/booking", formatCurrency(metrics.avgBookingValue)],
      [""],
      ["TIỀN CỌC"],
      ["Tỷ lệ thanh toán cọc", `${metrics.depositRate.toFixed(2)}%`],
      ["Đã thanh toán", `${metrics.depositsPaid}/${metrics.depositsTotal}`],
      ["Tổng tiền cọc", formatCurrency(metrics.totalDepositValue)],
      [""],
      ["HOA HỒNG"],
      ["Tổng hoa hồng", formatCurrency(metrics.totalCommission)],
      ["Đã thanh toán", formatCurrency(metrics.paidCommission)],
      ["Chờ thanh toán", formatCurrency(metrics.pendingCommission)],
      [""],
      ["NGUỒN BOOKING"],
      ...Object.entries(sourceBreakdown).map(([source, data]) => [
        source,
        data.count,
        formatCurrency(data.revenue),
      ]),
    ];

    const csv = reportData.map((row) => row.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analytics_report_${dateFrom}_${dateTo}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success("Export thành công!");
  };

  const getQuickDateRange = (days: number) => {
    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - days);
    
    setDateFrom(pastDate.toISOString().split("T")[0]);
    setDateTo(today.toISOString().split("T")[0]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FaSync className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải analytics...</p>
        </div>
      </div>
    );
  }

  // Prepare pie chart data
  const sourceChartData = Object.entries(sourceBreakdown).map(([source, data]) => ({
    name: source.replace("_", " "),
    value: data.count,
    revenue: data.revenue,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
          <p className="text-gray-600 mt-1">Phân tích hiệu suất kinh doanh</p>
        </div>
        <button
          onClick={exportReport}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <FaFileExport />
          Export Report
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 border">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaCalendarAlt className="inline mr-2" />
              Khoảng thời gian
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <span className="flex items-center text-gray-500">→</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nhóm theo
            </label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="day">Ngày</option>
              <option value="week">Tuần</option>
              <option value="month">Tháng</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Select
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => getQuickDateRange(7)}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
              >
                7 ngày
              </button>
              <button
                onClick={() => getQuickDateRange(30)}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
              >
                30 ngày
              </button>
              <button
                onClick={() => getQuickDateRange(90)}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
              >
                90 ngày
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Tổng doanh thu</p>
                <p className="text-3xl font-bold mt-2">{formatCurrency(metrics.totalRevenue)}</p>
                <p className="text-blue-100 text-xs mt-2">
                  TB: {formatCurrency(metrics.avgBookingValue)}/booking
                </p>
              </div>
              <FaMoneyBillWave className="text-5xl text-blue-200 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Tổng booking</p>
                <p className="text-3xl font-bold mt-2">{metrics.totalBookings}</p>
                <p className="text-green-100 text-xs mt-2">
                  Xác nhận: {metrics.confirmedBookings} ({metrics.conversionRate.toFixed(1)}%)
                </p>
              </div>
              <FaShoppingCart className="text-5xl text-green-200 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Hoa hồng</p>
                <p className="text-3xl font-bold mt-2">{formatCurrency(metrics.totalCommission)}</p>
                <p className="text-purple-100 text-xs mt-2">
                  Chờ: {formatCurrency(metrics.pendingCommission)}
                </p>
              </div>
              <FaPercentage className="text-5xl text-purple-200 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Khách hàng</p>
                <p className="text-3xl font-bold mt-2">{metrics.uniqueCustomers}</p>
                <p className="text-orange-100 text-xs mt-2">
                  Tỷ lệ cọc: {metrics.depositRate.toFixed(1)}%
                </p>
              </div>
              <FaUsers className="text-5xl text-orange-200 opacity-50" />
            </div>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaChartLine className="text-blue-600" />
            Doanh thu theo thời gian
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: any) => formatCurrency(value)} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#c9a24d"
                fill="#c9a24d"
                fillOpacity={0.6}
                name="Doanh thu"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bookings Trend */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking theo thời gian</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bookingsTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#8884d8" name="Tổng" />
              <Bar dataKey="confirmed" fill="#82ca9d" name="Xác nhận" />
              <Bar dataKey="cancelled" fill="#ff6b6b" name="Hủy" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Commission Trend */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hoa hồng theo tầng</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={tierTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: any) => formatCurrency(value)} />
              <Legend />
              <Area
                type="monotone"
                dataKey="tier1"
                stackId="1"
                stroke="#c9a24d"
                fill="#c9a24d"
                name="Tier 1 (10%)"
              />
              <Area
                type="monotone"
                dataKey="tier2"
                stackId="1"
                stroke="#8b7355"
                fill="#8b7355"
                name="Tier 2 (5%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Source Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nguồn booking</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sourceChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {sourceChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top F1 Partners Table */}
      {topPartners.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top 10 F1 Partners
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Tên
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Email
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                    Booking
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                    Tier 1
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                    Tier 2
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                    Tổng HH
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {topPartners.map((partner, index) => (
                  <tr key={partner.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{partner.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{partner.email}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {partner.bookingCount}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {formatCurrency(partner.tier1)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {formatCurrency(partner.tier2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                      {formatCurrency(partner.totalCommission)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
