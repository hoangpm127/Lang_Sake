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
  booking: {
    id: string;
    customerName: string;
    phone: string;
    dateTime: string;
    finalTotal: number;
    status: string;
  };
};

type F1Commission = {
  id: string;
  amount: number;
  rate: number;
  status: string;
  createdAt: string;
  partner: {
    id: string;
    name: string;
    email: string;
  };
  booking: {
    id: string;
    customerName: string;
    dateTime: string;
    finalTotal: number;
  };
};

type Stats = {
  total: number;
  pending: number;
  approved: number;
  paid: number;
  totalAmount: number;
  pendingAmount: number;
  approvedAmount: number;
  paidAmount: number;
};

export default function F2CommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [f1Commissions, setF1Commissions] = useState<F1Commission[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showF1View, setShowF1View] = useState(false);

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
        setF1Commissions(data.f1ManagerCommissions || []);
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

  const f1TotalAmount = f1Commissions.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-serif text-[#1a1a1a]">Thu Nhập Của Tôi</h1>
          <p className="text-sm text-[#8b857a] mt-1">Hoa hồng từ việc giới thiệu khách hàng</p>
        </div>
        
        {f1Commissions.length > 0 && (
          <button
            onClick={() => setShowF1View(!showF1View)}
            className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition font-medium text-sm"
          >
            {showF1View ? "Xem hoa hồng của tôi" : "Xem hoa hồng F1 Manager"}
          </button>
        )}
      </div>

      {!showF1View ? (
        <>
          {/* My Commissions */}
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

          {/* Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-blue-900">Cách tính hoa hồng</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Bạn nhận <strong>10% (Tier 1)</strong> hoa hồng từ mỗi booking mà bạn tự đặt cho khách hàng. 
                  F1 Manager của bạn sẽ nhận thêm <strong>5% (Tier 2)</strong> từ doanh số của bạn.
                </p>
              </div>
            </div>
          </div>

          {/* Commissions Table */}
          <div className="bg-white rounded-xl shadow-sm border border-black/5 overflow-hidden">
            <div className="p-6 border-b border-black/5">
              <h2 className="text-xl font-serif text-[#1a1a1a]">Lịch sử hoa hồng</h2>
              <p className="text-sm text-[#8b857a] mt-1">Tier 1 - 10% từ bookings của bạn</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f8f6f4]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#8b857a] uppercase">Ngày</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#8b857a] uppercase">Khách hàng</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-[#8b857a] uppercase">Giá trị booking</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-[#8b857a] uppercase">Hoa hồng (10%)</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-[#8b857a] uppercase">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {commissions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <p className="text-sm text-[#8b857a]">Chưa có hoa hồng nào</p>
                      </td>
                    </tr>
                  ) : (
                    commissions.map((commission) => (
                      <tr key={commission.id} className="hover:bg-[#f8f6f4] transition">
                        <td className="px-6 py-4">
                          <p className="text-sm text-[#1a1a1a]">{formatDateTime(commission.createdAt)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-[#1a1a1a]">{commission.booking.customerName}</p>
                          <p className="text-xs text-[#8b857a]">{commission.booking.phone}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="text-sm font-semibold text-[#1a1a1a]">{formatCurrency(commission.booking.finalTotal)}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="text-sm font-bold text-[#c9a24d]">{formatCurrency(commission.amount)}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {getStatusBadge(commission.status)}
                          {commission.status === "PAID" && commission.paidAt && (
                            <p className="text-xs text-green-600 mt-1">{formatDateTime(commission.paidAt)}</p>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* F1 Manager Commissions View */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-purple-900">Hoa hồng của F1 Manager từ bạn</h2>
            <p className="text-sm text-purple-700 mt-1">
              F1 Manager nhận <strong>5% (Tier 2)</strong> hoa hồng quản lý từ doanh số của bạn
            </p>
            <div className="mt-4 bg-white rounded-lg p-4">
              <p className="text-sm text-[#8b857a]">Tổng hoa hồng F1 Manager đã nhận từ bạn:</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{formatCurrency(f1TotalAmount)}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-black/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f8f6f4]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#8b857a] uppercase">F1 Manager</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#8b857a] uppercase">Ngày</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#8b857a] uppercase">Khách hàng</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-[#8b857a] uppercase">Giá trị</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-[#8b857a] uppercase">Hoa hồng (5%)</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-[#8b857a] uppercase">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {f1Commissions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <p className="text-sm text-[#8b857a]">Không có dữ liệu</p>
                      </td>
                    </tr>
                  ) : (
                    f1Commissions.map((commission) => (
                      <tr key={commission.id} className="hover:bg-[#f8f6f4] transition">
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-purple-700">{commission.partner.name}</p>
                          <p className="text-xs text-[#8b857a]">{commission.partner.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-[#1a1a1a]">{formatDateTime(commission.createdAt)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-[#1a1a1a]">{commission.booking.customerName}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="text-sm font-semibold text-[#1a1a1a]">{formatCurrency(commission.booking.finalTotal)}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="text-sm font-bold text-purple-600">{formatCurrency(commission.amount)}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {getStatusBadge(commission.status)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
