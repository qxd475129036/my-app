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

interface CorrectionRecord {
  id: string;
  itemName: string;
  storeName: string;
  oldPrice: number;
  newPrice: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
}

const mockRecords: CorrectionRecord[] = [
  { id: "COR001", itemName: "商品A", storeName: "店舗A", oldPrice: 1000, newPrice: 1200, reason: "原材料高騰", status: "pending" },
  { id: "COR002", itemName: "商品B", storeName: "店舗B", oldPrice: 2000, newPrice: 1800, reason: "競合対策", status: "approved" },
  { id: "COR003", itemName: "商品C", storeName: "店舗A", oldPrice: 1500, newPrice: 1600, reason: "品質向上", status: "rejected" },
  { id: "COR004", itemName: "商品D", storeName: "店舗C", oldPrice: 3000, newPrice: 3500, reason: "仕入先変更", status: "pending" },
  { id: "COR005", itemName: "商品E", storeName: "店舗B", oldPrice: 2500, newPrice: 2200, reason: "販売促進", status: "approved" },
];

const statusLabel: Record<string, string> = { pending: "保留", approved: "承認済", rejected: "拒否" };
const statusVariant = (s: string): "success" | "warning" | "danger" => {
  if (s === "approved") return "success";
  if (s === "pending") return "warning";
  return "danger";
};

const formatPrice = (n: number) => "¥" + n.toLocaleString();

export default function CorrectionPage() {
  const { status: authStatus } = useSession();
  const router = useRouter();
  useMemo(() => { if (authStatus === "unauthenticated") router.push("/login"); }, [authStatus, router]);

  const [records, setRecords] = useState<CorrectionRecord[]>(mockRecords);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editing, setEditing] = useState<CorrectionRecord | null>(null);
  const [formData, setFormData] = useState({ itemName: "", storeName: "", oldPrice: 0, newPrice: 0, reason: "" });

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchesFilter = !filter || r.itemName.includes(filter) || r.storeName.includes(filter) || r.id.includes(filter);
      const matchesStatus = !statusFilter || r.status === statusFilter;
      return matchesFilter && matchesStatus;
    });
  }, [records, filter, statusFilter]);

  const openEdit = (r: CorrectionRecord) => {
    setEditing(r);
    setFormData({ itemName: r.itemName, storeName: r.storeName, oldPrice: r.oldPrice, newPrice: r.newPrice, reason: r.reason });
    setEditModalOpen(true);
  };

  const handleBatchApprove = () => {
    setRecords((prev) => prev.map((r) => (selectedIds.has(r.id) ? { ...r, status: "approved" } : r)));
    setSelectedIds(new Set());
  };

  const handleBatchReject = () => {
    setRecords((prev) => prev.map((r) => (selectedIds.has(r.id) ? { ...r, status: "rejected" } : r)));
    setSelectedIds(new Set());
  };

  const columns: Column<CorrectionRecord>[] = [
    { key: "id", label: "ID", width: "80px" },
    { key: "itemName", label: "商品名" },
    { key: "storeName", label: "店铺", width: "100px" },
    { key: "oldPrice", label: "旧価格", width: "100px", align: "right", render: (r) => formatPrice(r.oldPrice) },
    { key: "newPrice", label: "新価格", width: "100px", align: "right", render: (r) => <span className="font-semibold text-accent">{formatPrice(r.newPrice)}</span> },
    {
      key: "diff", label: "差分", width: "80px", align: "right",
      render: (r) => {
        const diff = r.newPrice - r.oldPrice;
        return <span className={diff > 0 ? "text-danger font-medium" : diff < 0 ? "text-success font-medium" : "text-muted"}>{diff > 0 ? "+" : ""}{diff.toLocaleString()}</span>;
      },
    },
    { key: "reason", label: "理由", width: "120px" },
    { key: "status", label: "状態", width: "80px", render: (r) => <StatusBadge label={statusLabel[r.status]} variant={statusVariant(r.status)} /> },
    {
      key: "actions", label: "操作", width: "60px",
      render: (r) => <button onClick={() => openEdit(r)} className="text-accent hover:text-accent-hover text-xs font-medium">編集</button>,
    },
  ];

  return (
    <div className="w-full px-8 py-8">
      <PageHeader title="明細修正" description="価格修正履歴の管理と一括承認。" />

      <ActionBar
        selectedCount={selectedIds.size}
        onClearSelection={() => setSelectedIds(new Set())}
        actions={[
          { label: "承認", onClick: handleBatchApprove },
          { label: "拒否", onClick: handleBatchReject, variant: "danger" },
        ]}
      />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <SearchInput value={filter} onChange={(v) => setFilter(v)} placeholder="ID/商品名/店铺名" className="w-64" />
        <FilterSelect value={statusFilter} onChange={setStatusFilter} options={[{ value: "pending", label: "保留" }, { value: "approved", label: "承認済" }, { value: "rejected", label: "拒否" }]} placeholder="状態" />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(r) => r.id}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        pageSize={10}
        currentPage={1}
        totalItems={filtered.length}
        onPageChange={() => {}}
        emptyMessage="該当する修正記録がありません"
      />

      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="修正詳細" size="sm">
        <div className="space-y-3 text-sm">
          {[
            ["商品名", formData.itemName],
            ["店铺", formData.storeName],
            ["旧価格", formatPrice(formData.oldPrice)],
            ["新価格", formatPrice(formData.newPrice)],
            ["理由", formData.reason],
            ["状態", editing ? statusLabel[editing.status] : ""],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between border-b border-border pb-2 last:border-0">
              <span className="text-muted">{label}</span>
              <span className="font-medium text-foreground">{value}</span>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
