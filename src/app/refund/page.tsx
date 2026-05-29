import Link from "next/link";

const modules = [
  {
    title: "退款CD管理",
    description: "退款コード定義管理。新規、編集、削除、インポート/エクスポート。",
    href: "/refund/cd",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: "退款記録管理",
    description: "退款記録の確認。一括承認、拒否、ステータス更新、CSV出力。",
    href: "/refund/list",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21v-6m-6 6v-6m-6 6v-6M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
];

export default function RefundPage() {
  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">退款業務</h1>
        <p className="mt-1 text-sm text-muted">退款関連業務モジュール</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
