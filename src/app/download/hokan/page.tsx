"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/app/components/PageHeader";
import { DataTable, Column } from "@/app/components/DataTable";
import { SearchInput } from "@/app/components/SearchInput";
import { FilterSelect } from "@/app/components/FilterSelect";
import { StatusBadge } from "@/app/components/StatusBadge";

interface HokanRecord {
  id: string;
  storeName: string;
  productName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  holdingDate: string;
  status: string;
}

const storeNames = ["東京旗舰店", "大阪中心店", "名古屋百货店", "福岡站前店", "札幌大通店"];
const productNames = ["季節限定蛋糕A", "经典巧克力蛋糕", "水果奶油蛋糕B", "抹茶千层蛋糕", "草莓奶油蛋糕"];
const categories = ["ケーキ類", "パン類", "スイーツ類", "ギフト類"];
const statuses = ["保管中", "処理中", "出庫済", "異常"];

const generateData = (): HokanRecord[] => {
  const records: HokanRecord[] = [];
  for (let i = 1; i <= 200; i++) {
    const qty = Math.floor(Math.random() * 100) + 10;
    const unit = (Math.floor(Math.random() * 5000) + 500) * 10;
    records.push({
      id: `HK${String(i).padStart(5, "0")}`,
      storeName: storeNames[i % storeNames.length],
      productName: productNames[i % productNames.length],
      category: categories[i % categories.length],
      quantity: qty,
      unitPrice: unit,
      totalAmount: qty * unit,
      holdingDate: `2024-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`,
      status: statuses[i % statuses.length],
    });
  }
  return records;
};

const statusVariant = (s: string): "success" | "warning" | "danger" | "info" | "default" => {
  if (s === "保管中") return "info";
  if (s === "処理中") return "warning";
  if (s === "出庫済") return "success";
  if (s === "異常") return "danger";
  return "default";
};

const formatPrice = (n: number) => "¥" + n.toLocaleString();

export default function HokanDownloadPage() {
  const { status: authStatus } = useSession();
  const router = useRouter();
  useMemo(() => { if (authStatus === "unauthenticated") router.push("/login"); }, [authStatus, router]);

  const [data] = useState<HokanRecord[]>(generateData);
  const [search, setSearch] = useState({ storeName: "", productName: "", category: "", status: "" });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const filtered = useMemo(() => {
    return data.filter((r) => {
      if (search.storeName && !r.storeName.includes(search.storeName)) return false;
      if (search.productName && !r.productName.includes(search.productName)) return false;
      if (search.category && r.category !== search.category) return false;
      if (search.status && r.status !== search.status) return false;
      return true;
    });
  }, [data, search]);

  // Stats
  const stats = useMemo(() => ({
    total: filtered.length,
    totalAmount: filtered.reduce((s, r) => s + r.totalAmount, 0),
    totalQty: filtered.reduce((s, r) => s + r.quantity, 0),
  }), [filtered]);

  const totalItems = filtered.length;
  const pagedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const handleDownload = () => {
    alert(`${selectedIds.size}件のデータをダウンロードします。`);
  };

  const columns: Column<HokanRecord>[] = [
    { key: "storeName", label: "店铺", width: "120px" },
    { key: "productName", label: "商品名" },
    { key: "category", label: "カテゴリ", width: "90px" },
    { key: "quantity", label: "数量", width: "70px", align: "right" },
    { key: "totalAmount", label: "金額", width: "120px", align: "right", render: (r) => <span className="font-medium">{formatPrice(r.totalAmount)}</span> },
    { key: "holdingDate", label: "保管日", width: "100px" },
    { key: "status", label: "状態", width: "80px", render: (r) => <StatusBadge label={r.status} variant={statusVariant(r.status)} /> },
  ];

  return (
    <div className="w-full px-8 py-8">
      <PageHeader
        title="保管明細ダウンロード"
        description="保管データの検索とダウンロード。"
        actions={
          selectedIds.size > 0 ? (
            <button onClick={handleDownload} className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              {selectedIds.size}件DL
            </button>
          ) : (
            <button onClick={() => alert("全データをCSV出力します")} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-foreground hover:bg-gray-50 transition-colors">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              CSV出力
            </button>
          )
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-card-border bg-card p-4 text-center">
          <div className="text-xs font-medium text-muted uppercase tracking-wide">該当件数</div>
          <div className="mt-1 text-2xl font-bold text-foreground">{stats.total}</div>
        </div>
        <div className="rounded-xl border border-card-border bg-card p-4 text-center">
          <div className="text-xs font-medium text-muted uppercase tracking-wide">総数量</div>
          <div className="mt-1 text-2xl font-bold text-foreground">{stats.totalQty.toLocaleString()}</div>
        </div>
        <div className="rounded-xl border border-card-border bg-card p-4 text-center">
          <div className="text-xs font-medium text-muted uppercase tracking-wide">総金額</div>
          <div className="mt-1 text-2xl font-bold text-foreground">{formatPrice(stats.totalAmount)}</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <SearchInput value={search.storeName} onChange={(v) => { setSearch((s) => ({ ...s, storeName: v })); setCurrentPage(1); }} placeholder="店铺名" className="w-44" />
        <SearchInput value={search.productName} onChange={(v) => { setSearch((s) => ({ ...s, productName: v })); setCurrentPage(1); }} placeholder="商品名" className="w-44" />
        <FilterSelect value={search.category} onChange={(v) => { setSearch((s) => ({ ...s, category: v })); setCurrentPage(1); }} options={categories.map((c) => ({ value: c, label: c }))} placeholder="カテゴリ" />
        <FilterSelect value={search.status} onChange={(v) => { setSearch((s) => ({ ...s, status: v })); setCurrentPage(1); }} options={statuses.map((s) => ({ value: s, label: s }))} placeholder="状態" />
      </div>

      <DataTable
        columns={columns}
        data={pagedData}
        keyExtractor={(r) => r.id}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        pageSize={pageSize}
        currentPage={currentPage}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }}
        emptyMessage="該当する保管データがありません"
      />
    </div>
  );
}
