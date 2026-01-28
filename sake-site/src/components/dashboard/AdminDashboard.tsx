const revenuePoints = [20, 35, 50, 45, 70, 90, 120, 110, 140, 160, 190, 220];

const hierarchy = [
  {
    id: "f1-01",
    name: "Ngọc Trâm",
    region: "Hà Nội",
    f2Count: 12,
    revenue: "1.2B",
    status: "Active",
    team: [
      { name: "Phúc H", bookings: 32, revenue: "220M", status: "Active" },
      { name: "Linh P", bookings: 28, revenue: "180M", status: "Active" },
      { name: "Trang K", bookings: 19, revenue: "140M", status: "Pending" },
    ],
  },
  {
    id: "f1-02",
    name: "Hải Dương",
    region: "Hải Phòng",
    f2Count: 9,
    revenue: "860M",
    status: "Active",
    team: [
      { name: "Minh T", bookings: 20, revenue: "120M", status: "Active" },
      { name: "Thảo N", bookings: 16, revenue: "96M", status: "Active" },
    ],
  },
  {
    id: "f1-03",
    name: "Gia Hân",
    region: "Hưng Yên",
    f2Count: 7,
    revenue: "640M",
    status: "Review",
    team: [
      { name: "Kiên L", bookings: 12, revenue: "60M", status: "Active" },
      { name: "Huyền M", bookings: 9, revenue: "45M", status: "Inactive" },
    ],
  },
];

const bookings = [
  {
    id: "BK-1024",
    guest: "Nguyễn Thảo",
    combo: "Combo Gia Đình",
    guests: 6,
    status: "Deposited",
    value: "2.4M",
  },
  {
    id: "BK-1025",
    guest: "Hoàng Duy",
    combo: "Combo Cặp Đôi",
    guests: 2,
    status: "Paid",
    value: "666K",
  },
  {
    id: "BK-1026",
    guest: "Mai Linh",
    combo: "Combo Sinh Viên",
    guests: 4,
    status: "Cancelled",
    value: "396K",
  },
];

export default function AdminDashboard() {
  const chartWidth = 520;
  const chartHeight = 140;
  const maxValue = Math.max(...revenuePoints);
  const chartPath = revenuePoints
    .map((point, index) => {
      const x = (index / (revenuePoints.length - 1)) * chartWidth;
      const y = chartHeight - (point / maxValue) * chartHeight;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="space-y-12">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-[#8b857a]">
            Total Revenue
          </p>
          <p className="mt-4 font-serif text-3xl text-[#1a1a1a]">32.6B</p>
          <p className="mt-2 text-xs text-[#8b857a]">+12% so với tháng trước</p>
          <svg
            className="mt-6 w-full"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            fill="none"
          >
            <path d={chartPath} stroke="#c9a24d" strokeWidth="3" />
            <path
              d={`${chartPath} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`}
              fill="url(#goldFade)"
              opacity="0.2"
            />
            <defs>
              <linearGradient id="goldFade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c9a24d" />
                <stop offset="100%" stopColor="#c9a24d" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-[#8b857a]">
            Total Guests
          </p>
          <p className="mt-4 font-serif text-3xl text-[#1a1a1a]">18.420</p>
          <p className="mt-2 text-xs text-[#8b857a]">Realtime sync từ booking</p>
          <div className="mt-6 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full border border-[#c9a24d]" />
            <p className="text-xs text-[#8b857a]">
              Trung bình 612 khách/ngày
            </p>
          </div>
        </div>
        <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-[#8b857a]">
            System Health
          </p>
          <div className="mt-5 space-y-4 text-sm text-[#1a1a1a]">
            <div className="flex items-center justify-between">
              <span>Active F1s</span>
              <span className="font-semibold">24</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Active F2s</span>
              <span className="font-semibold">168</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Alerts</span>
              <span className="rounded-full bg-[#f2e6c9] px-3 py-1 text-xs text-[#8b6a2e]">
                3 cần xử lý
              </span>
            </div>
          </div>
        </div>
      </div>

      <section id="hierarchy" className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#8b857a]">
            Master Hierarchy
          </p>
          <h2 className="mt-2 font-serif text-2xl text-[#1a1a1a]">
            Hệ thống F1 / F2
          </h2>
        </div>
        <div className="space-y-4">
          {hierarchy.map((f1) => (
            <details
              key={f1.id}
              className="rounded-2xl border border-black/10 bg-white"
            >
              <summary className="grid cursor-pointer list-none grid-cols-5 gap-4 px-6 py-4 text-sm font-semibold text-[#1a1a1a]">
                <span>{f1.name}</span>
                <span>{f1.region}</span>
                <span>{f1.f2Count} F2</span>
                <span>{f1.revenue}</span>
                <span className="text-right text-[#8b6a2e]">
                  {f1.status}
                </span>
              </summary>
              <div className="border-t border-black/5 px-6 py-4 text-xs text-[#6f665a]">
                <div className="grid grid-cols-4 gap-4 pb-2 font-semibold uppercase tracking-[0.2em]">
                  <span>F2</span>
                  <span>Bookings</span>
                  <span>Revenue</span>
                  <span className="text-right">Status</span>
                </div>
                {f1.team.map((member) => (
                  <div
                    key={member.name}
                    className="grid grid-cols-4 gap-4 py-2 text-sm text-[#1a1a1a]"
                  >
                    <span>{member.name}</span>
                    <span>{member.bookings}</span>
                    <span>{member.revenue}</span>
                    <span className="text-right text-[#8b857a]">
                      {member.status}
                    </span>
                  </div>
                ))}
                <div className="mt-4 flex justify-end gap-3 text-xs uppercase tracking-[0.2em]">
                  <button className="rounded-full border border-black/10 px-4 py-2">
                    Toggle Status
                  </button>
                  <button className="rounded-full border border-black/10 px-4 py-2">
                    Commission History
                  </button>
                </div>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section id="bookings" className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#8b857a]">
            Customer Data
          </p>
          <h2 className="mt-2 font-serif text-2xl text-[#1a1a1a]">
            Bookings gần đây
          </h2>
        </div>
        <div className="rounded-3xl border border-black/10 bg-white p-6">
          <div className="grid grid-cols-5 gap-4 text-xs uppercase tracking-[0.2em] text-[#8b857a]">
            <span>ID</span>
            <span>Khách</span>
            <span>Combo</span>
            <span>Khách</span>
            <span className="text-right">Trạng thái</span>
          </div>
          <div className="mt-4 space-y-3 text-sm text-[#1a1a1a]">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="grid grid-cols-5 gap-4 rounded-2xl border border-black/5 bg-[#fafafa] px-4 py-3"
              >
                <span>{booking.id}</span>
                <span>{booking.guest}</span>
                <span>{booking.combo}</span>
                <span>{booking.guests}</span>
                <span className="text-right">
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      booking.status === "Paid"
                        ? "bg-[#e7efe2] text-[#5f8f52]"
                        : booking.status === "Deposited"
                          ? "bg-[#f2e6c9] text-[#8b6a2e]"
                          : "bg-[#fde4e7] text-[#a63b45]"
                    }`}
                  >
                    {booking.status}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
