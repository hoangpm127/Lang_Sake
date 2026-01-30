"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

type Commission = {
  id: string;
  amount: number;
  rate: number;
  tier: number;
  isPaid: boolean;
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
    status: string;
  };
};

type Stats = {
  totalCommissions: number;
  paidCommissions: number;
  unpaidCommissions: number;
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
};

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalCommissions: 0,
    paidCommissions: 0,
    unpaidCommissions: 0,
    totalAmount: 0,
    paidAmount: 0,
    unpaidAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filterPartner, setFilterPartner] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [partners, setPartners] = useState<Array<{ id: string; name: string }>>([]);

  const fetchCommissions = async () => {
    try {
      const response = await fetch("/api/commissions");
      const data = await response.json();

      if (data.ok) {
        setCommissions(data.commissions);
        setStats(data.stats);
        
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

  const handleMarkAsPaid = async (commissionId: string) => {
    try {
      const response = await fetch(`/api/commissions/${commissionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPaid: true }),
      });

      const data = await response.json();

      if (data.ok) {
        toast.success("Đã đánh dấu đã thanh toán");
        fetchCommissions(); // Refresh data
      } else {
        toast.error(data.message || "Không thể cập nhật trạng thái");
      }
    } catch (error) {
      toast.error("Lỗi khi cập nhật trạng thái");
      console.error(error);
    }
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

  // Filter commissions
  const filteredCommissions = commissions.filter((commission) => {
    if (filterPartner !== "all" && commission.partner.id !== filterPartner) return false;
    if (filterStatus === "paid" && !commission.isPaid) return false;
    if (filterStatus === "unpaid" && commission.isPaid) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c9a24d]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#1a1a1a] mb-2">Quản Lý Hoa Hồng</h1>
          <p className="text-gray-600">Theo dõi và thanh toán hoa hồng cho đối tác</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng Hoa Hồng</p>
                <p className="text-2xl font-bold text-[#1a1a1a]">{stats.totalCommissions}</p>
                <p className="text-lg text-blue-600 font-semibold mt-2">{formatCurrency(stats.totalAmount)}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600 mb-1">Đã Thanh Toán</p>
                <p className="text-2xl font-bold text-[#1a1a1a]">{stats.paidCommissions}</p>
                <p className="text-lg text-green-600 font-semibold mt-2">{formatCurrency(stats.paidAmount)}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600 mb-1">Chưa Thanh Toán</p>
                <p className="text-2xl font-bold text-[#1a1a1a]">{stats.unpaidCommissions}</p>
                <p className="text-lg text-orange-600 font-semibold mt-2">{formatCurrency(stats.unpaidAmount)}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">Lọc theo Đối tác</label>
              <select
                value={filterPartner}
                onChange={(e) => setFilterPartner(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a24d] focus:border-transparent"
              >
                <option value="all">Tất cả đối tác</option>
                {partners.map((partner) => (
                  <option key={partner.id} value={partner.id}>
                    {partner.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">Lọc theo Trạng thái</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a24d] focus:border-transparent"
              >
                <option value="all">Tất cả</option>
                <option value="paid">Đã thanh toán</option>
                <option value="unpaid">Chưa thanh toán</option>
              </select>
            </div>
          </div>
        </div>

        {/* Commissions Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Đối Tác
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Khách Hàng
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Ngày Booking
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                    Tầng
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider">
                    Tổng Booking
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider">
                    Tỷ Lệ
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider">
                    Hoa Hồng
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                    Trạng Thái
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                    Thao Tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCommissions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                      Không có hoa hồng nào
                    </td>
                  </tr>
                ) : (
                  filteredCommissions.map((commission) => {
                    const tierConfig = commission.tier === 1 
                      ? { label: 'T1 - Sale', color: 'bg-blue-100 text-blue-800 border-blue-200' }
                      : { label: 'T2 - Quản lý', color: 'bg-purple-100 text-purple-800 border-purple-200' };
                    
                    return (
                    <tr key={commission.id} className="hover:bg-amber-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-[#1a1a1a]">{commission.partner.name}</p>
                          <p className="text-sm text-gray-500">{commission.partner.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-[#1a1a1a]">{commission.booking.customerName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-[#1a1a1a]">{formatDateTime(commission.booking.dateTime)}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${tierConfig.color}`}>
                          {tierConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-sm font-semibold text-green-600">
                          {formatCurrency(commission.booking.finalTotal)}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-sm text-[#1a1a1a]">{commission.rate}%</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-lg font-bold text-[#c9a24d]">
                          {formatCurrency(commission.amount)}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {commission.isPaid ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            Đã thanh toán
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                            Chưa thanh toán
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {!commission.isPaid && (
                          <button
                            onClick={() => handleMarkAsPaid(commission.id)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            Đánh dấu đã trả
                          </button>
                        )}
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
    </div>
  );
}
