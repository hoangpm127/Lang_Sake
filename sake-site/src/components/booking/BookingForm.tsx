"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import Image from "next/image";

type BookingFormData = {
  customerName: string;
  phone: string;
  email: string;
  dateTime: string;
  guests: number;
  comboName: string;
  comboPrice: number;
  hasDeposit: boolean;
  referralCode: string;
  notes: string;
};

const COMBOS = [
  { name: "Combo Cặp Đôi", price: 666000, description: "2 người" },
  { name: "Combo Gia Đình", price: 2400000, description: "6 người" },
  { name: "Combo Sinh Viên", price: 396000, description: "4 người" },
  { name: "Premium Sake Tasting", price: 2000000, description: "4-6 người" },
  { name: "Sake & Sushi Combo", price: 1500000, description: "4 người" },
];

export default function BookingForm({ userId, onSuccess, isF1Creating }: { userId?: string; onSuccess?: () => void; isF1Creating?: boolean }) {
  const router = useRouter();
  const [formData, setFormData] = useState<BookingFormData>({
    customerName: "",
    phone: "",
    email: "",
    dateTime: "",
    guests: 2,
    comboName: COMBOS[0].name,
    comboPrice: COMBOS[0].price,
    hasDeposit: false,
    referralCode: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [isPaid, setIsPaid] = useState(false);

  // Countdown timer 15 phút
  useEffect(() => {
    if (countdown <= 0) return;
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.error('⏰ Hết thời gian thanh toán! Vui lòng đặt lại.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  // Tạo booking tạm khi tick đặt cọc
  useEffect(() => {
    if (formData.hasDeposit && !pendingBookingId && !success) {
      createPendingBooking();
    } else if (!formData.hasDeposit) {
      setPendingBookingId(null);
      setQrCodeUrl(null);
      setCountdown(0);
      setIsPaid(false);
    }
  }, [formData.hasDeposit, success]);

  // Auto-check payment status khi có booking và cần thanh toán cọc
  useEffect(() => {
    if (!pendingBookingId || isPaid) {
      return;
    }

    setIsCheckingPayment(true);
    
    // Check payment status mỗi 3 giây
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/bookings/${pendingBookingId}`);
        const data = await response.json();
        
        if (data.ok && data.booking) {
          console.log('[Polling] Booking status:', {
            depositPaid: data.booking.depositPaid,
            status: data.booking.status,
            bankRef: data.booking.paymentBankRef,
          });
          
          // Nếu đã thanh toán, dừng polling và hiển thị thông báo
          if (data.booking.depositPaid === true) {
            clearInterval(interval);
            setIsCheckingPayment(false);
            setIsPaid(true);
            toast.success('🎉 Thanh toán thành công! Bạn có thể xác nhận đặt bàn.', {
              duration: 5000,
            });
          }
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    }, 3000); // Check mỗi 3 giây

    // Dừng sau 15 phút
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setIsCheckingPayment(false);
      if (!isPaid) {
        toast.error('⏰ Hết thời gian thanh toán!');
      }
    }, 900000); // 15 phút

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [pendingBookingId, isPaid]);

  const createPendingBooking = async () => {
    try {
      // Validate form data trước
      if (!formData.customerName || !formData.phone || !formData.dateTime) {
        toast.error('Vui lòng điền đầy đủ thông tin trước khi chọn đặt cọc!');
        setFormData({ ...formData, hasDeposit: false });
        return;
      }

      const bodyData = isF1Creating 
        ? { ...formData, isF1Creating: true, status: 'PENDING' }
        : { ...formData, status: 'PENDING' };

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Tạo booking thất bại");
      }

      setPendingBookingId(data.booking.id);
      setCountdown(900); // 15 phút = 900 giây
      
      // Generate QR code
      const depositAmount = Math.round((formData.comboPrice * formData.guests) * 0.1);
      const source = formData.referralCode || 'WEB';
      const bankBin = process.env.NEXT_PUBLIC_BANK_BIN || '970423';
      const accountNumber = process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || '';
      const accountName = process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || 'MAI VIET HOANG';
      const transferContent = `LANGSAKE B${data.booking.id.substring(0, 8)} ${source}`;
      
      const qrUrl = `https://img.vietqr.io/image/${bankBin}-${accountNumber}-compact.png?` +
        `amount=${depositAmount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(accountName)}`;
      
      setQrCodeUrl(qrUrl);
      toast.success('📱 Vui lòng quét mã QR để thanh toán trong 15 phút!');
    } catch (error) {
      console.error('Error creating pending booking:', error);
      toast.error('Không thể tạo đơn đặt cọc. Vui lòng thử lại!');
      setFormData({ ...formData, hasDeposit: false });
    }
  };

  const handleComboChange = (comboName: string) => {
    const combo = COMBOS.find((c) => c.name === comboName);
    if (combo) {
      setFormData({
        ...formData,
        comboName: combo.name,
        comboPrice: combo.price,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Nếu có pending booking (đã tạo khi đặt cọc), chỉ cần update status
      if (pendingBookingId && isPaid) {
        const response = await fetch(`/api/bookings/${pendingBookingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: 'CONFIRMED' }),
        });

        const data = await response.json();

        if (!response.ok || !data.ok) {
          throw new Error(data.message || "Xác nhận đặt bàn thất bại");
        }

        setSuccess(true);
        setBookingDetails(data.booking);
        toast.success("Đặt bàn thành công!");
      } else {
        // Không có đặt cọc, tạo booking mới bình thường
        const bodyData = isF1Creating 
          ? { ...formData, isF1Creating: true }
          : formData;

        const response = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyData),
        });

        const data = await response.json();

        if (!response.ok || !data.ok) {
          throw new Error(data.message || "Đặt bàn thất bại");
        }

        setSuccess(true);
        setBookingDetails(data.booking);
        toast.success("Đặt bàn thành công!");
      }
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        // Redirect after success
        setTimeout(() => {
          if (userId) {
            router.refresh(); // Refresh dashboard
          } else {
            router.push("/"); // Back to home
          }
        }, 2000);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Đặt bàn thất bại";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotal = () => {
    const subtotal = formData.comboPrice * formData.guests;
    // Simple estimate - actual discount calculated on server
    const referralDiscount = formData.referralCode ? Math.round(subtotal * 0.1) : 0;
    const depositDiscount = formData.hasDeposit ? Math.round(subtotal * 0.1) : 0;
    const totalDiscount = referralDiscount + depositDiscount;
    const finalTotal = subtotal - totalDiscount;
    return { subtotal, finalTotal, referralDiscount, depositDiscount };
  };

  const { subtotal, finalTotal, referralDiscount, depositDiscount } = calculateTotal();

  if (success && bookingDetails) {
    const formatDateTime = (dateTimeString: string) => {
      return new Date(dateTimeString).toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount);
    };

    return (
      <div className="space-y-6">
        {/* Success Header */}
        <div className={`rounded-3xl border p-8 text-center transition-all ${
          bookingDetails.paymentStatus === 'PAID' 
            ? 'border-green-500/20 bg-gradient-to-br from-green-50 to-emerald-50'
            : bookingDetails.depositAmount > 0
            ? 'border-yellow-500/20 bg-gradient-to-br from-yellow-50 to-amber-50'
            : 'border-green-500/20 bg-gradient-to-br from-green-50 to-emerald-50'
        }`}>
          <div className="text-6xl mb-4">
            {bookingDetails.paymentStatus === 'PAID' ? '✅' : bookingDetails.depositAmount > 0 ? '⏳' : '🎉'}
          </div>
          <h3 className={`text-2xl font-serif mb-2 ${
            bookingDetails.paymentStatus === 'PAID' ? 'text-green-800' : 'text-yellow-800'
          }`}>
            {bookingDetails.paymentStatus === 'PAID' 
              ? 'Đã thanh toán thành công!' 
              : bookingDetails.depositAmount > 0
              ? 'Vui lòng thanh toán đặt cọc'
              : 'Đặt bàn thành công!'}
          </h3>
          <p className={bookingDetails.paymentStatus === 'PAID' ? 'text-green-700 mb-1' : 'text-yellow-700 mb-1'}>
            {bookingDetails.paymentStatus === 'PAID'
              ? 'Cảm ơn bạn đã hoàn tất thanh toán!'
              : bookingDetails.depositAmount > 0
              ? 'Quét mã QR bên dưới để thanh toán'
              : 'Cảm ơn bạn đã tin tưởng Lang Sake'}
          </p>
          <p className={`text-sm ${bookingDetails.paymentStatus === 'PAID' ? 'text-green-600' : 'text-yellow-600'}`}>
            {bookingDetails.paymentStatus === 'PAID'
              ? 'Đặt bàn của bạn đã được xác nhận'
              : bookingDetails.depositAmount > 0 && isCheckingPayment
              ? '🔄 Đang chờ xác nhận thanh toán...'
              : 'Chúng tôi sẽ liên hệ xác nhận trong thời gian sớm nhất'}
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="rounded-2xl border-2 border-[#c9a24d] bg-white shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#c9a24d] to-[#b8914d] p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Mã đặt bàn của bạn</p>
                <p className="text-3xl font-bold tracking-wider font-mono">
                  {bookingDetails.id.substring(0, 8).toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(bookingDetails.id);
                  toast.success("Đã copy mã đặt bàn!");
                }}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition text-sm font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </button>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[#8b857a] mb-1">Khách hàng</p>
                <p className="text-sm font-semibold text-[#1a1a1a]">{bookingDetails.customerName}</p>
                <p className="text-xs text-[#8b857a]">{bookingDetails.phone}</p>
              </div>
              <div>
                <p className="text-xs text-[#8b857a] mb-1">Thời gian</p>
                <p className="text-sm font-semibold text-[#1a1a1a]">{formatDateTime(bookingDetails.dateTime)}</p>
              </div>
              <div>
                <p className="text-xs text-[#8b857a] mb-1">Combo</p>
                <p className="text-sm font-semibold text-[#1a1a1a]">{bookingDetails.comboName}</p>
              </div>
              <div>
                <p className="text-xs text-[#8b857a] mb-1">Số khách</p>
                <p className="text-sm font-semibold text-[#1a1a1a]">{bookingDetails.guests} người</p>
              </div>
            </div>

            <div className="border-t border-black/10 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#8b857a]">Tổng tiền:</span>
                <span className="text-xl font-bold text-[#c9a24d]">{formatCurrency(bookingDetails.finalTotal)}</span>
              </div>
              {bookingDetails.depositAmount > 0 && (
                <div className={`flex justify-between items-center mt-2 ${
                  bookingDetails.paymentStatus === 'PAID' ? 'text-green-700' : 'text-yellow-700'
                }`}>
                  <span className="text-sm">
                    {bookingDetails.paymentStatus === 'PAID' ? '✅ Đã thanh toán cọc:' : '⏳ Cần thanh toán cọc:'}
                  </span>
                  <span className="text-lg font-semibold">{formatCurrency(bookingDetails.depositAmount)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* QR Code - Hiển thị nếu chưa thanh toán */}
        {bookingDetails.depositAmount > 0 && bookingDetails.paymentStatus !== 'PAID' && (
          <div className="rounded-2xl border-2 border-[#c9a24d] bg-gradient-to-br from-amber-50 to-yellow-50 p-6">
            <div className="text-center space-y-4">
              <h4 className="text-lg font-semibold text-[#1a1a1a]">
                💳 Quét mã QR để thanh toán
              </h4>
              <p className="text-sm text-[#8b857a]">
                Chuyển khoản đúng nội dung để tự động xác nhận
              </p>
              
              <div className="flex justify-center">
                <div className="relative w-64 h-64 border-2 border-[#c9a24d]/20 rounded-lg overflow-hidden bg-white">
                  {(() => {
                    const bankBin = process.env.NEXT_PUBLIC_BANK_BIN || '970423';
                    const accountNumber = process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || '';
                    const accountName = process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || 'MAI VIET HOANG';
                    const source = bookingDetails.referralCode || 'WEB';
                    const transferContent = `LANGSAKE B${bookingDetails.id.substring(0, 8)} ${source}`;
                    const qrUrl = `https://img.vietqr.io/image/${bankBin}-${accountNumber}-compact.png?` +
                      `amount=${bookingDetails.depositAmount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(accountName)}`;
                    
                    return (
                      <Image
                        src={qrUrl}
                        alt="QR Code thanh toán"
                        fill
                        className="object-contain p-4"
                      />
                    );
                  })()}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-[#c9a24d]/20">
                <div className="space-y-2 text-sm text-left">
                  <div className="flex justify-between">
                    <span className="text-[#8b857a]">Số tiền:</span>
                    <span className="font-semibold text-[#c9a24d]">{formatCurrency(bookingDetails.depositAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8b857a]">Nội dung:</span>
                    <button
                      onClick={() => {
                        const source = bookingDetails.referralCode || 'WEB';
                        const content = `LANGSAKE B${bookingDetails.id.substring(0, 8)} ${source}`;
                        navigator.clipboard.writeText(content);
                        toast.success('Đã copy nội dung chuyển khoản!');
                      }}
                      className="font-mono font-semibold text-[#c9a24d] hover:underline"
                    >
                      LANGSAKE B{bookingDetails.id.substring(0, 8)} {bookingDetails.referralCode || 'WEB'}
                    </button>
                  </div>
                </div>
              </div>

              {isCheckingPayment && (
                <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                  <span>Đang kiểm tra thanh toán tự động...</span>
                </div>
              )}

              <p className="text-xs text-[#8b857a]">
                ⚡ Tự động xác nhận trong vòng 30 giây sau khi chuyển khoản thành công
              </p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Lưu ý quan trọng</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>📱 <strong>Lưu mã đặt bàn</strong> để tra cứu và check-in</li>
                <li>📞 Chúng tôi sẽ gọi điện xác nhận trong 24h</li>
                <li>💳 {bookingDetails.depositAmount > 0 ? 'Vui lòng thanh toán cọc để giữ chỗ' : 'Thanh toán trực tiếp tại quán'}</li>
                <li>🔍 Tra cứu đơn tại: <a href="/booking/lookup" className="underline font-medium">langsake.vn/booking/lookup</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/booking/lookup?id=' + bookingDetails.id)}
            className="flex-1 px-6 py-3 bg-white border-2 border-[#c9a24d] text-[#c9a24d] rounded-xl font-medium hover:bg-[#c9a24d] hover:text-white transition"
          >
            Tra cứu đơn hàng
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex-1 px-6 py-3 bg-[#c9a24d] text-white rounded-xl font-medium hover:bg-[#b8914d] transition"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-50 p-4">
          <p className="text-sm text-red-800">❌ {error}</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Tên khách hàng */}
        <div>
          <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
            Họ và tên <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.customerName}
            onChange={(e) =>
              setFormData({ ...formData, customerName: e.target.value })
            }
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-[#1a1a1a] outline-none focus:border-[#c9a24d] transition"
            placeholder="Nguyễn Văn A"
          />
        </div>

        {/* Số điện thoại */}
        <div>
          <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
            Số điện thoại <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-[#1a1a1a] outline-none focus:border-[#c9a24d] transition"
            placeholder="0901234567"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-[#1a1a1a] outline-none focus:border-[#c9a24d] transition"
            placeholder="email@example.com"
          />
        </div>

        {/* Thời gian */}
        <div className="md:col-span-2">
          <DateTimePicker
            label="Thời gian đặt bàn"
            value={formData.dateTime}
            onChange={(value) => setFormData({ ...formData, dateTime: value })}
          />
        </div>

        {/* Số người */}
        <div>
          <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
            Số người <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            required
            min="1"
            max="20"
            value={formData.guests}
            onChange={(e) =>
              setFormData({ ...formData, guests: parseInt(e.target.value) })
            }
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-[#1a1a1a] outline-none focus:border-[#c9a24d] transition"
          />
        </div>

        {/* Combo */}
        <div>
          <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
            Chọn combo <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={formData.comboName}
            onChange={(e) => handleComboChange(e.target.value)}
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-[#1a1a1a] outline-none focus:border-[#c9a24d] transition"
          >
            {COMBOS.map((combo) => (
              <option key={combo.name} value={combo.name}>
                {combo.name} - {combo.price.toLocaleString("vi-VN")}₫ (
                {combo.description})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mã giới thiệu */}
      <div>
        <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
          Mã giới thiệu / Mã thành viên
        </label>
        <input
          type="text"
          value={formData.referralCode}
          onChange={(e) =>
            setFormData({ ...formData, referralCode: e.target.value.trim() })
          }
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-[#1a1a1a] outline-none focus:border-[#c9a24d] transition"
          placeholder="PARTNER001 hoặc MEMBER001"
        />
        <p className="mt-1 text-xs text-[#8b857a]">
          Nhập mã để nhận ưu đãi (nếu có)
        </p>
      </div>

      {/* Ghi chú */}
      <div>
        <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
          Ghi chú
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-[#1a1a1a] outline-none focus:border-[#c9a24d] transition resize-none"
          placeholder="Yêu cầu đặc biệt, dị ứng thực phẩm..."
        />
      </div>

      {/* Đặt cọc */}
      <div className="rounded-2xl border border-black/5 bg-[#f8f6f4] p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.hasDeposit}
            onChange={(e) =>
              setFormData({ ...formData, hasDeposit: e.target.checked })
            }
            className="mt-1 h-4 w-4 rounded border-black/20 text-[#c9a24d] focus:ring-[#c9a24d]"
          />
          <div>
            <p className="text-sm font-medium text-[#1a1a1a]">
              Đặt cọc trước 10%
            </p>
            <p className="text-xs text-[#8b857a] mt-1">
              Cọc online 10% để đảm bảo chỗ và nhận giảm 10% khi thanh toán tại dịch vụ
            </p>
          </div>
        </label>

        {/* QR Code hiển thị khi check deposit */}
        {formData.hasDeposit && qrCodeUrl && (
          <div className="mt-4 pt-4 border-t border-black/10">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              {/* Countdown Timer */}
              {countdown > 0 && (
                <div className="mb-3 text-center">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
                    countdown < 300 ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
                  }`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-mono font-semibold">
                      {Math.floor(countdown / 60).toString().padStart(2, '0')}:{(countdown % 60).toString().padStart(2, '0')}
                    </span>
                    <span className="text-xs">phút</span>
                  </div>
                  <p className="text-xs text-[#8b857a] mt-1">
                    {countdown < 300 ? '⚠️ Sắp hết thời gian thanh toán!' : 'Thời gian còn lại để thanh toán'}
                  </p>
                </div>
              )}

              {/* Payment Status */}
              {isPaid && (
                <div className="mb-3 bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <div className="text-2xl mb-1">✅</div>
                  <p className="text-sm font-semibold text-green-800">Đã thanh toán thành công!</p>
                  <p className="text-xs text-green-600 mt-1">Bạn có thể xác nhận đặt bàn ngay</p>
                </div>
              )}

              {isCheckingPayment && !isPaid && (
                <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-2 text-blue-700">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                    <span className="text-sm">Đang chờ thanh toán...</span>
                  </div>
                </div>
              )}

              <div className="text-center mb-3">
                <p className="text-sm font-semibold text-[#c9a24d] mb-1">
                  💳 Quét mã QR để thanh toán cọc
                </p>
                <p className="text-xs text-[#8b857a]">
                  Số tiền: <span className="font-medium text-[#c9a24d]">{Math.round(subtotal * 0.1).toLocaleString("vi-VN")}₫</span>
                </p>
                {pendingBookingId && (
                  <button
                    type="button"
                    onClick={() => {
                      const source = formData.referralCode || 'WEB';
                      const content = `LANGSAKE B${pendingBookingId.substring(0, 8)} ${source}`;
                      navigator.clipboard.writeText(content);
                      toast.success('Đã copy nội dung chuyển khoản!');
                    }}
                    className="mt-1 text-xs text-blue-600 hover:underline"
                  >
                    📋 Copy nội dung CK: LANGSAKE B{pendingBookingId.substring(0, 8)} {formData.referralCode || 'WEB'}
                  </button>
                )}
              </div>
              
              <div className="flex justify-center mb-3">
                <div className="relative w-48 h-48 border-2 border-[#c9a24d]/20 rounded-lg overflow-hidden">
                  <Image
                    src={qrCodeUrl}
                    alt="QR Code thanh toán"
                    fill
                    className="object-contain p-2"
                  />
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-3 text-xs space-y-1">
                <p className="text-blue-800 font-medium">📱 Hướng dẫn:</p>
                <ul className="text-blue-700 space-y-0.5 ml-4 list-disc">
                  <li>Mở app banking và quét mã QR</li>
                  <li>Kiểm tra số tiền và nội dung chuyển khoản</li>
                  <li>Xác nhận thanh toán</li>
                  <li>Hệ thống tự động xác nhận trong 30 giây</li>
                </ul>
              </div>

              <div className="mt-3 text-center">
                <p className="text-[10px] text-[#8b857a]">
                  ⚠️ Lưu ý: Vui lòng <strong>KHÔNG thay đổi</strong> nội dung chuyển khoản
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tổng tiền */}
      <div className="rounded-2xl border border-[#c9a24d]/20 bg-gradient-to-br from-[#c9a24d]/5 to-[#c9a24d]/10 p-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[#8b857a]">Tạm tính:</span>
            <span className="text-[#1a1a1a]">
              {subtotal.toLocaleString("vi-VN")}₫
            </span>
          </div>
          {referralDiscount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Giảm theo mã:</span>
              <span className="text-green-600 font-medium">
                -{referralDiscount.toLocaleString("vi-VN")}₫
              </span>
            </div>
          )}
          {depositDiscount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Ưu đãi cọc 10%:</span>
              <span className="text-green-600 font-medium">
                -{depositDiscount.toLocaleString("vi-VN")}₫
              </span>
            </div>
          )}
          <div className="border-t border-black/10 pt-2 flex justify-between">
            <span className="font-medium text-[#1a1a1a]">Tổng cộng:</span>
            <span className="text-xl font-serif text-[#c9a24d]">
              {finalTotal.toLocaleString("vi-VN")}₫
            </span>
          </div>
          {formData.hasDeposit && (
            <div className="flex justify-between text-sm pt-1">
              <span className="text-[#8b857a]">Cần đặt cọc:</span>
              <span className="font-medium text-[#c9a24d]">
                {Math.round(subtotal * 0.1).toLocaleString("vi-VN")}₫
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting || (formData.hasDeposit && !isPaid)}
        className={`w-full rounded-xl px-8 py-4 text-sm font-medium text-white transition ${
          formData.hasDeposit && !isPaid
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-[#c9a24d] hover:bg-[#b89043]'
        } disabled:opacity-50`}
      >
        {isSubmitting 
          ? "Đang xử lý..." 
          : formData.hasDeposit && !isPaid
          ? "🔒 Vui lòng thanh toán cọc để tiếp tục"
          : isPaid
          ? "✅ Xác nhận đặt bàn (Đã thanh toán)"
          : "Xác nhận đặt bàn"}
      </button>

      {formData.hasDeposit && !isPaid && (
        <div className="text-center text-xs text-yellow-700 bg-yellow-50 rounded-lg p-2">
          ⏳ Nút đặt bàn sẽ mở sau khi thanh toán cọc thành công
        </div>
      )}

      <p className="text-xs text-center text-[#8b857a]">
        Bằng việc đặt bàn, bạn đồng ý với{" "}
        <a href="/terms" className="text-[#c9a24d] hover:underline">
          điều khoản sử dụng
        </a>{" "}
        của chúng tôi
      </p>
    </form>
  );
}
