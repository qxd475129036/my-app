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

interface BulkAdjustRecord {
  id: string;
  adjustmentNo: string;
  storeCd: string;
  storeName: string;
  productName: string;
  cdCode: string;
  oldPrice: number;
  newPrice: number;
  priceChange: number;
  reason: string;
  requestedBy: string;
  requestDate: string;
  status: "pending" | "processing" | "approved" | "rejected";
}

const MOCK_DATA: BulkAdjustRecord[] = [
  { id: "BA001", adjustmentNo: "ADJ-2024-001", storeCd: "STORE001", storeName: "東京旗舰店", productName: "季節限定蛋糕A", cdCode: "PROD001", oldPrice: 1500, newPrice: 1800, priceChange: 300, reason: "原材料成本上涨", requestedBy: "田中一郎", requestDate: "2024-04-01", status: "approved" },
  { id: "BA002", adjustmentNo: "ADJ-2024-002", storeCd: "STORE002", storeName: "大阪中心店", productName: "经典巧克力蛋糕", cdCode: "PROD002", oldPrice: 2000, newPrice: 1800, priceChange: -200, reason: "促销活动需要", requestedBy: "山花太郎", requestDate: "2024-04-03", status: "pending" },
  { id: "BA003", adjustmentNo: "ADJ-2024-003", storeCd: "STORE001", storeName: "東京旗舰店", productName: "水果奶油蛋糕B", cdCode: "PROD003", oldPrice: 1200, newPrice: 1350, priceChange: 150, reason: "配方升级", requestedBy: "鈴木花子", requestDate: "2024-04-05", status: "processing" },
  { id: "BA004", adjustmentNo: "ADJ-2024-004", storeCd: "STORE003", storeName: "名古屋百货店", productName: "抹茶千层蛋糕", cdCode: "PROD004", oldPrice: 1800, newPrice: 2100, priceChange: 300, reason: "高级抹茶使用", requestedBy: "伊藤健二", requestDate: "2024-04-06", status: "rejected" },
  { id: "BA005", adjustmentNo: "ADJ-2024-005", storeCd: "STORE004", storeName: "福岡站前店", productName: "草莓奶油蛋糕", cdCode: "PROD005", oldPrice: 1600, newPrice: 1600, priceChange: 0, reason: "价格调整无效申请", requestedBy: "渡边美咲", requestDate: "2024-04-08", status: "pending" },
  { id: "BA006", adjustmentNo: "ADJ-2024-006", storeCd: "STORE005", storeName: "札幌中心店", productName: "北海道牛奶布丁", cdCode: "PROD006", oldPrice: 800, newPrice: 1000, priceChange: 200, reason: "新包装導入", requestedBy: "小林直樹", requestDate: "2024-04-10", status: "pending" },
  { id: "BA007", adjustmentNo: "ADJ-2024-007", storeCd: "STORE002", storeName: "大阪中心店", productName: "抹茶拿鐵", cdCode: "PROD007", oldPrice: 500, newPrice: 450, priceChange: -50, reason: "材料費削減", requestedBy: "山花太郎", requestDate: "2024-03-28", status: "approved" },
  { id: "BA008", adjustmentNo: "ADJ-2024-008", storeCd: "STORE006", storeName: "横浜港店", productName: "期間限定泡芙", cdCode: "PROD008", oldPrice: 600, newPrice: 750, priceChange: 150, reason: "期間終了セール", requestedBy: "加藤愛", requestDate: "2024-04-02", status: "processing" },
];

const statusLabel: Record<string, string> = { pending: "保留", processing: "処理中", approved: "承認済", rejected: "拒否" };
const statusVariant = (s: string): "success" | "warning" | "danger" | "info" | "default" => {
  if (s === "approved") return "success";
  if (s === "pending") return "warning";
  if (s === "processing") return "info";
  if (s === "rejected") return "danger";
  return "default";
};

const formatPrice = (n: number) => "¥" + n.toLocaleString();

export default function BulkAdjustPage() {
  const { status: authStatus } = useSession();
  const router = useRouter();

  useMemo(() => { if (authStatus === "unauthenticated") router.push("/login"); }, [authStatus, router]);

  const [data, setData] = useState<BulkAdjustRecord[]>(MOCK_DATA);
  const [search, setSearch] = useState({ storeName: "", productName: "", status: "" });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"approve" | "reject">("approve");

  const filtered = useMemo(() => {
    return data.filter((r) => {
      if (search.storeName && !r.storeName.includes(search.storeName)) return false;
      if (search.productName && !r.productName.includes(search.productName)) return false;
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
    const newStatus = modalAction === "approve" ? "approved" : "rejected";
    setData((prev) => prev.map((r) => (selectedIds.has(r.id) ? { ...r, status: newStatus as BulkAdjustRecord["status"] } : r)));
    setSelectedIds(new Set());
    setModalOpen(false);
  };

  const columns: Column<BulkAdjustRecord>[] = [
    { key: "adjustmentNo", label: "修正番号" },
    { key: "storeName", label: "店铺名" },
    { key: "productName", label: "商品名" },
    { key: "oldPrice", label: "旧価格", align: "right", render: (r) => formatPrice(r.oldPrice) },
    { key: "newPrice", label: "新価格", align: "right", render: (r) => <span className="font-semibold text-accent">{formatPrice(r.newPrice)}</span> },
    {
      key: "priceChange", label: "差額", align: "right",
      render: (r) => {
        const c = r.priceChange;
        return <span className={c > 0 ? "text-danger" : c < 0 ? "text-success" : "text-muted"}>{c > 0 ? "+" : ""}{c.toLocaleString()}</span>;
      },
    },
    { key: "reason", label: "理由" },
    { key: "requestedBy", label: "申請者" },
    {
      key: "status", label: "状態",
      render: (r) => <StatusBadge label={statusLabel[r.status]} variant={statusVariant(r.status)} />,
    },
  ];

  return (
    <div className="w-full px-8 py-8">
      <PageHeader title="一括価格修正" description="価格の一括修正申請を管理します。" />

      <ActionBar
        selectedCount={selectedIds.size}
        onClearSelection={() => setSelectedIds(new Set())}
        actions={[
          { label: "承認", onClick: () => { setModalAction("approve"); setModalOpen(true); } },
          { label: "拒否", onClick: () => { setModalAction("reject"); setModalOpen(true); }, variant: "danger" },
        ]}
      />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <SearchInput value={search.storeName} onChange={(v) => { setSearch((s) => ({ ...s, storeName: v })); setCurrentPage(1); }} placeholder="店铺名" className="w-44" />
        <SearchInput value={search.productName} onChange={(v) => { setSearch((s) => ({ ...s, productName: v })); setCurrentPage(1); }} placeholder="商品名" className="w-44" />
        <FilterSelect value={search.status} onChange={(v) => { setSearch((s) => ({ ...s, status: v })); setCurrentPage(1); }} options={Object.entries(statusLabel).map(([k, v]) => ({ value: k, label: v }))} placeholder="状態" />
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
        emptyMessage="該当する価格修正申請がありません"
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalAction === "approve" ? "承認確認" : "拒否確認"}>
        <div className="space-y-4">
          <p className="text-sm text-muted">{selectedIds.size}件の申請を{modalAction === "approve" ? "承認" : "拒否"}します。よろしいですか？</p>
          <div className="flex justify-end gap-2">
            <button onClick={() => setModalOpen(false)} className="rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-gray-50 transition-colors">取消</button>
            <button onClick={confirmBatch} className={`rounded-lg px-4 py-2 text-sm text-white transition-colors ${modalAction === "approve" ? "bg-accent hover:bg-accent-hover" : "bg-danger hover:bg-red-700"}`}>実行</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
