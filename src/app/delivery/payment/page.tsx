"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/app/components/PageHeader";
import { DataTable, Column } from "@/app/components/DataTable";
import { SearchInput } from "@/app/components/SearchInput";
import { FilterSelect } from "@/app/components/FilterSelect";
import { Modal } from "@/app/components/Modal";
import { StatusBadge } from "@/app/components/StatusBadge";

interface PaymentRecord {
  id: string;
  paymentNumber: string;
  orderNumber: string;
  storeName: string;
  amount: number;
  paymentMethod: "cash" | "bank" | "credit";
  status: "completed" | "pending" | "cancelled";
  withdrawalDate: string;
  createdAt: string;
}

const MOCK_DATA: PaymentRecord[] = [
  { id: "PM001", paymentNumber: "PAY-2024-001", orderNumber: "ORD-2024-001", storeName: "東京旗舰店", amount: 15000, paymentMethod: "cash", status: "completed", withdrawalDate: "2024-04-03", createdAt: "2024-04-01" },
  { id: "PM002", paymentNumber: "PAY-2024-002", orderNumber: "ORD-2024-002", storeName: "大阪中心店", amount: 25000, paymentMethod: "bank", status: "pending", withdrawalDate: "2024-04-05", createdAt: "2024-04-02" },
  { id: "PM003", paymentNumber: "PAY-2024-003", orderNumber: "ORD-2024-003", storeName: "東京旗舰店", amount: 18000, paymentMethod: "credit", status: "completed", withdrawalDate: "2024-04-04", createdAt: "2024-04-03" },
  { id: "PM004", paymentNumber: "PAY-2024-004", orderNumber: "ORD-2024-004", storeName: "名古屋百货店", amount: 12000, paymentMethod: "bank", status: "pending", withdrawalDate: "2024-04-06", createdAt: "2024-03-28" },
  { id: "PM005", paymentNumber: "PAY-2024-005", orderNumber: "ORD-2024-005", storeName: "福岡站前店", amount: 8000, paymentMethod: "cash", status: "cancelled", withdrawalDate: "2024-03-30", createdAt: "2024-03-25" },
  { id: "PM006", paymentNumber: "PAY-2024-006", orderNumber: "ORD-2024-006", storeName: "横浜港店", amount: 9500, paymentMethod: "credit", status: "completed", withdrawalDate: "2024-04-06", createdAt: "2024-04-05" },
  { id: "PM007", paymentNumber: "PAY-2024-007", orderNumber: "ORD-2024-007", storeName: "札幌中心店", amount: 20000, paymentMethod: "bank", status: "pending", withdrawalDate: "2024-04-08", createdAt: "2024-04-06" },
  { id: "PM008", paymentNumber: "PAY-2024-008", orderNumber: "ORD-2024-008", storeName: "大阪中心店", amount: 5500, paymentMethod: "cash", status: "completed", withdrawalDate: "2024-04-02", createdAt: "2024-03-29" },
];

const statusLabel: Record<string, string> = { completed: "完了", pending: "保留中", cancelled: "取消" };
const statusVariant = (s: string): "success" | "warning" | "danger" => {
  if (s === "completed") return "success";
  if (s === "pending") return "warning";
  return "danger";
};

const methodLabel: Record<string, string> = { cash: "現金", bank: "銀行振込", credit: "クレジット" };
const methodColor: Record<string, string> = {
  cash: "bg-emerald-50 text-emerald-700",
  bank: "bg-purple-50 text-purple-700",
  credit: "bg-cyan-50 text-cyan-700",
};

const formatPrice = (n: number) => "¥" + n.toLocaleString();

export default function PaymentPage() {
  const { status: authStatus } = useSession();
  const router = useRouter();
  useMemo(() => { if (authStatus === "unauthenticated") router.push("/login"); }, [authStatus, router]);

  const [data] = useState<PaymentRecord[]>(MOCK_DATA);
  const [search, setSearch] = useState({ storeName: "", paymentMethod: "", status: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailRow, setDetailRow] = useState<PaymentRecord | null>(null);

  // Stats
  const stats = useMemo(() => {
    const total = data.reduce((s, r) => s + r.amount, 0);
    const pending = data.filter((r) => r.status === "pending").reduce((s, r) => s + r.amount, 0);
    const completed = data.filter((r) => r.status === "completed").reduce((s, r) => s + r.amount, 0);
    return { total, pending, completed };
  }, [data]);

  const filtered = useMemo(() => {
    return data.filter((r) => {
      if (search.storeName && !r.storeName.includes(search.storeName)) return false;
      if (search.paymentMethod && r.paymentMethod !== search.paymentMethod) return false;
      if (search.status && r.status !== search.status) return false;
      return true;
    });
  }, [data, search]);

  const totalItems = filtered.length;
  const pagedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const columns: Column<PaymentRecord>[] = [
    { key: "paymentNumber", label: "出金番号" },
    { key: "orderNumber", label: "注文番号" },
    { key: "storeName", label: "店铺" },
    { key: "amount", label: "金額", align: "right", render: (r) => <span className="font-medium">{formatPrice(r.amount)}</span> },
    {
      key: "paymentMethod", label: "支払方法",
      render: (r) => <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${methodColor[r.paymentMethod]}`}>{methodLabel[r.paymentMethod]}</span>,
    },
    { key: "withdrawalDate", label: "出金日" },
    { key: "status", label: "状態", render: (r) => <StatusBadge label={statusLabel[r.status]} variant={statusVariant(r.status)} /> },
    {
      key: "actions", label: "操作",
      render: (r) => <button onClick={() => { setDetailRow(r); setDetailModalOpen(true); }} className="text-accent hover:text-accent-hover text-xs font-medium">詳細</button>,
    },
  ];

  return (
    <div className="w-full px-8 py-8">
      <PageHeader title="出金管理" description="出金記録の管理とステータス追跡。" />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-card-border bg-card p-4 text-center">
          <div className="text-xs font-medium text-muted uppercase tracking-wide">総出金額</div>
          <div className="mt-1 text-2xl font-bold text-foreground">{formatPrice(stats.total)}</div>
        </div>
        <div className="rounded-xl border border-card-border bg-card p-4 text-center">
          <div className="text-xs font-medium text-muted uppercase tracking-wide">完了済</div>
          <div className="mt-1 text-2xl font-bold text-success">{formatPrice(stats.completed)}</div>
        </div>
        <div className="rounded-xl border border-card-border bg-card p-4 text-center">
          <div className="text-xs font-medium text-muted uppercase tracking-wide">保留中</div>
          <div className="mt-1 text-2xl font-bold text-warning">{formatPrice(stats.pending)}</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <SearchInput value={search.storeName} onChange={(v) => { setSearch((s) => ({ ...s, storeName: v })); setCurrentPage(1); }} placeholder="店铺名" className="w-44" />
        <FilterSelect value={search.paymentMethod} onChange={(v) => { setSearch((s) => ({ ...s, paymentMethod: v })); setCurrentPage(1); }} options={[{ value: "cash", label: "現金" }, { value: "bank", label: "銀行振込" }, { value: "credit", label: "クレジット" }]} placeholder="支払方法" />
        <FilterSelect value={search.status} onChange={(v) => { setSearch((s) => ({ ...s, status: v })); setCurrentPage(1); }} options={Object.entries(statusLabel).map(([k, v]) => ({ value: k, label: v }))} placeholder="状態" />
      </div>

      <DataTable
        columns={columns}
        data={pagedData}
        keyExtractor={(r) => r.id}
        selectable
        selectedIds={new Set()}
        onSelectionChange={() => {}}
        pageSize={pageSize}
        currentPage={currentPage}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }}
        emptyMessage="該当する出金記録がありません"
      />

      {detailRow && (
        <Modal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} title={`出金詳細 - ${detailRow.paymentNumber}`}>
          <div className="space-y-3 text-sm">
            {[
              ["出金番号", detailRow.paymentNumber],
              ["注文番号", detailRow.orderNumber],
              ["店铺", detailRow.storeName],
              ["金額", formatPrice(detailRow.amount)],
              ["支払方法", methodLabel[detailRow.paymentMethod]],
              ["状態", statusLabel[detailRow.status]],
              ["出金日", detailRow.withdrawalDate],
              ["作成日", detailRow.createdAt],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between border-b border-border pb-2 last:border-0">
                <span className="text-muted">{label}</span>
                <span className="font-medium text-foreground">{value}</span>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
