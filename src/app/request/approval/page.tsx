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

interface ApprovalRecord {
  id: string;
  approvalNo: string;
  storeCd: string;
  storeName: string;
  approvalType: string;
  approvalTypeName: string;
  applicantName: string;
  targetName: string;
  amount: number;
  status: "pending" | "processing" | "approved" | "rejected" | "cancelled";
  reason: string;
  submittedDate: string;
  approvedDate?: string;
  approverName?: string;
}

const MOCK_DATA: ApprovalRecord[] = [
  { id: "AP001", approvalNo: "APV-2024-001", storeCd: "STORE001", storeName: "東京旗舰店", approvalType: "price_change", approvalTypeName: "価格変更", applicantName: "田中一郎", targetName: "季節限定蛋糕A", amount: 1500, status: "approved", reason: "原材料成本上涨", submittedDate: "2024-04-01", approvedDate: "2024-04-02", approverName: "佐藤次郎" },
  { id: "AP002", approvalNo: "APV-2024-002", storeCd: "STORE002", storeName: "大阪中心店", approvalType: "stock_increase", approvalTypeName: "在庫増加", applicantName: "山花太郎", targetName: "在庫商品補充", amount: 25000, status: "pending", reason: "黄金周促销活动准备", submittedDate: "2024-04-03" },
  { id: "AP003", approvalNo: "APV-2024-003", storeCd: "STORE001", storeName: "東京旗舰店", approvalType: "staff_schedule", approvalTypeName: "勤務調整", applicantName: "鈴木花子", targetName: "春季员工排班", amount: 0, status: "processing", reason: "新员工入职后的排班调整", submittedDate: "2024-04-04" },
  { id: "AP004", approvalNo: "APV-2024-004", storeCd: "STORE003", storeName: "名古屋百货店", approvalType: "discount_permission", approvalTypeName: "割引承認", applicantName: "伊藤健二", targetName: "VIP客户特别折扣", amount: 3000, status: "rejected", reason: "折扣幅度超出权限范围", submittedDate: "2024-04-05", approvedDate: "2024-04-06", approverName: "高橋雅子" },
  { id: "AP005", approvalNo: "APV-2024-005", storeCd: "STORE004", storeName: "福岡站前店", approvalType: "special_promotion", approvalTypeName: "特別販促", applicantName: "渡边美咲", targetName: "情人节特别活动", amount: 10000, status: "pending", reason: "情人节限定商品促销计划", submittedDate: "2024-04-06" },
  { id: "AP006", approvalNo: "APV-2024-006", storeCd: "STORE002", storeName: "大阪中心店", approvalType: "equipment_purchase", approvalTypeName: "設備購入", applicantName: "中村正树", targetName: "新烤箱采购", amount: 150000, status: "pending", reason: "旧设备老化需要更换", submittedDate: "2024-04-07" },
  { id: "AP007", approvalNo: "APV-2024-007", storeCd: "STORE001", storeName: "東京旗舰店", approvalType: "holiday_leave", approvalTypeName: "休暇申請", applicantName: "林美香", targetName: "連休请假", amount: 0, status: "cancelled", reason: "个人原因取消休假计划", submittedDate: "2024-04-02", approvedDate: "2024-04-03", approverName: "佐藤次郎" },
  { id: "AP008", approvalNo: "APV-2024-008", storeCd: "STORE005", storeName: "横浜港店", approvalType: "price_change", approvalTypeName: "価格変更", applicantName: "大野秀树", targetName: "抹茶系列产品", amount: 200, status: "approved", reason: "使用进口高级抹茶", submittedDate: "2024-04-08", approvedDate: "2024-04-08", approverName: "高橋雅子" },
];

const statusLabel: Record<string, string> = { pending: "待承認", processing: "承認中", approved: "承認済", rejected: "拒否", cancelled: "取消" };
const statusVariant = (s: string): "success" | "warning" | "danger" | "info" | "default" => {
  if (s === "approved") return "success";
  if (s === "rejected" || s === "cancelled") return "danger";
  if (s === "pending") return "warning";
  if (s === "processing") return "info";
  return "default";
};

const approvalTypeOptions = [
  { value: "price_change", label: "価格変更" },
  { value: "stock_increase", label: "在庫増加" },
  { value: "staff_schedule", label: "勤務調整" },
  { value: "discount_permission", label: "割引承認" },
  { value: "special_promotion", label: "特別販促" },
  { value: "equipment_purchase", label: "設備購入" },
  { value: "holiday_leave", label: "休暇申請" },
];

const formatPrice = (n: number) => "¥" + n.toLocaleString();

export default function ApprovalPage() {
  const { status: authStatus } = useSession();
  const router = useRouter();

  useMemo(() => { if (authStatus === "unauthenticated") router.push("/login"); }, [authStatus, router]);

  const [data, setData] = useState<ApprovalRecord[]>(MOCK_DATA);
  const [search, setSearch] = useState({ storeName: "", approvalType: "", status: "" });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"approve" | "reject">("approve");
  const [remark, setRemark] = useState("");

  const filtered = useMemo(() => {
    return data.filter((r) => {
      if (search.storeName && !r.storeName.includes(search.storeName)) return false;
      if (search.approvalType && r.approvalType !== search.approvalType) return false;
      if (search.status && r.status !== search.status) return false;
      return true;
    });
  }, [data, search]);

  // Summary stats
  const stats = useMemo(() => {
    return {
      pending: data.filter((r) => r.status === "pending" || r.status === "processing").length,
      approved: data.filter((r) => r.status === "approved").length,
      rejected: data.filter((r) => r.status === "rejected").length,
    };
  }, [data]);

  const totalItems = filtered.length;
  const pagedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const confirmBatch = () => {
    const newStatus = modalAction === "approve" ? "approved" : "rejected";
    setData((prev) => prev.map((r) => (selectedIds.has(r.id) ? { ...r, status: newStatus as ApprovalRecord["status"], approvedDate: new Date().toISOString().split("T")[0], approverName: "承認者" } : r)));
    setSelectedIds(new Set());
    setModalOpen(false);
  };

  const columns: Column<ApprovalRecord>[] = [
    { key: "approvalNo", label: "番号" },
    { key: "storeName", label: "店铺名" },
    {
      key: "approvalTypeName", label: "種類",
      render: (r) => <span className="inline-flex items-center rounded bg-accent-light text-accent px-2 py-0.5 text-xs font-medium">{r.approvalTypeName}</span>,
    },
    { key: "targetName", label: "対象" },
    { key: "applicantName", label: "申請者" },
    { key: "amount", label: "金額", align: "right", render: (r) => <span className="font-medium">{formatPrice(r.amount)}</span> },
    { key: "submittedDate", label: "申請日" },
    {
      key: "status", label: "状態",
      render: (r) => <StatusBadge label={statusLabel[r.status]} variant={statusVariant(r.status)} />,
    },
  ];

  return (
    <div className="w-full px-8 py-8">
      <PageHeader title="承認管理" description="承認ワークフローの管理を行います。" />

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-card-border bg-card p-4 text-center">
          <div className="text-xs font-medium text-muted uppercase tracking-wide">未処理</div>
          <div className="mt-1 text-2xl font-bold text-foreground">{stats.pending}</div>
        </div>
        <div className="rounded-xl border border-card-border bg-card p-4 text-center">
          <div className="text-xs font-medium text-muted uppercase tracking-wide">承認済</div>
          <div className="mt-1 text-2xl font-bold text-success">{stats.approved}</div>
        </div>
        <div className="rounded-xl border border-card-border bg-card p-4 text-center">
          <div className="text-xs font-medium text-muted uppercase tracking-wide">拒否</div>
          <div className="mt-1 text-2xl font-bold text-danger">{stats.rejected}</div>
        </div>
      </div>

      <ActionBar
        selectedCount={selectedIds.size}
        onClearSelection={() => setSelectedIds(new Set())}
        actions={[
          { label: "承認", onClick: () => { setModalAction("approve"); setRemark(""); setModalOpen(true); } },
          { label: "拒否", onClick: () => { setModalAction("reject"); setRemark(""); setModalOpen(true); }, variant: "danger" },
        ]}
      />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <SearchInput value={search.storeName} onChange={(v) => { setSearch((s) => ({ ...s, storeName: v })); setCurrentPage(1); }} placeholder="店铺名" className="w-44" />
        <FilterSelect value={search.approvalType} onChange={(v) => { setSearch((s) => ({ ...s, approvalType: v })); setCurrentPage(1); }} options={approvalTypeOptions} placeholder="種類" />
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
        emptyMessage="該当する承認リクエストがありません"
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalAction === "approve" ? "承認確認" : "拒否確認"}>
        <div className="space-y-4">
          <p className="text-sm text-muted">{selectedIds.size}件のリクエストを{modalAction === "approve" ? "承認" : "拒否"}します。</p>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">備考</label>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
              placeholder="備考を入力..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setModalOpen(false)} className="rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-gray-50 transition-colors">取消</button>
            <button onClick={confirmBatch} className={`rounded-lg px-4 py-2 text-sm text-white transition-colors ${modalAction === "approve" ? "bg-accent hover:bg-accent-hover" : "bg-danger hover:bg-red-700"}`}>実行</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
