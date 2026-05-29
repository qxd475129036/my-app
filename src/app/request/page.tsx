import Link from "next/link";

const modules = [
  {
    title: "一括価格修正",
    description: "一括価格修正。条件指定、プレビュー、適用実行。",
    href: "/request/bulk-adjust",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "メタデータ管理",
    description: "メタデータ管理。登録、編集、削除、検索機能。",
    href: "/request/metadata",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
  },
  {
    title: "承認管理",
    description: "承認ワークフロー。ステータス別集計、承認・却下処理。",
    href: "/request/approval",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function RequestPage() {
  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">請求業務</h1>
        <p className="mt-1 text-sm text-muted">請求関連業務モジュール</p>
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
            <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors">
              {mod.title}
            </h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">{mod.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
