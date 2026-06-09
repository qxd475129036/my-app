"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface NavItem {
  name: string;
  icon: string;
  href?: string;
  children?: { name: string; href: string }[];
}

const navItems: NavItem[] = [
  { name: "Dashboard", icon: "📊", href: "/dashboard" },
  {
    name: "Master管理",
    icon: "📋",
    children: [
      { name: "店铺管理", href: "/master/store" },
      { name: "请求CD管理", href: "/master/request-cd" },
      { name: "单价管理", href: "/master/price" },
    ],
  },
  {
    name: "请求业务",
    icon: "📝",
    children: [
      { name: "一括调整", href: "/request/bulk-adjust" },
      { name: "元数据入力", href: "/request/metadata" },
      { name: "请求承认", href: "/request/approval" },
    ],
  },
  {
    name: "代引业务",
    icon: "🚚",
    children: [
      { name: "代引一览", href: "/delivery/list" },
      { name: "出金一览", href: "/delivery/payment" },
      { name: "代引日历", href: "/delivery/calendar" },
    ],
  },
  {
    name: "退款业务",
    icon: "💰",
    children: [
      { name: "退款一览", href: "/refund/list" },
      { name: "CD定义一览", href: "/refund/cd" },
    ],
  },
  {
    name: "明细下载",
    icon: "⬇️",
    children: [
      { name: "保管明细下载", href: "/download/hokan" },
      { name: "配送明细下载", href: "/download/sohaku" },
    ],
  },
  { name: "明细修正", icon: "🔧", href: "/correction" },
  { name: "Test DataTable", icon: "🧪", href: "/test/datatable" },
];

export interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(["Master管理", "请求业务", "代引业务", "退款业务", "明细下载"])
  );

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const toggleGroup = (name: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const mutedText = "text-[var(--env-sidebar-muted)]";

  return (
    <aside
      style={{ background: "var(--env-gradient)" }}
      className={`fixed left-0 top-0 h-full flex flex-col transition-all duration-300 z-40 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
        {!collapsed && (
          <span className="text-lg font-bold tracking-wide text-white">
            MyApp
          </span>
        )}
        <button
          onClick={onToggle}
          className={`rounded-lg p-1.5 ${mutedText} hover:text-white hover:bg-white/10 transition-colors`}
        >
          <svg
            className={`h-5 w-5 transition-transform ${collapsed ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const hasChildren = !!item.children;
          const expanded = expandedGroups.has(item.name);

          return (
            <div key={item.name}>
              {hasChildren ? (
                <>
                  <button
                    onClick={() => toggleGroup(item.name)}
                    className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? "bg-[#2563eb] text-white"
                        : `${mutedText} hover:bg-white/10 hover:text-white`
                    }`}
                  >
                    <span className="text-base flex-shrink-0">{item.icon}</span>
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left truncate">{item.name}</span>
                        <svg
                          className={`h-4 w-4 transition-transform flex-shrink-0 ${
                            expanded ? "rotate-90" : ""
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                  {!collapsed && expanded && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.children?.map((child) => {
                        const childActive = isActive(child.href);
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                              childActive
                                ? "bg-[#2563eb]/20 text-[#2563eb] font-medium"
                                : `${mutedText} hover:text-white hover:bg-white/5`
                            }`}
                          >
                            {child.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href || "#"}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-[#2563eb] text-white"
                      : `${mutedText} hover:bg-white/10 hover:text-white`
                  }`}
                  title={collapsed ? item.name : undefined}
                >
                  <span className="text-base flex-shrink-0">{item.icon}</span>
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* User info */}
      <div className="border-t border-white/10 p-4">
        {session?.user ? (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563eb] text-xs font-bold text-white flex-shrink-0">
              {session.user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {session.user.name}
                </p>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className={`text-xs ${mutedText} hover:text-white transition-colors`}
                >
                  ログアウト
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-white/10 animate-pulse flex-shrink-0" />
            {!collapsed && (
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-20 rounded bg-white/10 animate-pulse" />
                <div className="h-2 w-14 rounded bg-white/10 animate-pulse" />
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
