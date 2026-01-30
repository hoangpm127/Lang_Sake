"use client";

import { useState, useEffect } from "react";

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  minDate?: string;
  label?: string;
  error?: string;
}

export function DateTimePicker({
  value,
  onChange,
  minDate,
  label,
  error,
}: DateTimePickerProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    if (value) {
      const dateObj = new Date(value);
      // Format date as YYYY-MM-DD
      const dateStr = dateObj.toISOString().split("T")[0];
      // Format time as HH:MM
      const timeStr = dateObj.toTimeString().slice(0, 5);
      setDate(dateStr);
      setTime(timeStr);
    }
  }, [value]);

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    if (newDate && time) {
      const combinedDateTime = `${newDate}T${time}:00`;
      onChange(combinedDateTime);
    }
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    if (date && newTime) {
      const combinedDateTime = `${date}T${newTime}:00`;
      onChange(combinedDateTime);
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const minDateStr = minDate || today;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div className="grid grid-cols-2 gap-3">
        {/* Date Input */}
        <div>
          <input
            type="date"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            min={minDateStr}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#c9a24d] focus:border-[#c9a24d] transition ${
              error ? "border-red-500" : "border-gray-300"
            }`}
          />
          <p className="text-xs text-gray-500 mt-1">Ngày</p>
        </div>

        {/* Time Input */}
        <div>
          <input
            type="time"
            value={time}
            onChange={(e) => handleTimeChange(e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#c9a24d] focus:border-[#c9a24d] transition ${
              error ? "border-red-500" : "border-gray-300"
            }`}
          />
          <p className="text-xs text-gray-500 mt-1">Giờ</p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}

      {date && time && (
        <p className="text-sm text-gray-600 mt-2">
          📅 {new Date(`${date}T${time}`).toLocaleString("vi-VN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      )}
    </div>
  );
}
