"use client";

import { useState, useEffect } from "react";

type UserNode = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  referralCode?: string;
  isActive: boolean;
  commissionRate?: number;
  discountRate?: number;
  totalCommission?: number;
  createdAt: string;
  stats: {
    bookingCount: number;
    totalRevenue: number;
  };
  children: UserNode[];
};

type TreeNodeProps = {
  node: UserNode;
  level: number;
};

// Generate initials from name
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Get avatar color based on role
function getAvatarConfig(role: string) {
  switch (role) {
    case "ADMIN":
      return {
        gradient: "from-red-400 via-pink-500 to-rose-600",
        border: "border-red-300",
        glow: "shadow-red-300/50",
        line: "bg-gradient-to-b from-red-400 to-blue-400",
      };
    case "F1_PARTNER":
      return {
        gradient: "from-blue-400 via-cyan-500 to-indigo-600",
        border: "border-blue-300",
        glow: "shadow-blue-300/50",
        line: "bg-gradient-to-b from-blue-400 to-green-400",
      };
    case "F2_MEMBER":
      return {
        gradient: "from-green-400 via-emerald-500 to-teal-600",
        border: "border-green-300",
        glow: "shadow-green-300/50",
        line: "bg-green-400",
      };
    default:
      return {
        gradient: "from-gray-400 to-gray-600",
        border: "border-gray-300",
        glow: "shadow-gray-300/50",
        line: "bg-gray-400",
      };
  }
}

function TreeNode({ node, level }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  const config = getAvatarConfig(node.role);
  const initials = getInitials(node.name);

  return (
    <div className="flex flex-col items-center">
      {/* Avatar Circle - "Fruit" on tree */}
      <div className="relative group">
        {/* Connecting line from parent (except root) */}
        {level > 0 && (
          <div className={`absolute bottom-full left-1/2 -translate-x-1/2 w-0.5 h-8 ${config.line}`}></div>
        )}

        {/* Avatar Circle */}
        <div
          className="relative z-10"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <div
            className={`w-14 h-14 rounded-full bg-gradient-to-br ${config.gradient} ${config.border} border-3 flex items-center justify-center text-white font-bold text-sm cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-xl ${config.glow} ${
              !node.isActive && "opacity-40 grayscale"
            }`}
          >
            {initials}
          </div>

          {/* Expand/Collapse indicator */}
          {hasChildren && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-white rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-indigo-500 hover:bg-indigo-50 transition-colors shadow z-20"
            >
              <span className="text-[10px] text-gray-600">
                {isExpanded ? "−" : "+"}
              </span>
            </button>
          )}

          {/* Role Badge */}
          <div className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
            <span className="text-[10px]">
              {node.role === "ADMIN" ? "👑" : node.role === "F1_PARTNER" ? "⭐" : "💼"}
            </span>
          </div>
        </div>

        {/* Tooltip on hover - Compact */}
        {showTooltip && (
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-50 animate-in fade-in slide-in-from-left-1 duration-150">
            <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-6 border-t-transparent border-b-6 border-b-transparent border-r-6 border-r-white"></div>
            
            <div className="space-y-2">
              <div>
                <h3 className="text-sm font-bold text-gray-900">{node.name}</h3>
                <span className={`inline-block px-1.5 py-0.5 text-[10px] font-semibold rounded ${
                  node.role === "ADMIN" 
                    ? "bg-red-100 text-red-700"
                    : node.role === "F1_PARTNER"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-green-100 text-green-700"
                }`}>
                  {node.role === "ADMIN" ? "Admin" : node.role === "F1_PARTNER" ? "F1" : "F2"}
                </span>
              </div>

              <div className="space-y-0.5 text-xs text-gray-600">
                <div className="flex items-center gap-1.5 truncate">
                  <span>📧</span>
                  <span className="truncate text-[11px]">{node.email}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>📱</span>
                  <span className="text-[11px]">{node.phone}</span>
                </div>
                {node.referralCode && (
                  <div className="flex items-center gap-1.5">
                    <span>🎫</span>
                    <code className="px-1.5 py-0.5 bg-gray-100 rounded text-indigo-600 font-mono text-[10px] font-semibold">
                      {node.referralCode}
                    </code>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-1.5 border-t border-gray-200 text-[11px]">
                <div className="flex-1 text-center">
                  <div className="text-gray-500">Bookings</div>
                  <div className="font-bold text-indigo-600">{node.stats.bookingCount}</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-gray-500">Revenue</div>
                  <div className="font-bold text-green-600">
                    {(node.stats.totalRevenue / 1000000).toFixed(1)}M
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Name label below avatar - Compact */}
      <div className="mt-1 text-center">
        <p className="text-xs font-semibold text-gray-800 max-w-[100px] truncate">
          {node.name}
        </p>
        {hasChildren && (
          <p className="text-[10px] text-gray-500">
            {node.children.length} {node.role === "ADMIN" ? "F1" : "F2"}
          </p>
        )}
      </div>

      {/* Children - branches */}
      {isExpanded && hasChildren && (
        <div className="relative mt-6">
          {/* Horizontal connector line */}
          {node.children.length > 1 && (
            <div className="absolute top-0 left-0 right-0 flex justify-center">
              <div
                className={`h-0.5 ${config.line}`}
                style={{
                  width: `${(node.children.length - 1) * 120}px`,
                }}
              ></div>
            </div>
          )}

          {/* Child nodes */}
          <div className="flex gap-8 justify-center pt-8">
            {node.children.map((child) => (
              <div key={child.id} className="relative">
                <div className={`absolute bottom-full left-1/2 -translate-x-1/2 w-0.5 h-8 ${config.line}`}></div>
                <TreeNode node={child} level={level + 1} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function UserTreeView() {
  const [tree, setTree] = useState<UserNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTree = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users/tree");
      const data = await response.json();

      if (data.ok) {
        setTree(data.tree);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Lỗi khi tải cấu trúc tổ chức");
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchTree();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải cấu trúc tổ chức...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p className="font-bold">Lỗi</p>
        <p>{error}</p>
      </div>
    );
  }

  if (tree.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
        <p>Chưa có dữ liệu tổ chức.</p>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header - Compact */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🌳</span>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Sơ Đồ Tổ Chức</h1>
              <p className="text-xs text-gray-500">Di chuột vào avatar để xem chi tiết</p>
            </div>
          </div>
          
          <button
            onClick={fetchTree}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow flex items-center gap-1.5"
          >
            <span>🔄</span>
            Làm mới
          </button>
        </div>

        {/* Legend - Inline */}
        <div className="flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-400 to-rose-600 flex items-center justify-center text-white text-[10px] font-bold">A</div>
            <span className="font-medium text-gray-700">Admin</span>
          </div>
          <span className="text-gray-400">→</span>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">F1</div>
            <span className="font-medium text-gray-700">F1 Partner</span>
          </div>
          <span className="text-gray-400">→</span>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-teal-600 flex items-center justify-center text-white text-[10px] font-bold">F2</div>
            <span className="font-medium text-gray-700">F2 Member</span>
          </div>
        </div>

        {/* Tree Container - Fit in viewport */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6 overflow-x-auto">
          <div className="min-w-max flex justify-center">
            {tree.map((node) => (
              <TreeNode key={node.id} node={node} level={0} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
