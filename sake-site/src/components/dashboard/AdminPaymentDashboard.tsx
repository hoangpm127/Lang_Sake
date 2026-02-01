"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaMoneyBillWave,
  FaFilter,
  FaSearch,
  FaFileExport,
  FaSync,
  FaExclamationTriangle,
  FaChartLine,
} from "react-icons/fa";

type Booking = {
  id: string;
  customerName: string;
  phone: string;
  email?: string;
  dateTime: string;
  guests: number;
  comboName: string;
  finalTotal: number;
  depositAmount: number;
  depositPaid: boolean;
  depositPaidAt?: string;
  paymentBankRef?: string;
  depositTransferContent?: string;
  status: string;
  source: string;
  internalNotes?: string;
  customer?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  createdAt: string;
};

type Stats = {
  total: number;
  totalDeposit: number;
  paidCount: number;
  paidAmount: number;
  unpaidCount: number;
  unpaidAmount: number;
};

export default function AdminPaymentDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [reconciliation, setReconciliation] = useState<any>(null);
  const [showReconciliation, setShowReconciliation] = useState(false);

  // Filters
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [source, setSource] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Action dialog state
  const [actionDialog, setActionDialog] = useState<{
    isOpen: boolean;
    bookingId: string | null;
    action: "confirm" | "refund" | "update_ref" | null;
    paymentRef?: string;
    notes?: string;
  }>({
    isOpen: false,
    bookingId: null,
    action: null,
  });

  useEffect(() => {
    fetchPayments();
  }, [paymentStatus, source, dateFrom, dateTo]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (paymentStatus !== "all") params.append("paymentStatus", paymentStatus);
      if (source !== "all") params.append("source", source);
      if (search) params.append("search", search);
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);

      const response = await fetch(`/api/admin/payments?${params.toString()}`);
      const data = await response.json();

      if (data.ok) {
        setBookings(data.bookings);
        setStats(data.stats);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Lỗi khi tải dữ liệu thanh toán");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!actionDialog.bookingId || !actionDialog.action) return;

    try {
      setUpdating(actionDialog.bookingId);

      const actionMap: { [key: string]: string } = {
        confirm: "confirm_deposit",
        refund: "mark_refunded",
        update_ref: "update_reference",
      };

      const response = await fetch("/api/admin/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: actionDialog.bookingId,
          action: actionMap[actionDialog.action],
          paymentBankRef: actionDialog.paymentRef,
          notes: actionDialog.notes,
        }),
      });

      const data = await response.json();

      if (data.ok) {
        toast.success("Cập nhật thanh toán thành công!");
        fetchPayments();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Lỗi khi cập nhật thanh toán");
    } finally {
      setUpdating(null);
      setActionDialog({ isOpen: false, bookingId: null, action: null });
    }
  };

  const fetchReconciliation = async () => {
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);

      const response = await fetch(`/api/admin/reconciliation?${params.toString()}`);
      const data = await response.json();

      if (data.ok) {
        setReconciliation(data);
        setShowReconciliation(true);
        toast.success("Đã tải báo cáo đối soát");
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Lỗi khi tải báo cáo đối soát");
    }
  };

  const exportToCSV = () => {
    if (bookings.length === 0) {
      toast.error("Không có dữ liệu để export");
      return;
    }

    const headers = [
      "Ngày tạo",
      "Khách hàng",
      "SĐT",
      "Email",
      "Ngày đặt bàn",
      "Combo",
      "Tổng tiền",
      "Tiền cọc",
      "Đã thanh toán",
      "Ngày thanh toán",
      "Mã giao dịch",
      "Nội dung CK",
      "Nguồn",
      "Trạng thái",
    ];

    const rows = bookings.map((b) => [
      new Date(b.createdAt).toLocaleString("vi-VN"),
      b.customerName,
      b.phone,
      b.email || "",
      new Date(b.dateTime).toLocaleString("vi-VN"),
      b.comboName,
      b.finalTotal.toLocaleString("vi-VN"),
      b.depositAmount.toLocaleString("vi-VN"),
      b.depositPaid ? "Có" : "Chưa",
      b.depositPaidAt ? new Date(b.depositPaidAt).toLocaleString("vi-VN") : "",
      b.paymentBankRef || "",
      b.depositTransferContent || "",
      b.source,
      b.status,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `payments_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success("Export thành công!");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; className: string } } = {
      PENDING: { label: "Chờ", className: "bg-yellow-100 text-yellow-800" },
      CONFIRMED: { label: "Xác nhận", className: "bg-blue-100 text-blue-800" },
      COMPLETED: { label: "Hoàn thành", className: "bg-green-100 text-green-800" },
      CANCELLED: { label: "Hủy", className: "bg-red-100 text-red-800" },
      NO_SHOW: { label: "Không đến", className: "bg-gray-100 text-gray-800" },
    };

    const statusInfo = statusMap[status] || { label: status, className: "bg-gray-100" };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${statusInfo.className}`}
      >
        {statusInfo.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FaSync className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý Thanh toán</h2>
          <p className="text-gray-600 mt-1">Theo dõi và quản lý tiền cọc</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchReconciliation}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <FaChartLine />
            Đối soát
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FaFileExport />
            Export CSV
          </button>
        </div>
      </div>

      {/* Reconciliation Report */}
      {showReconciliation && reconciliation && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FaChartLine className="text-orange-600" />
              Báo cáo Đối soát Thanh toán
            </h3>
            <button
              onClick={() => setShowReconciliation(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Tổng booking</p>
              <p className="text-2xl font-bold text-blue-900">
                {reconciliation.summary.totalBookings}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Đã thanh toán</p>
              <p className="text-2xl font-bold text-green-900">
                {reconciliation.summary.paidBookings}
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm text-orange-600 font-medium">Chưa thanh toán</p>
              <p className="text-2xl font-bold text-orange-900">
                {reconciliation.summary.unpaidBookings}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-600 font-medium">Vấn đề</p>
              <p className="text-2xl font-bold text-red-900">
                {(Object.values(reconciliation.summary.issueCount).reduce(
                  (a: any, b: any) => a + b,
                  0
                ) as number)}
              </p>
            </div>
          </div>

          {/* Issues */}
          <div className="space-y-4">
            {/* Unpaid Deposits */}
            {reconciliation.issues.unpaidDeposits.length > 0 && (
              <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                  <FaExclamationTriangle className="text-orange-600" />
                  Chưa thanh toán ({reconciliation.issues.unpaidDeposits.length})
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {reconciliation.issues.unpaidDeposits.map((item: any) => (
                    <div
                      key={item.id}
                      className="bg-white p-3 rounded text-sm flex justify-between"
                    >
                      <div>
                        <p className="font-medium">{item.customerName}</p>
                        <p className="text-gray-600">{item.phone}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-orange-700">
                          {item.depositAmount.toLocaleString()} VND
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.daysPending} ngày chờ
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Bank Ref */}
            {reconciliation.issues.missingBankRef.length > 0 && (
              <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                <h4 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                  <FaExclamationTriangle className="text-yellow-600" />
                  Thiếu mã giao dịch ({reconciliation.issues.missingBankRef.length})
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {reconciliation.issues.missingBankRef.map((item: any) => (
                    <div
                      key={item.id}
                      className="bg-white p-3 rounded text-sm flex justify-between"
                    >
                      <div>
                        <p className="font-medium">{item.customerName}</p>
                        <p className="text-gray-600">{item.phone}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {item.depositAmount.toLocaleString()} VND
                        </p>
                        <p className="text-xs text-gray-500">Đã thanh toán</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pending Confirmations */}
            {reconciliation.issues.pendingConfirmations.length > 0 && (
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <FaClock className="text-blue-600" />
                  Chờ xác nhận booking ({reconciliation.issues.pendingConfirmations.length})
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {reconciliation.issues.pendingConfirmations.map((item: any) => (
                    <div
                      key={item.id}
                      className="bg-white p-3 rounded text-sm flex justify-between"
                    >
                      <div>
                        <p className="font-medium">{item.customerName}</p>
                        <p className="text-gray-600">{item.phone}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {item.depositAmount.toLocaleString()} VND
                        </p>
                        <p className="text-xs text-blue-600">Đã trả - cần confirm</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cancelled with Paid */}
            {reconciliation.issues.cancelledWithPaid.length > 0 && (
              <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                  <FaTimesCircle className="text-red-600" />
                  Đã hủy - cần hoàn tiền ({reconciliation.issues.cancelledWithPaid.length})
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {reconciliation.issues.cancelledWithPaid.map((item: any) => (
                    <div
                      key={item.id}
                      className="bg-white p-3 rounded text-sm flex justify-between"
                    >
                      <div>
                        <p className="font-medium">{item.customerName}</p>
                        <p className="text-gray-600">{item.phone}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-red-700">
                          {item.depositAmount.toLocaleString()} VND
                        </p>
                        <p className="text-xs text-red-600">
                          {item.cancelledNeedsRefund
                            ? "Cần hoàn tiền"
                            : "Đã hoàn tiền"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {Object.values(reconciliation.summary.issueCount).every(
              (count: any) => count === 0
            ) && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <FaCheckCircle className="text-4xl text-green-600 mx-auto mb-2" />
                <p className="text-green-900 font-semibold">
                  Không có vấn đề đối soát
                </p>
                <p className="text-green-700 text-sm mt-1">
                  Tất cả thanh toán đều khớp với database
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Tổng booking</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <FaMoneyBillWave className="text-3xl text-blue-400" />
            </div>
            <p className="text-blue-700 text-xs mt-2">
              Tổng cọc: {formatCurrency(stats.totalDeposit)}
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Đã thanh toán</p>
                <p className="text-2xl font-bold text-green-900">{stats.paidCount}</p>
              </div>
              <FaCheckCircle className="text-3xl text-green-400" />
            </div>
            <p className="text-green-700 text-xs mt-2">
              Đã thu: {formatCurrency(stats.paidAmount)}
            </p>
          </div>

          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Chưa thanh toán</p>
                <p className="text-2xl font-bold text-orange-900">{stats.unpaidCount}</p>
              </div>
              <FaClock className="text-3xl text-orange-400" />
            </div>
            <p className="text-orange-700 text-xs mt-2">
              Chưa thu: {formatCurrency(stats.unpaidAmount)}
            </p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Tỷ lệ thanh toán</p>
                <p className="text-2xl font-bold text-purple-900">
                  {stats.total > 0
                    ? Math.round((stats.paidCount / stats.total) * 100)
                    : 0}
                  %
                </p>
              </div>
              <FaFilter className="text-3xl text-purple-400" />
            </div>
            <p className="text-purple-700 text-xs mt-2">
              {stats.paidCount} / {stats.total} bookings
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái thanh toán
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="paid">Đã thanh toán</option>
              <option value="unpaid">Chưa thanh toán</option>
              <option value="pending">Chờ xác nhận</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nguồn</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="WEB_DIRECT">Web Direct</option>
              <option value="F2_SELF">F2 Self</option>
              <option value="F1_CREATE">F1 Create</option>
              <option value="ADMIN_CREATE">Admin Create</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Từ ngày</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Đến ngày</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tên, SĐT, mã GD..."
                className="w-full px-3 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={fetchPayments}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <FaFilter />
            Lọc
          </button>
          <button
            onClick={() => {
              setPaymentStatus("all");
              setSource("all");
              setSearch("");
              setDateFrom("");
              setDateTo("");
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Khách hàng
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Ngày đặt
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Combo
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                  Tiền cọc
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                  Thanh toán
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Mã GD
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                  Nguồn
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    Không có dữ liệu thanh toán
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">
                          {booking.customerName}
                        </p>
                        <p className="text-sm text-gray-500">{booking.phone}</p>
                        {booking.email && (
                          <p className="text-xs text-gray-400">{booking.email}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(booking.dateTime).toLocaleString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">
                        {booking.comboName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {booking.guests} người
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(booking.depositAmount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        / {formatCurrency(booking.finalTotal)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {booking.depositPaid ? (
                        <div className="flex flex-col items-center">
                          <FaCheckCircle className="text-green-500 text-xl mb-1" />
                          <span className="text-xs text-gray-600">
                            {booking.depositPaidAt &&
                              new Date(booking.depositPaidAt).toLocaleDateString(
                                "vi-VN"
                              )}
                          </span>
                        </div>
                      ) : (
                        <FaTimesCircle className="text-red-500 text-xl mx-auto" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {booking.paymentBankRef ? (
                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                          {booking.paymentBankRef}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Chưa có</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {booking.source.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-center">
                        {!booking.depositPaid && (
                          <button
                            onClick={() =>
                              setActionDialog({
                                isOpen: true,
                                bookingId: booking.id,
                                action: "confirm",
                              })
                            }
                            disabled={updating === booking.id}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            Xác nhận
                          </button>
                        )}
                        <button
                          onClick={() =>
                            setActionDialog({
                              isOpen: true,
                              bookingId: booking.id,
                              action: "update_ref",
                              paymentRef: booking.paymentBankRef || "",
                            })
                          }
                          disabled={updating === booking.id}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                          Cập nhật
                        </button>
                        {booking.depositPaid && booking.status !== "CANCELLED" && (
                          <button
                            onClick={() =>
                              setActionDialog({
                                isOpen: true,
                                bookingId: booking.id,
                                action: "refund",
                              })
                            }
                            disabled={updating === booking.id}
                            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
                          >
                            Hoàn tiền
                          </button>
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

      {/* Action Dialog */}
      <ConfirmDialog
        isOpen={actionDialog.isOpen}
        onClose={() =>
          setActionDialog({ isOpen: false, bookingId: null, action: null })
        }
        onConfirm={handleAction}
        title={
          actionDialog.action === "confirm"
            ? "Xác nhận thanh toán"
            : actionDialog.action === "refund"
            ? "Hoàn tiền cọc"
            : "Cập nhật mã giao dịch"
        }
        confirmText={
          actionDialog.action === "confirm"
            ? "Xác nhận"
            : actionDialog.action === "refund"
            ? "Hoàn tiền"
            : "Cập nhật"
        }
        cancelText="Hủy"
      >
        <div className="space-y-4">
            {actionDialog.action === "confirm" && (
              <>
                <p>Xác nhận đã nhận tiền cọc cho booking này?</p>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Mã giao dịch (tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={actionDialog.paymentRef || ""}
                    onChange={(e) =>
                      setActionDialog({ ...actionDialog, paymentRef: e.target.value })
                    }
                    placeholder="Nhập mã giao dịch ngân hàng"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Ghi chú (tùy chọn)
                  </label>
                  <textarea
                    value={actionDialog.notes || ""}
                    onChange={(e) =>
                      setActionDialog({ ...actionDialog, notes: e.target.value })
                    }
                    placeholder="Ghi chú nội bộ"
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </>
            )}
            {actionDialog.action === "refund" && (
              <>
                <p>Đánh dấu booking này là đã hoàn tiền cọc?</p>
                <p className="text-sm text-red-600">
                  ⚠️ Booking sẽ chuyển sang trạng thái "Cancelled"
                </p>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Lý do hoàn tiền
                  </label>
                  <textarea
                    value={actionDialog.notes || ""}
                    onChange={(e) =>
                      setActionDialog({ ...actionDialog, notes: e.target.value })
                    }
                    placeholder="Ghi chú lý do hoàn tiền"
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </>
            )}
            {actionDialog.action === "update_ref" && (
              <>
                <p>Cập nhật mã giao dịch thanh toán</p>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Mã giao dịch *
                  </label>
                  <input
                    type="text"
                    value={actionDialog.paymentRef || ""}
                    onChange={(e) =>
                      setActionDialog({ ...actionDialog, paymentRef: e.target.value })
                    }
                    placeholder="Nhập mã giao dịch ngân hàng"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Ghi chú (tùy chọn)
                  </label>
                  <textarea
                    value={actionDialog.notes || ""}
                    onChange={(e) =>
                      setActionDialog({ ...actionDialog, notes: e.target.value })
                    }
                    placeholder="Ghi chú cập nhật"
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </>
            )}
        </div>
      </ConfirmDialog>
    </div>
  );
}
