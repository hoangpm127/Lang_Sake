"use client";

import { useEffect, useState } from "react";

type Booking = {
  id: string;
  customerName: string;
  phone: string;
  dateTime: string;
  guests: number;
  comboName: string;
  finalTotal: number;
  status: string;
};

export default function TimelinePage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 border-yellow-300 text-yellow-800";
      case "CONFIRMED":
        return "bg-blue-100 border-blue-300 text-blue-800";
      case "COMPLETED":
        return "bg-green-100 border-green-300 text-green-800";
      case "CANCELLED":
        return "bg-red-100 border-red-300 text-red-800";
      default:
        return "bg-gray-100 border-gray-300 text-gray-800";
    }
  };

  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: Date[] = [];
    const current = new Date(startDate);

    while (days.length < 42) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return bookings.filter((booking) => {
      const bookingDateStr = new Date(booking.dateTime).toISOString().split("T")[0];
      return bookingDateStr === dateStr;
    });
  };

  const changeMonth = (delta: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() + delta);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#8b857a]">Đang tải dữ liệu...</div>
      </div>
    );
  }

  const monthDays = getMonthDays(selectedDate);
  const today = new Date();
  const currentMonth = selectedDate.getMonth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif text-[#1a1a1a]">Lịch Đặt Bàn</h1>

        <button
          onClick={goToToday}
          className="px-4 py-2 bg-white border border-black/10 rounded-lg text-sm hover:bg-[#f8f6f4] transition"
        >
          Hôm nay
        </button>
      </div>

      {/* Month Navigation */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-black/5">
        <div className="flex items-center justify-between">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 hover:bg-[#f8f6f4] rounded-lg transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="text-center">
            <h2 className="text-2xl font-serif text-[#1a1a1a]">
              Tháng {selectedDate.getMonth() + 1} / {selectedDate.getFullYear()}
            </h2>
            <p className="text-sm text-[#8b857a] mt-1">
              {bookings.filter((b) => {
                const bookingMonth = new Date(b.dateTime).getMonth();
                const bookingYear = new Date(b.dateTime).getFullYear();
                return bookingMonth === selectedDate.getMonth() && bookingYear === selectedDate.getFullYear();
              }).length} đơn hàng
            </p>
          </div>

          <button
            onClick={() => changeMonth(1)}
            className="p-2 hover:bg-[#f8f6f4] rounded-lg transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl shadow-sm border border-black/5 overflow-hidden">
        {/* Week days header */}
        <div className="grid grid-cols-7 bg-[#f8f6f4] border-b border-black/5">
          {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-[#1a1a1a]">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {monthDays.map((day, index) => {
            const dayBookings = getBookingsForDate(day);
            const isToday =
              day.getDate() === today.getDate() &&
              day.getMonth() === today.getMonth() &&
              day.getFullYear() === today.getFullYear();
            const isCurrentMonth = day.getMonth() === currentMonth;
            const isPast = day < today && !isToday;

            return (
              <div
                key={index}
                className={`min-h-[120px] border-b border-r border-black/5 p-2 ${
                  !isCurrentMonth ? "bg-gray-50" : ""
                } ${isPast ? "opacity-60" : ""}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span
                    className={`text-sm font-medium ${
                      isToday
                        ? "bg-[#c9a24d] text-white w-7 h-7 rounded-full flex items-center justify-center"
                        : isCurrentMonth
                        ? "text-[#1a1a1a]"
                        : "text-[#8b857a]"
                    }`}
                  >
                    {day.getDate()}
                  </span>

                  {dayBookings.length > 0 && (
                    <span className="text-xs bg-[#c9a24d] text-white px-2 py-0.5 rounded-full font-medium">
                      {dayBookings.length}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  {dayBookings.slice(0, 3).map((booking) => (
                    <div
                      key={booking.id}
                      className={`text-xs p-1.5 rounded border ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      <div className="font-medium truncate">
                        {new Date(booking.dateTime).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        • {booking.customerName}
                      </div>
                      <div className="text-[10px] opacity-75 truncate">
                        {booking.guests} khách • {booking.comboName}
                      </div>
                    </div>
                  ))}

                  {dayBookings.length > 3 && (
                    <div className="text-xs text-[#8b857a] text-center py-1">
                      +{dayBookings.length - 3} đơn khác
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-black/5">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-300"></div>
            <span className="text-[#8b857a]">Chờ xác nhận</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-100 border border-blue-300"></div>
            <span className="text-[#8b857a]">Đã xác nhận</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-100 border border-green-300"></div>
            <span className="text-[#8b857a]">Hoàn thành</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-100 border border-red-300"></div>
            <span className="text-[#8b857a]">Đã hủy</span>
          </div>
        </div>
      </div>
    </div>
  );
}
