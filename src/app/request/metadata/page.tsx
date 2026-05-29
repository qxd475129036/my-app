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

interface MetadataRecord {
  id: string;
  metadataNo: string;
  category: string;
  categoryName: string;
  itemName: string;
  itemCode: string;
  defaultValue: string;
  isMandatory: boolean;
  displayOrder: number;
  status: "active" | "inactive";
  description: string;
}

const MOCK_DATA: MetadataRecord[] = [
  { id: "MT001", metadataNo: "MET-2024-001", category: "price", categoryName: "価格管理", itemName: "季節限定蛋糕価格", itemCode: "PRICE_SEASONAL", defaultValue: "1500", isMandatory: true, displayOrder: 1, status: "active", description: "季節限定蛋糕の基本価格設定" },
  { id: "MT002", metadataNo: "MET-2024-002", category: "inventory", categoryName: "在庫管理", itemName: "在庫警告閾値", itemCode: "INV_WARNING", defaultValue: "10", isMandatory: true, displayOrder: 2, status: "active", description: "商品在庫がこの値を下回った場合の警告" },
  { id: "MT003", metadataNo: "MET-2024-003", category: "discount", categoryName: "割引規則", itemName: "会員割引率", itemCode: "MEMBER_DISCOUNT", defaultValue: "0.1", isMandatory: false, displayOrder: 3, status: "active", description: "会員向け割引率設定 (0.1 = 10%OFF)" },
  { id: "MT004", metadataNo: "MET-2024-004", category: "shipping", categoryName: "配送規則", itemName: "無料配送条件", itemCode: "FREE_SHIPPING", defaultValue: "5000", isMandatory: true, displayOrder: 4, status: "active", description: "送料無料になる最低購入金額" },
  { id: "MT005", metadataNo: "MET-2024-005", category: "tax", categoryName: "税率設定", itemName: "消費税率", itemCode: "TAX_RATE", defaultValue: "0.10", isMandatory: true, displayOrder: 5, status: "inactive", description: "現行の消費税率 (10%)" },
  { id: "MT006", metadataNo: "MET-2024-006", category: "price", categoryName: "価格管理", itemName: "通常蛋糕価格", itemCode: "PRICE_REGULAR", defaultValue: "1200", isMandatory: true, displayOrder: 6, status: "active", description: "通常蛋糕の基本価格" },
  { id: "MT007", metadataNo: "MET-2024-007", category: "discount", categoryName: "割引規則", itemName: "季節割引率", itemCode: "SEASONAL_DISCOUNT", defaultValue: "0.15", isMandatory: false, displayOrder: 7, status: "inactive", description: "季節商品の特別割引率" },
  { id: "MT008", metadataNo: "MET-2024-008", category: "shipping", categoryName: "配送規則", itemName: "配送時間帯", itemCode: "DELIVERY_SLOT", defaultValue: "14:00-16:00", isMandatory: false, displayOrder: 8, status: "active", description: "標準配送時間帯" },
];

const statusLabel: Record<string, string> = { active: "有効", inactive: "無効" };
const statusVariant = (s: string): "success" | "default" => s === "active" ? "success" : "default";
const categoryOptions = [
  { value: "price", label: "価格管理" },
  { value: "inventory", label: "在庫管理" },
  { value: "discount", label: "割引規則" },
  { value: "shipping", label: "配送規則" },
  { value: "tax", label: "税率設定" },
];

export default function MetadataPage() {
  const { status: authStatus } = useSession();
  const router = useRouter();

  useMemo(() => { if (authStatus === "unauthenticated") router.push("/login"); }, [authStatus, router]);

  const [data, setData] = useState<MetadataRecord[]>(MOCK_DATA);
  const [search, setSearch] = useState({ itemName: "", category: "", status: "" });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editing, setEditing] = useState<MetadataRecord | null>(null);
  const [newItem, setNewItem] = useState<MetadataRecord>({
    id: "", metadataNo: "", category: "price", categoryName: "価格管理", itemName: "", itemCode: "",
    defaultValue: "", isMandatory: false, displayOrder: 1, status: "active", description: "",
  });

  const filtered = useMemo(() => {
    return data.filter((r) => {
      if (search.itemName && !r.itemName.includes(search.itemName)) return false;
      if (search.category && r.category !== search.category) return false;
      if (search.status && r.status !== search.status) return false;
      return true;
    });
  }, [data, search]);

  const totalItems = filtered.length;
  const pagedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const openEdit = (r: MetadataRecord) => { setEditing({ ...r }); setEditModalOpen(true); };
  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setData((prev) => prev.map((r) => (r.id === editing.id ? editing : r)));
    setEditModalOpen(false);
  };
  const saveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.some((r) => r.id === newItem.id)) return alert("このIDは既に存在します");
    setData((prev) => [...prev, { ...newItem, metadataNo: `MET-2024-${String(prev.length + 1).padStart(3, "0")}` }]);
    setCreateModalOpen(false);
  };

  const catMap: Record<string, string> = { price: "価格管理", inventory: "在庫管理", discount: "割引規則", shipping: "配送規則", tax: "税率設定" };

  const columns: Column<MetadataRecord>[] = [
    { key: "metadataNo", label: "番号", width: "130px" },
    {
      key: "categoryName", label: "カテゴリ", width: "100px",
      render: (r) => <span className="inline-flex items-center rounded bg-accent-light text-accent px-2 py-0.5 text-xs font-medium">{r.categoryName}</span>,
    },
    { key: "itemName", label: "項目名" },
    { key: "itemCode", label: "コード", width: "140px" },
    { key: "defaultValue", label: "初期値", width: "100px" },
    { key: "displayOrder", label: "順序", width: "60px", align: "center" },
    {
      key: "isMandatory", label: "必須", width: "60px", align: "center",
      render: (r) => r.isMandatory ? <span className="text-xs text-danger font-medium">必須</span> : <span className="text-xs text-muted">任意</span>,
    },
    {
      key: "status", label: "状態", width: "70px",
      render: (r) => <StatusBadge label={statusLabel[r.status]} variant={statusVariant(r.status)} />,
    },
    {
      key: "actions", label: "操作", width: "60px",
      render: (r) => <button onClick={() => openEdit(r)} className="text-accent hover:text-accent-hover text-xs font-medium">編集</button>,
    },
  ];

  return (
    <div className="w-full px-8 py-8">
      <PageHeader
        title="メタデータ管理"
        description="システム設定値やマスタデータの管理を行います。"
        actions={
          <button onClick={() => { setNewItem({ id: "", metadataNo: "", category: "price", categoryName: "価格管理", itemName: "", itemCode: "", defaultValue: "", isMandatory: false, displayOrder: 1, status: "active", description: "" }); setCreateModalOpen(true); }} className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新規登録
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <SearchInput value={search.itemName} onChange={(v) => { setSearch((s) => ({ ...s, itemName: v })); setCurrentPage(1); }} placeholder="項目名検索" className="w-48" />
        <FilterSelect value={search.category} onChange={(v) => { setSearch((s) => ({ ...s, category: v })); setCurrentPage(1); }} options={categoryOptions} placeholder="カテゴリ" />
        <FilterSelect value={search.status} onChange={(v) => { setSearch((s) => ({ ...s, status: v })); setCurrentPage(1); }} options={[{ value: "active", label: "有効" }, { value: "inactive", label: "無効" }]} placeholder="状態" />
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
        emptyMessage="該当するメタデータがありません"
      />

      {editing && (
        <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="メタデータ編集" size="lg">
          <form onSubmit={saveEdit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">項目名</label>
              <input type="text" value={editing.itemName} onChange={(e) => setEditing({ ...editing, itemName: e.target.value })} required className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">コード</label>
              <input type="text" value={editing.itemCode} onChange={(e) => setEditing({ ...editing, itemCode: e.target.value })} required className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">カテゴリ</label>
              <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value, categoryName: catMap[e.target.value] || "" })} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent">
                {categoryOptions.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">初期値</label>
              <input type="text" value={editing.defaultValue} onChange={(e) => setEditing({ ...editing, defaultValue: e.target.value })} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">表示順</label>
              <input type="number" value={editing.displayOrder} onChange={(e) => setEditing({ ...editing, displayOrder: Number(e.target.value) })} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">状態</label>
              <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as "active" | "inactive" })} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent">
                <option value="active">有効</option>
                <option value="inactive">無効</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-muted mb-1">説明</label>
              <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
            </div>
            <div className="md:col-span-2 flex items-center gap-2">
              <input type="checkbox" id="edit-mandatory" checked={editing.isMandatory} onChange={(e) => setEditing({ ...editing, isMandatory: e.target.checked })} className="h-4 w-4 rounded border-border text-accent focus:ring-accent/20 cursor-pointer" />
              <label htmlFor="edit-mandatory" className="text-xs text-muted cursor-pointer">必須項目</label>
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditModalOpen(false)} className="rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-gray-50 transition-colors">取消</button>
              <button type="submit" className="rounded-lg bg-accent px-4 py-2 text-sm text-white hover:bg-accent-hover transition-colors">保存</button>
            </div>
          </form>
        </Modal>
      )}

      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="メタデータ新規登録" size="lg">
        <form onSubmit={saveNew} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1">項目名</label>
            <input type="text" value={newItem.itemName} onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })} required className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">コード</label>
            <input type="text" value={newItem.itemCode} onChange={(e) => setNewItem({ ...newItem, itemCode: e.target.value })} required className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">カテゴリ</label>
            <select value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value, categoryName: catMap[e.target.value] || "" })} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent">
              {categoryOptions.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">初期値</label>
            <input type="text" value={newItem.defaultValue} onChange={(e) => setNewItem({ ...newItem, defaultValue: e.target.value })} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">表示順</label>
            <input type="number" value={newItem.displayOrder} onChange={(e) => setNewItem({ ...newItem, displayOrder: Number(e.target.value) })} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">状態</label>
            <select value={newItem.status} onChange={(e) => setNewItem({ ...newItem, status: e.target.value as "active" | "inactive" })} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent">
              <option value="active">有効</option>
              <option value="inactive">無効</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-muted mb-1">説明</label>
            <textarea value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} rows={3} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
          </div>
          <div className="md:col-span-2 flex items-center gap-2">
            <input type="checkbox" id="new-mandatory" checked={newItem.isMandatory} onChange={(e) => setNewItem({ ...newItem, isMandatory: e.target.checked })} className="h-4 w-4 rounded border-border text-accent focus:ring-accent/20 cursor-pointer" />
            <label htmlFor="new-mandatory" className="text-xs text-muted cursor-pointer">必須項目</label>
          </div>
          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setCreateModalOpen(false)} className="rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-gray-50 transition-colors">取消</button>
            <button type="submit" className="rounded-lg bg-accent px-4 py-2 text-sm text-white hover:bg-accent-hover transition-colors">登録</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
