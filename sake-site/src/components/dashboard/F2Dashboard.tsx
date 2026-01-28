"use client";

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
