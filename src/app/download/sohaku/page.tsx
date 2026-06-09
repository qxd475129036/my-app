"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/app/components/PageHeader";
import { DataTable, Column } from "@/app/components/DataTable";
import { SearchInput } from "@/app/components/SearchInput";
import { FilterSelect } from "@/app/components/FilterSelect";
import { StatusBadge } from "@/app/components/StatusBadge";

interface SohakuRecord {
  id: string;
  orderNo: string;
  storeName: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  deliveryDate: string;
  deliveryAddress: string;
  status: string;
}

const storeNames = ["東京旗舰店", "大阪中心店", "名古屋百货店", "福岡站前店", "札幌大通店"];
const productNames = ["季節限定蛋糕A", "经典巧克力蛋糕", "水果奶油蛋糕B", "抹茶千层蛋糕", "草莓奶油蛋糕"];
const addresses = [
  "東京都千代田区皇居前1-1", "大阪市北区梅田1-1", "名古屋市中区栄1-1",
  "福岡市博多区博多駅前1-1", "札幌市中央区大通西1-1",
];
const statuses = ["配送待", "配送中", "配送済", "配送失敗"];

const generateData = (): SohakuRecord[] => {
  const records: SohakuRecord[] = [];
  for (let i = 1; i <= 300; i++) {
    const qty = ((i * 23 + 7) % 50) + 5;
    const unit = (((i * 67 + 200) % 3000) + 300) * 10;
    records.push({
      id: `SH${String(i).padStart(5, "0")}`,
      orderNo: `ORD${String(i).padStart(7, "0")}`,
      storeName: storeNames[i % storeNames.length],
      productName: productNames[i % productNames.length],
      quantity: qty,
      unitPrice: unit,
      totalAmount: qty * unit,
      deliveryDate: `2024-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`,
      deliveryAddress: addresses[i % addresses.length],
      status: statuses[i % statuses.length],
    });
  }
  return records;
};

const statusVariant = (s: string): "success" | "warning" | "danger" | "info" | "default" => {
  if (s === "配送済") return "success";
  if (s === "配送中") return "info";
  if (s === "配送待") return "warning";
  if (s === "配送失敗") return "danger";
  return "default";
};

const formatPrice = (n: number) => "¥" + n.toLocaleString();

export default function SohakuDownloadPage() {
  const { status: authStatus } = useSession();
  const router = useRouter();
  useMemo(() => { if (authStatus === "unauthenticated") router.push("/login"); }, [authStatus, router]);

  const [data] = useState<SohakuRecord[]>(generateData);
  const [search, setSearch] = useState({ orderNo: "", storeName: "", productName: "", status: "" });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const filtered = useMemo(() => {
    return data.filter((r) => {
      if (search.orderNo && !r.orderNo.includes(search.orderNo)) return false;
      if (search.storeName && !r.storeName.includes(search.storeName)) return false;
      if (search.productName && !r.productName.includes(search.productName)) return false;
      if (search.status && r.status !== search.status) return false;
      return true;
    });
  }, [data, search]);

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

  const columns: Column<SohakuRecord>[] = [
    { key: "orderNo", label: "注文番号" },
    { key: "storeName", label: "店铺" },
    { key: "productName", label: "商品名" },
    { key: "quantity", label: "数量", align: "right" },
    { key: "totalAmount", label: "金額", align: "right", render: (r) => <span className="font-medium">{formatPrice(r.totalAmount)}</span> },
    { key: "deliveryDate", label: "配送日" },
    { key: "status", label: "状態", render: (r) => <StatusBadge label={r.status} variant={statusVariant(r.status)} /> },
  ];

  return (
    <div className="w-full px-8 py-8">
      <PageHeader
        title="配送明細ダウンロード"
        description="配送データの検索とダウンロード。"
        actions={
          <button onClick={() => alert("CSV出力を開始します")} className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            CSV出力
          </button>
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
        <SearchInput value={search.orderNo} onChange={(v) => { setSearch((s) => ({ ...s, orderNo: v })); setCurrentPage(1); }} placeholder="注文番号" className="w-40" />
        <SearchInput value={search.storeName} onChange={(v) => { setSearch((s) => ({ ...s, storeName: v })); setCurrentPage(1); }} placeholder="店铺名" className="w-40" />
        <SearchInput value={search.productName} onChange={(v) => { setSearch((s) => ({ ...s, productName: v })); setCurrentPage(1); }} placeholder="商品名" className="w-40" />
        <FilterSelect value={search.status} onChange={(v) => { setSearch((s) => ({ ...s, status: v })); setCurrentPage(1); }} options={statuses.map((s) => ({ value: s, label: s }))} placeholder="状態" />
      </div>

      <DataTable
        columns={columns}
        data={pagedData}
        keyExtractor={(r) => r.id}
        pageSize={pageSize}
        currentPage={currentPage}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }}
        emptyMessage="該当する配送データがありません"
      />
    </div>
  );
}
