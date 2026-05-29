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

interface DeliveryOrder {
  id: string;
  orderNumber: string;
  storeName: string;
  productName: string;
  amount: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  createdAt: string;
  completedAt?: string;
}

const MOCK_DATA: DeliveryOrder[] = [
  { id: "DL001", orderNumber: "ORD-2024-001", storeName: "東京旗舰店", productName: "季節限定蛋糕A", amount: 15000, status: "completed", customerName: "田中太郎", customerAddress: "東京都渋谷区", customerPhone: "090-1234-5678", createdAt: "2024-04-01", completedAt: "2024-04-03" },
  { id: "DL002", orderNumber: "ORD-2024-002", storeName: "大阪中心店", productName: "经典巧克力蛋糕", amount: 25000, status: "pending", customerName: "山田花子", customerAddress: "大阪市中央区", customerPhone: "080-9876-5432", createdAt: "2024-04-02" },
  { id: "DL003", orderNumber: "ORD-2024-003", storeName: "東京旗舰店", productName: "水果奶油蛋糕B", amount: 18000, status: "processing", customerName: "鈴木次郎", customerAddress: "京都市中京区", customerPhone: "070-1111-2222", createdAt: "2024-04-03" },
  { id: "DL004", orderNumber: "ORD-2024-004", storeName: "名古屋百货店", productName: "抹茶千层蛋糕", amount: 12000, status: "completed", customerName: "伊藤健二", customerAddress: "名古屋市中区", customerPhone: "090-3333-4444", createdAt: "2024-03-28", completedAt: "2024-03-30" },
  { id: "DL005", orderNumber: "ORD-2024-005", storeName: "福岡站前店", productName: "草莓奶油蛋糕", amount: 8000, status: "cancelled", customerName: "渡边美咲", customerAddress: "福岡市博多区", customerPhone: "080-5555-6666", createdAt: "2024-03-25" },
  { id: "DL006", orderNumber: "ORD-2024-006", storeName: "横浜港店", productName: "期間限定泡芙", amount: 9500, status: "pending", customerName: "加藤愛", customerAddress: "横浜市神奈川区", customerPhone: "070-7777-8888", createdAt: "2024-04-05" },
  { id: "DL007", orderNumber: "ORD-2024-007", storeName: "札幌中心店", productName: "北海道牛奶布丁", amount: 20000, status: "processing", customerName: "小林直樹", customerAddress: "札幌市中央区", customerPhone: "090-9999-0000", createdAt: "2024-04-06" },
  { id: "DL008", orderNumber: "ORD-2024-008", storeName: "大阪中心店", productName: "抹茶拿鐵", amount: 5500, status: "completed", customerName: "山花太郎", customerAddress: "大阪市北区", customerPhone: "080-2222-3333", createdAt: "2024-03-30", completedAt: "2024-04-01" },
];

const statusLabel: Record<string, string> = { pending: "保留", processing: "処理中", completed: "完了", cancelled: "取消" };
const statusVariant = (s: string): "success" | "warning" | "danger" | "info" | "default" => {
  if (s === "completed") return "success";
  if (s === "pending") return "warning";
  if (s === "processing") return "info";
  if (s === "cancelled") return "danger";
  return "default";
};

const formatPrice = (n: number) => "¥" + n.toLocaleString();

export default function DeliveryListPage() {
  const { status: authStatus } = useSession();
  const router = useRouter();
  useMemo(() => { if (authStatus === "unauthenticated") router.push("/login"); }, [authStatus, router]);

  const [data] = useState<DeliveryOrder[]>(MOCK_DATA);
  const [search, setSearch] = useState({ storeName: "", customerName: "", status: "" });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailRow, setDetailRow] = useState<DeliveryOrder | null>(null);

  const filtered = useMemo(() => {
    return data.filter((r) => {
      if (search.storeName && !r.storeName.includes(search.storeName)) return false;
      if (search.customerName && !r.customerName.includes(search.customerName)) return false;
      if (search.status && r.status !== search.status) return false;
      return true;
    });
  }, [data, search]);

  const totalItems = filtered.length;
  const pagedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const columns: Column<DeliveryOrder>[] = [
    { key: "orderNumber", label: "注文番号", width: "140px" },
    { key: "storeName", label: "店铺", width: "120px" },
    { key: "productName", label: "商品名" },
    { key: "amount", label: "金額", width: "100px", align: "right", render: (r) => <span className="font-medium">{formatPrice(r.amount)}</span> },
    { key: "customerName", label: "顧客", width: "100px" },
    { key: "customerAddress", label: "住所", width: "150px" },
    { key: "createdAt", label: "作成日", width: "100px" },
    { key: "status", label: "状態", width: "80px", render: (r) => <StatusBadge label={statusLabel[r.status]} variant={statusVariant(r.status)} /> },
    {
      key: "actions", label: "操作", width: "60px",
      render: (r) => <button onClick={() => { setDetailRow(r); setDetailModalOpen(true); }} className="text-accent hover:text-accent-hover text-xs font-medium">詳細</button>,
    },
  ];

  return (
    <div className="w-full px-8 py-8">
      <PageHeader title="代引管理" description="代引注文の一覧と管理。" />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <SearchInput value={search.storeName} onChange={(v) => { setSearch((s) => ({ ...s, storeName: v })); setCurrentPage(1); }} placeholder="店铺名" className="w-44" />
        <SearchInput value={search.customerName} onChange={(v) => { setSearch((s) => ({ ...s, customerName: v })); setCurrentPage(1); }} placeholder="顧客名" className="w-44" />
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
        emptyMessage="該当する代引注文がありません"
      />

      {detailRow && (
        <Modal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} title={`注文詳細 - ${detailRow.orderNumber}`}>
          <div className="space-y-3 text-sm">
            {[
              ["注文番号", detailRow.orderNumber],
              ["店铺", detailRow.storeName],
              ["商品", detailRow.productName],
              ["金額", formatPrice(detailRow.amount)],
              ["状態", statusLabel[detailRow.status]],
              ["顧客名", detailRow.customerName],
              ["住所", detailRow.customerAddress],
              ["電話", detailRow.customerPhone],
              ["作成日", detailRow.createdAt],
              ["完了日", detailRow.completedAt ?? "-"],
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
