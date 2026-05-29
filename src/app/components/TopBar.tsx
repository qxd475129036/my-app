"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

const routeLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/master": "Master管理",
  "/master/store": "店铺管理",
  "/master/request-cd": "请求CD管理",
  "/master/price": "单价管理",
  "/request": "请求业务",
  "/request/bulk-adjust": "一括调整",
  "/request/metadata": "元数据入力",
  "/request/approval": "请求承认",
  "/delivery": "代引业务",
  "/delivery/list": "代引一览",
  "/delivery/payment": "出金一览",
  "/delivery/calendar": "代引日历",
  "/refund": "退款业务",
  "/refund/list": "退款一览",
  "/refund/cd": "CD定义一览",
  "/download": "明细下载",
  "/download/hokan": "保管明细下载",
  "/download/sohaku": "配送明细下载",
  "/correction": "明细修正",
};

export function TopBar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Build breadcrumb trail
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: { label: string; path: string }[] = [];
  let current = "";
  for (const seg of segments) {
    current += "/" + seg;
    const label = routeLabels[current];
    if (label) {
      breadcrumbs.push({ label, path: current });
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white/95 backdrop-blur-sm px-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.path} className="flex items-center gap-1.5">
            {i > 0 && (
              <svg className="h-3.5 w-3.5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            {i === breadcrumbs.length - 1 ? (
              <span className="font-medium text-foreground">{crumb.label}</span>
            ) : (
              <span className="text-muted">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      {/* User info */}
      {session?.user && (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
            {session.user.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <span className="text-sm font-medium text-foreground hidden sm:block">
            {session.user.name}
          </span>
        </div>
      )}
    </header>
  );
}
