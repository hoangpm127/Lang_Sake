"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

type Commission = {
  id: string;
  amount: number;
  rate: number;
  tier: number;
  status: "PENDING" | "APPROVED" | "PAID" | "CANCELLED" | "REJECTED";
  createdAt: string;
  paidAt?: string;
  paymentMethod?: string;
  rejectionReason?: string;
  booking: {
    id: string;
    customerName: string;
    phone: string;
    dateTime: string;
    finalTotal: number;
    status: string;
    source: string;
    customer?: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  };
};

type Stats = {
  total: number;
  pending: number;
  approved: number;
  paid: number;
  rejected: number;
  totalAmount: number;
  pendingAmount: number;
  approvedAmount: number;
  paidAmount: number;
  tier1Count: number;
  tier2Count: number;
  tier1Amount: number;
  tier2Amount: number;
};

export default function F1CommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterTier, setFilterTier] = useState<string>("all");

  useEffect(() => {
    fetchCommissions();
  }, []);

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/commissions/history");
      const data = await response.json();

      if (data.ok) {
        setCommissions(data.commissions);
        setStats(data.stats);
      } else {
        toast.error(data.message || "Không thể tải lịch sử hoa hồng");
      }
    } catch (error) {
      toast.error("Lỗi khi tải lịch sử hoa hồng");
      console.error(error);
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

  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { bg: string; text: string; label: string }> = {
      PENDING: { bg: "bg-yellow-50", text: "text-yellow-700", label: "Chờ duyệt" },
      APPROVED: { bg: "bg-blue-50", text: "text-blue-700", label: "Đã duyệt" },
      PAID: { bg: "bg-green-50", text: "text-green-700", label: "Đã trả" },
      REJECTED: { bg: "bg-red-50", text: "text-red-700", label: "Từ chối" },
      CANCELLED: { bg: "bg-gray-50", text: "text-gray-700", label: "Đã hủy" },
    };
    const config = configs[status] || configs.PENDING;
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getTierBadge = (tier: number) => {
    if (tier === 1) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
          T1 - Sale (10%)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700">
        T2 - Quản lý (5%)
      </span>
    );
  };

  const filteredCommissions = commissions.filter((commission) => {
    if (filterStatus !== "all" && commission.status !== filterStatus) return false;
    if (filterTier !== "all" && commission.tier !== parseInt(filterTier)) return false;
    return true;
  });

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

  if (!stats) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-red-800">Không thể tải thống kê hoa hồng</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif text-[#1a1a1a]">Lịch Sử Hoa Hồng</h1>
        <p className="text-sm text-[#8b857a] mt-1">Theo dõi thu nhập từ hệ thống affiliate</p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 lg:grid-cols-4">
        <div className="bg-gradient-to-br from-[#c9a24d] to-[#b8914d] rounded-xl p-6 shadow-lg text-white">
          <p className="text-sm opacity-90">Tổng thu nhập</p>
          <p className="text-3xl font-bold mt-2">{formatCurrency(stats.totalAmount)}</p>
          <p className="text-xs opacity-75 mt-1">{stats.total} hoa hồng</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-green-200">
          <p className="text-sm text-green-700">Đã thanh toán</p>
          <p className="text-2xl font-bold text-green-900 mt-2">{formatCurrency(stats.paidAmount)}</p>
          <p className="text-xs text-green-600 mt-1">{stats.paid} hoa hồng</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200">
          <p className="text-sm text-blue-700">Đã duyệt</p>
          <p className="text-2xl font-bold text-blue-900 mt-2">{formatCurrency(stats.approvedAmount)}</p>
          <p className="text-xs text-blue-600 mt-1">{stats.approved} hoa hồng</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-yellow-200">
          <p className="text-sm text-yellow-700">Chờ duyệt</p>
          <p className="text-2xl font-bold text-yellow-900 mt-2">{formatCurrency(stats.pendingAmount)}</p>
          <p className="text-xs text-yellow-600 mt-1">{stats.pending} hoa hồng</p>
        </div>
      </div>

      {/* Tier Breakdown */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">Tier 1 - Sale Trực Tiếp</p>
              <p className="text-xs text-blue-600 mt-1">Từ F2 tự đặt</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(stats.tier1Amount)}</p>
              <p className="text-xs text-blue-600 mt-1">{stats.tier1Count} hoa hồng</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 font-medium">Tier 2 - Quản Lý F2</p>
              <p className="text-xs text-purple-600 mt-1">Từ F2 dưới quyền</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-purple-900">{formatCurrency(stats.tier2Amount)}</p>
              <p className="text-xs text-purple-600 mt-1">{stats.tier2Count} hoa hồng</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-black/5 p-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Lọc theo trạng thái</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a24d]"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="PAID">Đã thanh toán</option>
              <option value="REJECTED">Từ chối</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Lọc theo tầng</label>
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a24d]"
            >
              <option value="all">Tất cả tầng</option>
              <option value="1">Tier 1 - Sale</option>
              <option value="2">Tier 2 - Quản lý</option>
            </select>
          </div>
        </div>
      </div>

      {/* Commissions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f8f6f4]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#8b857a] uppercase">Ngày</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#8b857a] uppercase">Khách hàng</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#8b857a] uppercase">F2 Member</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#8b857a] uppercase">Tầng</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-[#8b857a] uppercase">Giá trị</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-[#8b857a] uppercase">Hoa hồng</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-[#8b857a] uppercase">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredCommissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <p className="text-sm text-[#8b857a]">Chưa có hoa hồng nào</p>
                  </td>
                </tr>
              ) : (
                filteredCommissions.map((commission) => (
                  <tr key={commission.id} className="hover:bg-[#f8f6f4] transition">
                    <td className="px-6 py-4">
                      <p className="text-sm text-[#1a1a1a]">{formatDateTime(commission.createdAt)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-[#1a1a1a]">{commission.booking.customerName}</p>
                      <p className="text-xs text-[#8b857a]">{commission.booking.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      {commission.booking.customer ? (
                        <div>
                          <p className="text-sm font-medium text-[#1a1a1a]">{commission.booking.customer.name}</p>
                          <p className="text-xs text-[#8b857a]">{commission.booking.customer.email}</p>
                        </div>
                      ) : (
                        <span className="text-sm text-[#8b857a]">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getTierBadge(commission.tier)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-semibold text-[#1a1a1a]">{formatCurrency(commission.booking.finalTotal)}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-bold text-[#c9a24d]">{formatCurrency(commission.amount)}</p>
                      <p className="text-xs text-[#8b857a]">{commission.rate}%</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(commission.status)}
                      {commission.status === "PAID" && commission.paidAt && (
                        <p className="text-xs text-green-600 mt-1">{formatDateTime(commission.paidAt)}</p>
                      )}
                      {commission.rejectionReason && (
                        <p className="text-xs text-red-600 mt-1">{commission.rejectionReason}</p>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
