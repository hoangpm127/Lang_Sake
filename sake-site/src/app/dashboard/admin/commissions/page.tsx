"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

type Commission = {
  id: string;
  amount: number;
  rate: number;
  tier: number;
  status: "PENDING" | "APPROVED" | "PAID" | "CANCELLED" | "REJECTED";
  isPaid: boolean;
  createdAt: string;
  paidAt?: string;
  paymentMethod?: string;
  paymentRef?: string;
  rejectionReason?: string;
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
    status: string;
  };
};

type Stats = {
  totalCommissions: number;
  pendingCount: number;
  approvedCount: number;
  paidCount: number;
  rejectedCount: number;
  cancelledCount: number;
  totalAmount: number;
  pendingAmount: number;
  approvedAmount: number;
  paidAmount: number;
};

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalCommissions: 0,
    pendingCount: 0,
    approvedCount: 0,
    paidCount: 0,
    rejectedCount: 0,
    cancelledCount: 0,
    totalAmount: 0,
    pendingAmount: 0,
    approvedAmount: 0,
    paidAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filterPartner, setFilterPartner] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [partners, setPartners] = useState<Array<{ id: string; name: string }>>([]);
  
  // Modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentRef, setPaymentRef] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchCommissions = async () => {
    try {
      const response = await fetch("/api/commissions");
      const data = await response.json();

      if (data.ok) {
        setCommissions(data.commissions);
        
        // Calculate stats
        const calcStats: Stats = {
          totalCommissions: data.commissions.length,
          pendingCount: data.commissions.filter((c: Commission) => c.status === "PENDING").length,
          approvedCount: data.commissions.filter((c: Commission) => c.status === "APPROVED").length,
          paidCount: data.commissions.filter((c: Commission) => c.status === "PAID").length,
          rejectedCount: data.commissions.filter((c: Commission) => c.status === "REJECTED").length,
          cancelledCount: data.commissions.filter((c: Commission) => c.status === "CANCELLED").length,
          totalAmount: data.commissions.reduce((sum: number, c: Commission) => sum + c.amount, 0),
          pendingAmount: data.commissions.filter((c: Commission) => c.status === "PENDING").reduce((sum: number, c: Commission) => sum + c.amount, 0),
          approvedAmount: data.commissions.filter((c: Commission) => c.status === "APPROVED").reduce((sum: number, c: Commission) => sum + c.amount, 0),
          paidAmount: data.commissions.filter((c: Commission) => c.status === "PAID").reduce((sum: number, c: Commission) => sum + c.amount, 0),
        };
        setStats(calcStats);
        
        // Extract unique partners
        const uniquePartners = Array.from(
          new Map(
            data.commissions.map((c: Commission) => [
              c.partner.id,
              { id: c.partner.id, name: c.partner.name }
            ])
          ).values()
        ) as Array<{ id: string; name: string }>;
        setPartners(uniquePartners);
      } else {
        toast.error(data.message || "Không thể tải danh sách hoa hồng");
      }
    } catch (error) {
      toast.error("Lỗi khi tải danh sách hoa hồng");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommissions();
  }, []);

  const handleAction = async (commissionId: string, action: string, extraData?: any) => {
    try {
      const response = await fetch(`/api/commissions/${commissionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extraData }),
      });

      const data = await response.json();

      if (data.ok) {
        toast.success(data.message);
        fetchCommissions();
        setShowPaymentModal(false);
        setShowRejectModal(false);
        setSelectedCommission(null);
      } else {
        toast.error(data.message || "Không thể cập nhật");
      }
    } catch (error) {
      toast.error("Lỗi khi cập nhật");
      console.error(error);
    }
  };

  const openPaymentModal = (commission: Commission) => {
    setSelectedCommission(commission);
    setPaymentMethod("Bank Transfer");
    setPaymentRef("");
    setPaymentNotes("");
    setShowPaymentModal(true);
  };

  const openRejectModal = (commission: Commission) => {
    setSelectedCommission(commission);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const handlePay = () => {
    if (!selectedCommission) return;
    handleAction(selectedCommission.id, "pay", {
      paymentMethod,
      paymentRef,
      paymentNotes,
    });
  };

  const handleReject = () => {
    if (!selectedCommission || !rejectionReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }
    handleAction(selectedCommission.id, "reject", { rejectionReason });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
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
          T1 - Sale
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700">
        T2 - Quản lý
      </span>
    );
  };

  const filteredCommissions = commissions.filter((commission) => {
    if (filterPartner !== "all" && commission.partner.id !== filterPartner) return false;
    if (filterStatus !== "all" && commission.status !== filterStatus) return false;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif text-[#1a1a1a]">Quản Lý Hoa Hồng</h1>
        <p className="text-sm text-[#8b857a] mt-1">Duyệt và thanh toán hoa hồng cho đối tác</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-black/5">
          <p className="text-sm text-[#8b857a]">Tổng hoa hồng</p>
          <p className="text-2xl font-bold text-[#1a1a1a] mt-1">{stats.totalCommissions}</p>
          <p className="text-xs text-[#c9a24d] font-semibold mt-1">{formatCurrency(stats.totalAmount)}</p>
        </div>

        <div className="bg-yellow-50 rounded-xl p-6 shadow-sm border border-yellow-200">
          <p className="text-sm text-yellow-700">Chờ duyệt</p>
          <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.pendingCount}</p>
          <p className="text-xs text-yellow-600 font-semibold mt-1">{formatCurrency(stats.pendingAmount)}</p>
        </div>

        <div className="bg-blue-50 rounded-xl p-6 shadow-sm border border-blue-200">
          <p className="text-sm text-blue-700">Đã duyệt</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{stats.approvedCount}</p>
          <p className="text-xs text-blue-600 font-semibold mt-1">{formatCurrency(stats.approvedAmount)}</p>
        </div>

        <div className="bg-green-50 rounded-xl p-6 shadow-sm border border-green-200">
          <p className="text-sm text-green-700">Đã thanh toán</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{stats.paidCount}</p>
          <p className="text-xs text-green-600 font-semibold mt-1">{formatCurrency(stats.paidAmount)}</p>
        </div>

        <div className="bg-red-50 rounded-xl p-6 shadow-sm border border-red-200">
          <p className="text-sm text-red-700">Từ chối</p>
          <p className="text-2xl font-bold text-red-900 mt-1">{stats.rejectedCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-black/5 p-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Lọc theo đối tác</label>
            <select
              value={filterPartner}
              onChange={(e) => setFilterPartner(e.target.value)}
              className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a24d]"
            >
              <option value="all">Tất cả đối tác</option>
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

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
              <option value="CANCELLED">Đã hủy</option>
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
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#8b857a] uppercase">Đối Tác</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#8b857a] uppercase">Khách Hàng</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#8b857a] uppercase">Ngày Booking</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#8b857a] uppercase">Tầng</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-[#8b857a] uppercase">Giá trị Booking</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-[#8b857a] uppercase">Hoa hồng</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-[#8b857a] uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-[#8b857a] uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredCommissions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <p className="text-sm text-[#8b857a]">Không có hoa hồng nào</p>
                  </td>
                </tr>
              ) : (
                filteredCommissions.map((commission) => (
                  <tr key={commission.id} className="hover:bg-[#f8f6f4] transition">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-[#1a1a1a]">{commission.partner.name}</p>
                      <p className="text-xs text-[#8b857a]">{commission.partner.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-[#1a1a1a]">{commission.booking.customerName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-[#1a1a1a]">{formatDateTime(commission.booking.dateTime)}</p>
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
                      {commission.rejectionReason && (
                        <p className="text-xs text-red-600 mt-1">{commission.rejectionReason}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center">
                        {commission.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleAction(commission.id, "approve")}
                              className="text-xs px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition font-medium"
                            >
                              Duyệt
                            </button>
                            <button
                              onClick={() => openRejectModal(commission)}
                              className="text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition font-medium"
                            >
                              Từ chối
                            </button>
                          </>
                        )}
                        {commission.status === "APPROVED" && (
                          <button
                            onClick={() => openPaymentModal(commission)}
                            className="text-xs px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition font-medium"
                          >
                            Thanh toán
                          </button>
                        )}
                        {commission.status === "PAID" && commission.paidAt && (
                          <div className="text-xs text-[#8b857a]">
                            <p>{formatDateTime(commission.paidAt)}</p>
                            {commission.paymentMethod && (
                              <p className="font-medium text-green-600">{commission.paymentMethod}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedCommission && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-[#1a1a1a]">Xác nhận thanh toán</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-[#8b857a]">Đối tác</p>
                <p className="text-lg font-semibold text-[#1a1a1a]">{selectedCommission.partner.name}</p>
              </div>
              <div>
                <p className="text-sm text-[#8b857a]">Số tiền</p>
                <p className="text-2xl font-bold text-[#c9a24d]">{formatCurrency(selectedCommission.amount)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Phương thức thanh toán *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a24d]"
                >
                  <option value="Bank Transfer">Chuyển khoản ngân hàng</option>
                  <option value="Cash">Tiền mặt</option>
                  <option value="VNPay">VNPay</option>
                  <option value="Momo">Momo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Mã giao dịch</label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a24d]"
                  placeholder="VD: TXN123456"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Ghi chú</label>
                <textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a24d]"
                  rows={3}
                  placeholder="Ghi chú về thanh toán (nếu có)"
                />
              </div>
            </div>
            <div className="p-6 bg-gray-50 rounded-b-2xl flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handlePay}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium"
              >
                Xác nhận thanh toán
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedCommission && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-[#1a1a1a]">Từ chối hoa hồng</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-[#8b857a]">Đối tác</p>
                <p className="text-lg font-semibold text-[#1a1a1a]">{selectedCommission.partner.name}</p>
              </div>
              <div>
                <p className="text-sm text-[#8b857a]">Số tiền</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(selectedCommission.amount)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Lý do từ chối *</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={4}
                  placeholder="Nhập lý do từ chối hoa hồng này..."
                  required
                />
              </div>
            </div>
            <div className="p-6 bg-gray-50 rounded-b-2xl flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
