"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/app/components/PageHeader";
import { DataTable, Column } from "@/app/components/DataTable";
import { SearchInput } from "@/app/components/SearchInput";
import { FilterSelect } from "@/app/components/FilterSelect";
import { Modal } from "@/app/components/Modal";
import { ActionBar } from "@/app/components/ActionBar";
import { StatusBadge } from "@/app/components/StatusBadge";

interface RefundRecord {
  id: string;
  refundNo: string;
  orderNo: string;
  storeName: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  refundAmount: number;
  refundDate: string;
  reason: string;
  status: "申請中" | "審査中" | "承認済" | "拒否" | "完了";
}

const storeNames = ["東京旗舰店", "大阪中心店", "名古屋百货店", "福岡站前店", "札幌大通店"];
const productNames = ["季節限定蛋糕A", "经典巧克力蛋糕", "水果奶油蛋糕B", "抹茶千层蛋糕", "草莓奶油蛋糕"];
const reasons = ["商品破損", "品質問題", "サイズ不一致", "色違い", "その他"];
const statuses: RefundRecord["status"][] = ["申請中", "審査中", "承認済", "拒否", "完了"];

const generateData = (): RefundRecord[] => {
  const records: RefundRecord[] = [];
  for (let i = 1; i <= 150; i++) {
    const qty = ((i * 17 + 3) % 10) + 1;
    const unit = (((i * 73 + 500) % 5000) + 500) * 10;
    records.push({
      id: `RF${String(i).padStart(5, "0")}`,
      refundNo: `RFN${String(i).padStart(7, "0")}`,
      orderNo: `ORD${String(i).padStart(7, "0")}`,
      storeName: storeNames[i % storeNames.length],
      productName: productNames[i % productNames.length],
      quantity: qty,
      unitPrice: unit,
      refundAmount: qty * unit,
      refundDate: `2024-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`,
      reason: reasons[i % reasons.length],
      status: statuses[i % statuses.length],
    });
  }
  return records;
};

const statusVariant = (s: string): "success" | "warning" | "danger" | "info" | "default" => {
  if (s === "完了" || s === "承認済") return "success";
  if (s === "申請中") return "warning";
  if (s === "審査中") return "info";
  if (s === "拒否") return "danger";
  return "default";
};

const formatPrice = (n: number) => "¥" + n.toLocaleString();

const statusFilterOptions = statuses.map((s) => ({ value: s, label: s }));
const reasonOptions = reasons.map((r) => ({ value: r, label: r }));

export default function RefundListPage() {
  const { status: authStatus } = useSession();
  const router = useRouter();
  useMemo(() => { if (authStatus === "unauthenticated") router.push("/login"); }, [authStatus, router]);

  const [data] = useState<RefundRecord[]>(generateData);
  const [search, setSearch] = useState({ refundNo: "", storeName: "", reason: "", status: "" });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"approve" | "reject">("approve");

  // Stats
  const stats = useMemo(() => {
    return {
      total: data.length,
      pending: data.filter((r) => r.status === "申請中" || r.status === "審査中").length,
      approved: data.filter((r) => r.status === "承認済" || r.status === "完了").length,
      totalAmount: data.reduce((s, r) => s + r.refundAmount, 0),
    };
  }, [data]);

  const filtered = useMemo(() => {
    return data.filter((r) => {
      if (search.refundNo && !r.refundNo.includes(search.refundNo)) return false;
      if (search.storeName && !r.storeName.includes(search.storeName)) return false;
      if (search.reason && r.reason !== search.reason) return false;
      if (search.status && r.status !== search.status) return false;
      return true;
    });
  }, [data, search]);

  const totalItems = filtered.length;
  const pagedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const confirmBatch = () => {
    setSelectedIds(new Set());
    setModalOpen(false);
  };

  const columns: Column<RefundRecord>[] = [
    { key: "refundNo", label: "退款番号" },
    { key: "orderNo", label: "注文番号" },
    { key: "storeName", label: "店铺" },
    { key: "productName", label: "商品名" },
    { key: "quantity", label: "数量", align: "right" },
    { key: "refundAmount", label: "金額", align: "right", render: (r) => <span className="font-medium">{formatPrice(r.refundAmount)}</span> },
    { key: "reason", label: "理由" },
    { key: "status", label: "状態", render: (r) => <StatusBadge label={r.status} variant={statusVariant(r.status)} /> },
  ];

  return (
    <div className="w-full px-8 py-8">
      <PageHeader title="退款記録管理" description="退款申請の確認と一括処理。" />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl border border-card-border bg-card p-4 text-center">
          <div className="text-xs font-medium text-muted uppercase tracking-wide">総件数</div>
          <div className="mt-1 text-2xl font-bold text-foreground">{stats.total}</div>
        </div>
        <div className="rounded-xl border border-card-border bg-card p-4 text-center">
          <div className="text-xs font-medium text-muted uppercase tracking-wide">未処理</div>
          <div className="mt-1 text-2xl font-bold text-warning">{stats.pending}</div>
        </div>
        <div className="rounded-xl border border-card-border bg-card p-4 text-center">
          <div className="text-xs font-medium text-muted uppercase tracking-wide">処理済</div>
          <div className="mt-1 text-2xl font-bold text-success">{stats.approved}</div>
        </div>
        <div className="rounded-xl border border-card-border bg-card p-4 text-center">
          <div className="text-xs font-medium text-muted uppercase tracking-wide">総金額</div>
          <div className="mt-1 text-2xl font-bold text-foreground">{formatPrice(stats.totalAmount)}</div>
        </div>
      </div>

      <ActionBar
        selectedCount={selectedIds.size}
        onClearSelection={() => setSelectedIds(new Set())}
        actions={[
          { label: "承認", onClick: () => { setModalAction("approve"); setModalOpen(true); } },
          { label: "拒否", onClick: () => { setModalAction("reject"); setModalOpen(true); }, variant: "danger" },
        ]}
      />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <SearchInput value={search.refundNo} onChange={(v) => { setSearch((s) => ({ ...s, refundNo: v })); setCurrentPage(1); }} placeholder="退款番号" className="w-40" />
        <SearchInput value={search.storeName} onChange={(v) => { setSearch((s) => ({ ...s, storeName: v })); setCurrentPage(1); }} placeholder="店铺名" className="w-40" />
        <FilterSelect value={search.reason} onChange={(v) => { setSearch((s) => ({ ...s, reason: v })); setCurrentPage(1); }} options={reasonOptions} placeholder="理由" />
        <FilterSelect value={search.status} onChange={(v) => { setSearch((s) => ({ ...s, status: v })); setCurrentPage(1); }} options={statusFilterOptions} placeholder="状態" />
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
        emptyMessage="該当する退款記録がありません"
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalAction === "approve" ? "承認確認" : "拒否確認"}>
        <div className="space-y-4">
          <p className="text-sm text-muted">{selectedIds.size}件の退款申請を{modalAction === "approve" ? "承認" : "拒否"}します。よろしいですか？</p>
          <div className="flex justify-end gap-2">
            <button onClick={() => setModalOpen(false)} className="rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-gray-50 transition-colors">取消</button>
            <button onClick={confirmBatch} className={`rounded-lg px-4 py-2 text-sm text-white transition-colors ${modalAction === "approve" ? "bg-accent hover:bg-accent-hover" : "bg-danger hover:bg-red-700"}`}>実行</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
