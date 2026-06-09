"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";

export function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname.startsWith("/login");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
      />
      <div
        className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ${
          sidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        <main className="flex-1 bg-gray-50">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
