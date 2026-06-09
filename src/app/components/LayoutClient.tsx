"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";

const VALID_ENVS = ["local", "dev", "stg", "prd"] as const;
type Env = (typeof VALID_ENVS)[number];

function resolveEnv(raw: string | null): Env {
  if (raw && VALID_ENVS.includes(raw as Env)) {
    return raw as Env;
  }
  return "local";
}

export function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isLoginPage = pathname.startsWith("/login");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const env = resolveEnv(searchParams.get("env"));
    document.documentElement.dataset.env = env;
  }, [searchParams]);

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
