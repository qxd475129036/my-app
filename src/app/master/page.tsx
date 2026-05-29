import Link from "next/link";

const modules = [
  {
    title: "店铺管理",
    description: "店铺情報の管理。LOB管理、店铺詳細情報のCRUD。",
    href: "/master/store",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    title: "請求CD管理",
    description: "請求CDの登録、編集、削除。バッチ操作、ページネーション。",
    href: "/master/request-cd",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    title: "単価管理",
    description: "商品単価の一括管理。検索、フィルタ、CSV出力機能。",
    href: "/master/price",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function MasterPage() {
  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Master管理</h1>
        <p className="mt-1 text-sm text-muted">マスタデータ管理モジュール</p>
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
            <p className="mt-2 text-sm text-muted leading-relaxed">
              {mod.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
