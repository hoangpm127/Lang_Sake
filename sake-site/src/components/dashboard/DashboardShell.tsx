"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const navByRole: Record<
  string,
  { label: string; href: string; hint?: string }[]
> = {
  admin: [
    { label: "Tổng quan", href: "/dashboard/admin" },
    { label: "Hierarchy", href: "/dashboard/admin#hierarchy" },
    { label: "Booking", href: "/dashboard/admin#bookings" },
  ],
  f1: [
    { label: "Tổng quan", href: "/dashboard/f1" },
    { label: "Hiệu suất team", href: "/dashboard/f1#team" },
    { label: "Referral", href: "/dashboard/f1#referral" },
  ],
  f2: [
    { label: "Đặt lịch", href: "/dashboard/f2" },
    { label: "Ví tiền", href: "/dashboard/f2#wallet" },
    { label: "Xếp hạng", href: "/dashboard/f2#rank" },
  ],
};

type DashboardShellProps = {
  role: string;
  user?: string;
  children: React.ReactNode;
};

export default function DashboardShell({
  role,
  user,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = navByRole[role] ?? navByRole.f2;

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#1a1a1a]">
      <div className="flex">
        <aside
          className={cn(
            "min-h-screen bg-[#1a1a1a] text-[#d6c8a5] transition-all duration-300",
            collapsed ? "w-20" : "w-64"
          )}
        >
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full border border-[#d6c8a5]" />
              {!collapsed && (
                <div>
                  <p className="text-sm font-semibold tracking-[0.2em] text-[#d6c8a5]">
                    LÀNG SAKE
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-[#8d7f63]">
                    Tokyo Luxey
                  </p>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setCollapsed((prev) => !prev)}
              className="text-xs uppercase tracking-[0.2em] text-[#8d7f63]"
            >
              {collapsed ? ">" : "<"}
            </button>
          </div>
          <nav className="mt-6 space-y-2 px-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href.split("#")[0];
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] transition",
                    isActive
                      ? "bg-[#d6c8a5] text-[#1a1a1a]"
                      : "text-[#d6c8a5]/80 hover:text-white"
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-black/5 bg-white/70 backdrop-blur-xl">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="text-xs uppercase tracking-[0.3em] text-[#8d7f63]">
                  Dashboard
                </span>
                <span className="rounded-full border border-[#d6c8a5] px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-[#a78a52]">
                  {role.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs font-semibold text-[#1a1a1a]">
                    {user || "Làng Sake"}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-[#8d7f63]">
                    {role === "admin"
                      ? "Super Admin"
                      : role === "f1"
                        ? "F1 Manager"
                        : "F2 Affiliate"}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full border border-[#d6c8a5]" />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="rounded-full border border-black/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#6b5f4b]"
                >
                  Đăng xuất
                </motion.button>
              </div>
            </div>
          </header>

          <main className="flex-1">
            <div className="mx-auto w-full max-w-6xl px-6 py-10">
              <div className="washi-overlay rounded-[32px] border border-black/5 bg-[#fafafa] p-6 sm:p-10">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
