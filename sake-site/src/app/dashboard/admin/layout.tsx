"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="flex h-screen bg-[#f8f6f4]">
      {/* Sidebar */}
      <aside className="w-56 bg-[#1a1a1a] text-white flex flex-col">
        <div className="p-5 border-b border-white/10">
          <h1 className="text-xl font-serif text-[#c9a24d]">Lang Sake</h1>
          <p className="text-xs text-white/50 mt-1">Admin</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <Link
            href="/dashboard/admin"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition text-white/90 hover:text-white"
          >
            <svg className="w-4 h-4 text-[#c9a24d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-sm font-medium">Đơn Hàng</span>
          </Link>

          <Link
            href="/dashboard/admin/timeline"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition text-white/90 hover:text-white"
          >
            <svg className="w-4 h-4 text-[#c9a24d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium">Timeline</span>
          </Link>

          <Link
            href="/dashboard/admin/revenue"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition text-white/90 hover:text-white"
          >
            <svg className="w-4 h-4 text-[#c9a24d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-sm font-medium">Doanh Thu</span>
          </Link>
        </nav>

        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/10 text-red-400 transition w-full text-left"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-sm font-medium">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
