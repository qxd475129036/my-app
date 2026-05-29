"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DataTable, Column } from "@/app/components/DataTable";
import { SearchInput } from "@/app/components/SearchInput";
import { FilterSelect } from "@/app/components/FilterSelect";
import { Modal } from "@/app/components/Modal";
import { ActionBar } from "@/app/components/ActionBar";
import { StatusBadge } from "@/app/components/StatusBadge";

interface RequestCd {
  id: string;
  requestNo: string;
  storeCd: string;
  storeName: string;
  cdType: string;
  cdCode: string;
  productName: string;
  quantity: number;
  priority: "low" | "normal" | "high";
  status: "pending" | "processing" | "approved" | "rejected" | "completed";
  reason: string;
  requester: string;
  requestDate: string;
  approvedAt?: string;
}

const storeNames = ["東京旗舰店", "大阪中心店", "名古屋百货店", "福岡站前店", "札幌中心店", "横浜港店", "京都清水店", "神戸元町店", "仙台中央店", "広島紙屋町店"];
const cdTypes = ["商品CD申請", "商品CD変更", "商品CD停止"];
const productNames = ["季節限定蛋糕A", "经典巧克力蛋糕", "水果奶油蛋糕B", "抹茶千层蛋糕", "草莓奶油蛋糕", "北海道牛奶布丁", "抹茶拿鐵", "期間限定泡芙", "抹茶慕斯", "芝士蛋糕"];
const reasons = ["新品上市需要", "包装更新", "销售不佳", "季节商品需求", "定价不合理", "夏季新商品", "材料変更", "期間終了"];
const requesters = ["田中一郎", "山花太郎", "鈴木花子", "伊藤健二", "渡边美咲", "小林直樹", "加藤愛", "佐藤健", "高橋愛", "中村優"];
const storeCds = ["STORE001", "STORE002", "STORE003", "STORE004", "STORE005", "STORE006", "STORE007", "STORE008", "STORE009", "STORE010"];

const generateMockData = (): RequestCd[] => {
  const data: RequestCd[] = [];
  const priorities: ("low" | "normal" | "high")[] = ["low", "normal", "high"];
  const statuses: ("pending" | "processing" | "approved" | "rejected" | "completed")[] = ["pending", "processing", "approved", "rejected", "completed"];
  for (let i = 1; i <= 10000; i++) {
    const idx = (i - 1) % 10;
    const s = statuses[i % statuses.length];
    data.push({
      id: `RC${String(i).padStart(5, "0")}`,
      requestNo: `REQ-2024-${String(i).padStart(4, "0")}`,
      storeCd: storeCds[idx],
      storeName: storeNames[idx],
      cdType: cdTypes[i % cdTypes.length],
      cdCode: `PROD${String(i).padStart(5, "0")}`,
      productName: productNames[idx],
      quantity: (i * 7) % 100,
      priority: priorities[i % priorities.length],
      status: s,
      reason: reasons[idx],
      requester: requesters[idx],
      requestDate: `2024-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`,
      ...((s === "approved" || s === "completed") ? { approvedAt: `2024-${String((i % 12) + 1).padStart(2, "0")}-${String(((i + 1) % 28) + 1).padStart(2, "0")}` } : {}),
    });
  }
  return data;
};

const statusLabel: Record<string, string> = {
  pending: "待処理", processing: "処理中", approved: "承認済", rejected: "拒否", completed: "完了",
};
const statusVariant = (s: string): "success" | "warning" | "danger" | "info" | "default" => {
  if (s === "approved" || s === "completed") return "success";
  if (s === "processing") return "info";
  if (s === "pending") return "warning";
  return "danger";
};
const priorityLabel: Record<string, string> = { low: "低", normal: "通常", high: "高" };
const cdTypeOptions = ["商品CD申請", "商品CD変更", "商品CD停止"];

export default function RequestCdListPage() {
  const { status: authStatus } = useSession();
  const router = useRouter();

  useMemo(() => {
    if (authStatus === "unauthenticated") router.push("/login");
  }, [authStatus, router]);

  const [data, setData] = useState<RequestCd[]>(generateMockData());
  const [search, setSearch] = useState({ requestNo: "", storeName: "", cdType: "", status: "" });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"approve" | "reject" | "complete">("approve");
  const [modalRemark, setModalRemark] = useState("");

  const filtered = useMemo(() => {
    return data.filter((r) => {
      if (search.requestNo && !r.requestNo.toLowerCase().includes(search.requestNo.toLowerCase())) return false;
      if (search.storeName && !r.storeName.includes(search.storeName)) return false;
      if (search.cdType && r.cdType !== search.cdType) return false;
      if (search.status && r.status !== search.status) return false;
      return true;
    });
  }, [data, search]);

  const totalItems = filtered.length;
  const pagedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const openBatch = (action: "approve" | "reject" | "complete") => {
    setModalAction(action);
    setModalRemark("");
    setModalOpen(true);
  };

  const confirmBatch = () => {
    const newStatus = modalAction === "approve" ? "approved" : modalAction === "reject" ? "rejected" : "completed";
    setData((prev) => prev.map((r) => (selectedIds.has(r.id) ? { ...r, status: newStatus as RequestCd["status"] } : r)));
    setSelectedIds(new Set());
    setModalOpen(false);
  };

  const columns: Column<RequestCd>[] = [
    { key: "requestNo", label: "請求番号", width: "140px" },
    { key: "storeName", label: "店铺名", width: "120px" },
    { key: "cdType", label: "CD種別", width: "120px" },
    { key: "productName", label: "商品名" },
    { key: "quantity", label: "数量", width: "70px", align: "right" },
    {
      key: "priority", label: "優先度", width: "70px",
      render: (row) => {
        const colors: Record<string, string> = { low: "text-gray-500", normal: "text-blue-600", high: "text-red-600 font-semibold" };
        return <span className={colors[row.priority]}>{priorityLabel[row.priority]}</span>;
      },
    },
    {
      key: "status", label: "状態", width: "90px",
      render: (row) => <StatusBadge label={statusLabel[row.status]} variant={statusVariant(row.status)} />,
    },
    { key: "requester", label: "申請者", width: "100px" },
    { key: "requestDate", label: "申請日", width: "100px" },
  ];

  return (
    <div className="w-full px-8 py-4">
      <h1 className="text-2xl font-bold text-foreground mb-6">Master管理 / 請求コード管理</h1>

      <ActionBar
        selectedCount={selectedIds.size}
        onClearSelection={() => setSelectedIds(new Set())}
        actions={[
          { label: "承認", onClick: () => openBatch("approve"), variant: "primary" },
          { label: "拒否", onClick: () => openBatch("reject"), variant: "danger" },
          { label: "完了", onClick: () => openBatch("complete"), variant: "outline" },
        ]}
      />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <SearchInput value={search.requestNo} onChange={(v) => { setSearch((s) => ({ ...s, requestNo: v })); setCurrentPage(1); }} placeholder="請求番号" className="w-44" />
        <SearchInput value={search.storeName} onChange={(v) => { setSearch((s) => ({ ...s, storeName: v })); setCurrentPage(1); }} placeholder="店铺名" className="w-44" />
        <FilterSelect value={search.cdType} onChange={(v) => { setSearch((s) => ({ ...s, cdType: v })); setCurrentPage(1); }} options={cdTypeOptions.map((t) => ({ value: t, label: t }))} placeholder="CD種別" />
        <FilterSelect value={search.status} onChange={(v) => { setSearch((s) => ({ ...s, status: v })); setCurrentPage(1); }} options={Object.entries(statusLabel).map(([k, v]) => ({ value: k, label: v }))} placeholder="状態" />
      </div>

      <DataTable
        columns={columns}
        data={pagedData}
        keyExtractor={(row) => row.id}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        pageSize={pageSize}
        currentPage={currentPage}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }}
        emptyMessage="該当する請求CDがありません"
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalAction === "approve" ? "承認" : modalAction === "reject" ? "拒否" : "完了"}>
        <div className="space-y-4">
          <p className="text-sm text-muted">{selectedIds.size}件のリクエストを処理します。</p>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">処理備考</label>
            <textarea
              value={modalRemark}
              onChange={(e) => setModalRemark(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
              placeholder="備考を入力..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setModalOpen(false)} className="rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-gray-50 transition-colors">取消</button>
            <button onClick={confirmBatch} className="rounded-lg bg-accent px-4 py-2 text-sm text-white hover:bg-accent-hover transition-colors">実行</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
