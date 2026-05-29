import Link from "next/link";

const modules = [
  {
    title: "代引管理",
    description: "代引注文管理。検索、詳細表示、一括操作。",
    href: "/delivery/list",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    title: "出金管理",
    description: "出金記録管理。承認、ステータス追跡。",
    href: "/delivery/payment",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    title: "配送日曆",
    description: "配送日程管理。月別表示、編集。",
    href: "/delivery/calendar",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
];

export default function DeliveryPage() {
  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">代引業務</h1>
        <p className="mt-1 text-sm text-muted">代引関連業務モジュール</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((mod) => (
          <Link
            key={mod.href}
            href={mod.href}
            className="group rounded-xl border border-card-border bg-card p-6 transition-all hover:shadow-lg hover:border-accent/30"
          >
            <div className="mb-4 inline-flex items-center justify-center h-14 w-14 rounded-xl bg-accent-light text-accent group-hover:bg-accent group-hover:text-white transition-colors">
              {mod.icon}
            </div>
            <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors">{mod.title}</h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">{mod.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
