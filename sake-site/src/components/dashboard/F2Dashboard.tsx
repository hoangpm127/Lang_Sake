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
  discount: number;
  status: string;
};

export default function F2Dashboard() {
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

  const totalSpent = bookings
    .filter((b) => b.status !== "CANCELLED")
    .reduce((sum, b) => sum + b.finalTotal, 0);

  const totalSaved = bookings.reduce((sum, b) => sum + b.discount, 0);

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
            Tổng chi tiêu
          </p>
          <p className="mt-4 font-serif text-3xl text-[#1a1a1a]">
            {formatCurrency(totalSpent)}
          </p>
        </div>

        <div className="rounded-3xl border border-black/5 bg-gradient-to-br from-green-500/10 to-green-500/5 p-6 shadow-sm border-green-500/20">
          <p className="text-xs uppercase tracking-[0.2em] text-green-600">
            Tiết kiệm được
          </p>
          <p className="mt-4 font-serif text-3xl text-green-600">
            {formatCurrency(totalSaved)}
          </p>
          <p className="text-xs text-[#8b857a] mt-2">Nhờ ưu đãi thành viên</p>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="rounded-3xl border border-black/5 bg-white shadow-sm overflow-hidden">
        <div className="p-6 border-b border-black/5">
          <h3 className="text-lg font-serif text-[#1a1a1a]">
            Lịch sử đặt bàn ({bookings.length})
          </h3>
          <p className="text-sm text-[#8b857a] mt-1">
            Các booking của bạn tại Lang Sake
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f8f6f4] text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 text-left text-[#8b857a]">ID</th>
                <th className="px-6 py-4 text-left text-[#8b857a]">Combo</th>
                <th className="px-6 py-4 text-left text-[#8b857a]">Thời gian</th>
                <th className="px-6 py-4 text-left text-[#8b857a]">Số người</th>
                <th className="px-6 py-4 text-left text-[#8b857a]">Giá trị</th>
                <th className="px-6 py-4 text-left text-[#8b857a]">Giảm giá</th>
                <th className="px-6 py-4 text-left text-[#8b857a]">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {bookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="hover:bg-[#f8f6f4]/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-mono text-[#8b857a]">
                    {booking.id.slice(0, 8)}
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
                  <td className="px-6 py-4">
                    {booking.discount > 0 ? (
                      <span className="text-sm font-medium text-green-600">
                        -{formatCurrency(booking.discount)}
                      </span>
                    ) : (
                      <span className="text-xs text-[#8b857a]">-</span>
                    )}
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
            <p className="text-[#8b857a]">Bạn chưa có booking nào</p>
            <p className="text-xs text-[#8b857a] mt-2">
              Đặt bàn ngay để tận hưởng ưu đãi thành viên
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { motion } from "framer-motion";

const comboOptions = [
  { name: "Combo Sinh Viên", price: 99000 },
  { name: "Combo Cặp Đôi", price: 666000 },
  { name: "Combo Gia Đình", price: 999000 },
  { name: "Khách Quốc Tế", price: 22 * 25000 },
];

const formatVnd = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(value);

export default function F2Dashboard() {
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    dateTime: "",
    guests: 2,
    comboName: comboOptions[0].name,
  });
  const [hasDeposit, setHasDeposit] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const [status, setStatus] = useState<
    | { type: "idle" }
    | { type: "loading" }
    | { type: "success"; message: string }
    | { type: "error"; message: string }
  >({ type: "idle" });

  const selectedCombo = useMemo(
    () => comboOptions.find((combo) => combo.name === form.comboName) ?? comboOptions[0],
    [form.comboName]
  );

  const subtotal = form.guests * selectedCombo.price;
  const discount = hasDeposit ? Math.round(subtotal * 0.1) : 0;
  const finalTotal = subtotal - discount;
  const depositAmount = hasDeposit ? Math.round(finalTotal * 0.1) : 0;

  useEffect(() => {
    let isMounted = true;
    if (!hasDeposit || depositAmount <= 0) {
      setQrUrl("");
      return;
    }

    const payload = `SAKE|${depositAmount}|${form.customerName}|${form.phone}`;
    QRCode.toDataURL(payload, { margin: 1, width: 160 })
      .then((url) => {
        if (isMounted) setQrUrl(url);
      })
      .catch(() => {
        if (isMounted) setQrUrl("");
      });

    return () => {
      isMounted = false;
    };
  }, [depositAmount, form.customerName, form.phone, hasDeposit]);

  const updateField = (key: keyof typeof form, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus({ type: "loading" });

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName,
          phone: form.phone,
          dateTime: form.dateTime,
          guests: form.guests,
          comboName: selectedCombo.name,
          comboPrice: selectedCombo.price,
          hasDeposit,
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        throw new Error(payload.message || "Không thể tạo booking.");
      }

      setStatus({
        type: "success",
        message: "Đã tạo booking mới trong hệ thống.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Không thể tạo booking.",
      });
    }
  };

  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-2">
        <div id="wallet" className="rounded-3xl border border-black/10 bg-white p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[#8b857a]">
            Ví Tiền
          </p>
          <p className="mt-4 font-serif text-3xl text-[#1a1a1a]">12.400.000 đ</p>
          <p className="mt-2 text-xs text-[#8b857a]">
            Sẵn sàng rút trong 3 ngày tới.
          </p>
        </div>
        <div id="rank" className="rounded-3xl border border-black/10 bg-white p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[#8b857a]">
            Rank
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="font-serif text-2xl text-[#1a1a1a]">Chiến Binh</span>
            <span className="rounded-full bg-[#f2e6c9] px-3 py-1 text-xs text-[#8b6a2e]">
              78% to next
            </span>
          </div>
          <div className="mt-4 h-2 rounded-full bg-black/5">
            <div className="h-2 w-[78%] rounded-full bg-[#c9a24d]" />
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-3xl border border-black/10 bg-white p-6"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#8b857a]">
              Smart Booking Form
            </p>
            <h2 className="mt-2 font-serif text-2xl text-[#1a1a1a]">
              Tạo Đặt Lịch Mới
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="text-xs uppercase tracking-[0.2em] text-[#8b857a]">
                Tên khách
              </span>
              <input
                value={form.customerName}
                onChange={(event) => updateField("customerName", event.target.value)}
                className="w-full rounded-2xl border border-black/10 px-4 py-2"
                required
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-xs uppercase tracking-[0.2em] text-[#8b857a]">
                Số điện thoại
              </span>
              <input
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                className="w-full rounded-2xl border border-black/10 px-4 py-2"
                required
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-xs uppercase tracking-[0.2em] text-[#8b857a]">
                Ngày / Giờ
              </span>
              <input
                type="datetime-local"
                value={form.dateTime}
                onChange={(event) => updateField("dateTime", event.target.value)}
                className="w-full rounded-2xl border border-black/10 px-4 py-2"
                required
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-xs uppercase tracking-[0.2em] text-[#8b857a]">
                Số khách
              </span>
              <input
                type="number"
                min={1}
                value={form.guests}
                onChange={(event) => updateField("guests", Number(event.target.value))}
                className="w-full rounded-2xl border border-black/10 px-4 py-2"
                required
              />
            </label>
            <label className="space-y-2 text-sm sm:col-span-2">
              <span className="text-xs uppercase tracking-[0.2em] text-[#8b857a]">
                Chọn combo
              </span>
              <select
                value={form.comboName}
                onChange={(event) => updateField("comboName", event.target.value)}
                className="w-full rounded-2xl border border-black/10 px-4 py-2"
              >
                {comboOptions.map((combo) => (
                  <option key={combo.name} value={combo.name}>
                    {combo.name} - {formatVnd(combo.price)} đ
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-[#d6b25e]/30 bg-[#f9f3e4] px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-[#1a1a1a]">
                Khách đặt cọc trước 10%?
              </p>
              <p className="text-xs text-[#8b857a]">
                Khách được giảm ngay 10% vào hóa đơn.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setHasDeposit((prev) => !prev)}
              className={`relative h-7 w-12 rounded-full transition ${
                hasDeposit ? "bg-[#1a1a1a]" : "bg-black/20"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                  hasDeposit ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>

          <div className="rounded-2xl border border-black/10 bg-[#fafafa] p-4 text-sm">
            <div className="flex items-center justify-between">
              <span>Tạm tính</span>
              <span>{formatVnd(subtotal)} đ</span>
            </div>
            {hasDeposit && (
              <div className="flex items-center justify-between text-[#5f8f52]">
                <span>Ưu đãi cọc trước (-10%)</span>
                <span>-{formatVnd(discount)} đ</span>
              </div>
            )}
            <div className="mt-3 flex items-center justify-between border-t border-black/10 pt-3 font-serif text-lg">
              <span>Tổng thanh toán</span>
              <span>{formatVnd(finalTotal)} đ</span>
            </div>
            {hasDeposit && (
              <div className="mt-4 rounded-2xl border border-[#d6b25e]/40 bg-white p-4 text-center">
                <p className="text-xs text-[#8b857a]">Số tiền khách cần cọc ngay</p>
                <p className="mt-2 text-2xl font-semibold text-[#e63946]">
                  {formatVnd(depositAmount)} đ
                </p>
                {qrUrl ? (
                  <img
                    src={qrUrl}
                    alt="QR deposit"
                    className="mx-auto mt-4 h-32 w-32"
                  />
                ) : (
                  <div className="mx-auto mt-4 h-32 w-32 rounded-2xl border border-dashed border-[#d6b25e]/40" />
                )}
              </div>
            )}
          </div>

          {status.type === "success" && (
            <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-xs text-green-700">
              {status.message}
            </div>
          )}
          {status.type === "error" && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
              {status.message}
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full rounded-2xl bg-gradient-to-r from-[#d6b25e] via-[#e3b867] to-[#c98d3f] py-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#1a1a1a]"
          >
            {status.type === "loading"
              ? "Đang tạo booking..."
              : hasDeposit
                ? "Xác nhận & Thu cọc"
                : "Đặt lịch (Thanh toán sau)"}
          </motion.button>
        </form>

        <div className="space-y-6">
          <div className="rounded-3xl border border-black/10 bg-white p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[#8b857a]">
              Tip vận hành
            </p>
            <p className="mt-3 text-sm text-[#6b5f4b]">
              Ưu tiên chốt cọc với nhóm khách lớn để giữ chỗ tốt, đồng thời tận
              dụng ưu đãi 10% cho khách đặt trước.
            </p>
          </div>
          <div className="rounded-3xl border border-black/10 bg-white p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[#8b857a]">
              Hỗ trợ nhanh
            </p>
            <p className="mt-3 text-sm text-[#6b5f4b]">
              Hotline nội bộ: 090 123 4567<br />
              Trực vận hành: 08:00 - 22:00
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
