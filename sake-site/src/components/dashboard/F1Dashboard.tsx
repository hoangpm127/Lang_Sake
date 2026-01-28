"use client";

import { useMemo, useState } from "react";

const teamMembers = [
  {
    name: "Phúc H",
    bookings: 32,
    revenue: 220000000,
    commission: 17600000,
    top: true,
  },
  {
    name: "Linh P",
    bookings: 28,
    revenue: 180000000,
    commission: 14400000,
  },
  {
    name: "Trang K",
    bookings: 19,
    revenue: 140000000,
    commission: 11200000,
  },
];

const formatVnd = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(value);

export default function F1Dashboard() {
  const [code, setCode] = useState("F1-TRAM2026");
  const referralLink = useMemo(
    () => `https://langsake.vn/affiliate?ref=${code}`,
    [code]
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralLink);
  };

  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-[#8b857a]">
          Team Performance
        </p>
        <div className="rounded-3xl border border-black/10 bg-white p-6" id="team">
          <div className="grid grid-cols-5 gap-4 text-xs uppercase tracking-[0.2em] text-[#8b857a]">
            <span>F2</span>
            <span>Bookings</span>
            <span>Doanh thu</span>
            <span>Hoa hồng</span>
            <span className="text-right">Ghi chú</span>
          </div>
          <div className="mt-4 space-y-3">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className="grid grid-cols-5 gap-4 rounded-2xl border border-black/5 bg-[#fafafa] px-4 py-3 text-sm"
              >
                <span>{member.name}</span>
                <span>{member.bookings}</span>
                <span>{formatVnd(member.revenue)} đ</span>
                <span>{formatVnd(member.commission)} đ</span>
                <span className="text-right">
                  {member.top ? (
                    <span className="rounded-full bg-[#f2e6c9] px-3 py-1 text-xs text-[#8b6a2e]">
                      Top Performer
                    </span>
                  ) : (
                    <span className="text-xs text-[#8b857a]">Ổn định</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="referral" className="space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-[#8b857a]">
          Referral Link Generator
        </p>
        <div className="rounded-3xl border border-black/10 bg-white p-6">
          <div className="space-y-4">
            <label className="text-xs uppercase tracking-[0.2em] text-[#8b857a]">
              Mã giới thiệu
            </label>
            <div className="flex flex-wrap gap-3">
              <input
                value={code}
                onChange={(event) => setCode(event.target.value)}
                className="flex-1 rounded-full border border-black/10 px-4 py-2 text-sm"
              />
              <button
                onClick={handleCopy}
                className="rounded-full border border-black/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#6b5f4b]"
                type="button"
              >
                Copy link
              </button>
            </div>
            <div className="rounded-2xl border border-black/5 bg-[#fafafa] px-4 py-3 text-xs text-[#6b5f4b]">
              {referralLink}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
