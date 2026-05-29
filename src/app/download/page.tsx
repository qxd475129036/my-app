import Link from "next/link";

const modules = [
  {
    title: "保管明細ダウンロード",
    description: "保管データのダウンロード。CSV/Excel出力、履歴管理。",
    href: "/download/hokan",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    title: "配送明細ダウンロード",
    description: "配送データのダウンロード。一括出力、履歴管理。",
    href: "/download/sohaku",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
  },
];

export default function DownloadPage() {
  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">明細ダウンロード</h1>
        <p className="mt-1 text-sm text-muted">明細データのダウンロードモジュール</p>
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
