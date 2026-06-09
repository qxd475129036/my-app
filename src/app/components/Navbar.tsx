"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

interface NavItem {
  name: string;
  href?: string;
  children?: NavItem[];
}

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const navLinks: NavItem[] = [
    { name: "Dashboard", href: "/dashboard" },
    {
      name: "Master管理",
      children: [
        { name: "店铺管理", href: "/master/store" },
        { name: "请求CD管理", href: "/master/request-cd" },
        { name: "单价管理", href: "/master/price" },
      ],
    },
    {
      name: "请求业务",
      children: [
        { name: "一括调整", href: "/request/bulk-adjust" },
        { name: "元数据入力", href: "/request/metadata" },
        { name: "请求承认", href: "/request/approval" },
      ],
    },
    {
      name: "代引业务",
      children: [
        { name: "代引一览", href: "/delivery/list" },
        { name: "出金一览", href: "/delivery/payment" },
        { name: "代引日历", href: "/delivery/calendar" },
      ],
    },
    {
      name: "退款业务",
      children: [
        { name: "退款一览", href: "/refund/list" },
        { name: "CD定义一览", href: "/refund/cd" },
      ],
    },
    {
      name: "明细下载",
      children: [
        { name: "保管明细下载", href: "/download/hokan" },
        { name: "配送明细下载", href: "/download/sohaku" },
      ],
    },
    { name: "明细修正", href: "/correction" },

    { name: "Login", href: "/login" },
  ];

  // 点击外部关闭菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      // 如果点击的是菜单按钮或菜单内部，不关闭菜单
      if (menuRef.current && menuRef.current.contains(target)) {
        return;
      }
      // 检查是否点击的是导航栏内的其他元素
      const nav = document.querySelector("nav");
      if (nav && nav.contains(target)) {
        return;
      }
      setOpenMenu(null);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = (name: string) => {
    setOpenMenu(openMenu === name ? null : name);
  };

  const closeMenu = () => setOpenMenu(null);

  const isActivePath = (href?: string, children?: NavItem[]) => {
    if (!href && !children) return false;
    if (href) {
      // 精确匹配或子路径匹配
      if (pathname === href) return true;
      if (pathname.startsWith(href + "/")) return true;
    }
    if (children) {
      return children.some((child) => {
        const childHref = child.href || "";
        return pathname === childHref || pathname.startsWith(childHref + "/");
      });
    }
    return false;
  };

  return (
    <nav className="bg-card border-b border-border dark:border-[var(--border)]">
      <div className="mx-auto w-[80vw] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold text-foreground">
              MyApp
            </Link>
            <div className="flex items-center gap-1 ">
              {navLinks.map((link) => {
                if (link.href === "/login" && status === "authenticated") {
                  return null;
                }

                const active = isActivePath(link.href, link.children);
                const hasChildren = !!link.children;

                if (hasChildren) {
                  return (
                    <div
                      key={link.name}
                      className="relative"
                      ref={menuRef}
                    >
                      <button
                        onClick={() => toggleMenu(link.name)}
                        className={`relative flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                          active
                            ? "text-accent bg-accent-light"
                            : "text-muted hover:text-foreground hover:bg-accent-light"
                        }`}
                      >
                        {link.name}
                        <svg
                          className={`h-4 w-4 transition-transform ${
                            openMenu === link.name ? "rotate-180" : ""
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      {openMenu === link.name && (
                        <div className="absolute left-0 top-full mt-2 w-64 rounded-xl bg-card dark:bg-[var(--card)] shadow-xl ring-1 ring-border z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="p-1.5">
                            {link.children?.map((child, index) => {
                              const childHref = child.href || "#";
                              return (
                                <a
                                  key={index}
                                  href={childHref}
                                  className={`block rounded-lg px-4 py-2.5 text-sm transition-colors ${
                                    pathname === childHref
                                      ? "bg-accent-light text-accent"
                                      : "text-foreground hover:bg-accent-light hover:text-foreground"
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    closeMenu();
                                    // 使用 router.push 进行客户端导航
                                    // 先关闭菜单，再跳转
                                    setTimeout(() => {
                                      router.push(childHref);
                                    }, 50);
                                  }}
                                >
                                  <div className="flex items-center justify-between">
                                    <span>{child.name}</span>
                                    {pathname === childHref && (
                                      <svg
                                        className="h-4 w-4 text-accent"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M5 13l4 4L19 7"
                                        />
                                      </svg>
                                    )}
                                  </div>
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.name}
                    href={link.href || "#"}
                    className={`relative px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "text-accent"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    {link.name}
                    {active && (
                      <span className="absolute bottom-0 left-0 h-0.5 w-full bg-accent" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center">
            {status === "authenticated" ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted hidden sm:block">
                  {session?.user?.name}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="rounded-md bg-accent px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-accent/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="hidden sm:block h-4 w-20 bg-accent-light rounded animate-pulse" />
                <div className="h-8 w-20 bg-accent-light rounded-md animate-pulse" />
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
