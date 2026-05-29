"use client";

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize);
  const showAll = pageSize >= totalItems;

  const startItem = showAll ? 1 : (currentPage - 1) * pageSize + 1;
  const endItem = showAll ? totalItems : Math.min(currentPage * pageSize, totalItems);

  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      if (start > 2) pages.push("...");
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const pageSizeOptions = [10, 50];

  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-3">
      <div className="flex items-center gap-4">
        <span className="text-xs text-muted">
          {startItem}-{endItem} / {totalItems}件
        </span>
        {onPageSizeChange && (
          <select
            value={showAll ? totalItems : pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded border border-border px-2 py-1 text-xs text-foreground bg-white focus:outline-none focus:ring-1 focus:ring-accent"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}件/ページ
              </option>
            ))}
            <option value={totalItems}>すべて表示</option>
          </select>
        )}
      </div>
      {!showAll && totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded px-2 py-1 text-xs text-muted hover:text-foreground hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            前へ
          </button>
          {getPageNumbers().map((page, i) =>
            page === "..." ? (
              <span key={`ellipsis-${i}`} className="px-1 text-xs text-muted">
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                className={`min-w-[28px] rounded px-1.5 py-1 text-xs font-medium transition-colors ${
                  page === currentPage
                    ? "bg-accent text-white"
                    : "text-muted hover:text-foreground hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            )
          )}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded px-2 py-1 text-xs text-muted hover:text-foreground hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            次へ
          </button>
        </div>
      )}
    </div>
  );
}
