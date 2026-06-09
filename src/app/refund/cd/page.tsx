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

interface CdDefinition {
  id: string;
  cdCode: string;
  cdName: string;
  cdType: string;
  usageCount: number;
  maxUsage: number;
  validFrom: string;
  validTo: string;
  status: string;
  remark: string;
}

const cdTypes = ["クーポン", "割引券", "金券", "ギフト券", "体験券"];
const statuses = ["有効", "使用済", "期限切", "無効"];
const statusVariant = (s: string): "success" | "warning" | "danger" | "default" => {
  if (s === "有効") return "success";
  if (s === "使用済" || s === "期限切") return "warning";
  if (s === "無効") return "danger";
  return "default";
};

const generateData = (): CdDefinition[] => {
  const records: CdDefinition[] = [];
  for (let i = 1; i <= 100; i++) {
    records.push({
      id: `CD${String(i).padStart(5, "0")}`,
      cdCode: `CD${String(i).padStart(8, "0")}`,
      cdName: `コード定義${i}`,
      cdType: cdTypes[i % cdTypes.length],
      usageCount: Math.floor(Math.random() * 100),
      maxUsage: Math.floor(Math.random() * 500) + 100,
      validFrom: `2024-${String((i % 12) + 1).padStart(2, "0")}-01`,
      validTo: `2024-${String(((i + 6) % 12 || 12)).padStart(2, "0")}-28`,
      status: statuses[i % statuses.length],
      remark: i % 5 === 0 ? `備考${i}` : "",
    });
  }
  return records;
};

export default function RefundCdPage() {
  const { status: authStatus } = useSession();
  const router = useRouter();
  useMemo(() => { if (authStatus === "unauthenticated") router.push("/login"); }, [authStatus, router]);

  const [data, setData] = useState<CdDefinition[]>(generateData);
  const [search, setSearch] = useState({ cdCode: "", cdName: "", cdType: "", status: "" });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editing, setEditing] = useState<CdDefinition | null>(null);
  const [newItem, setNewItem] = useState<CdDefinition>({
    id: "", cdCode: "", cdName: "", cdType: "クーポン", usageCount: 0, maxUsage: 100,
    validFrom: "", validTo: "", status: "有効", remark: "",
  });

  const filtered = useMemo(() => {
    return data.filter((r) => {
      if (search.cdCode && !r.cdCode.includes(search.cdCode)) return false;
      if (search.cdName && !r.cdName.includes(search.cdName)) return false;
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

  const openEdit = (r: CdDefinition) => { setEditing({ ...r }); setEditModalOpen(true); };
  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setData((prev) => prev.map((r) => (r.id === editing.id ? editing : r)));
    setEditModalOpen(false);
  };
  const saveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.some((r) => r.cdCode === newItem.cdCode)) return alert("このCDコードは既に存在します");
    setData((prev) => [...prev, { ...newItem, id: `CD${String(prev.length + 1).padStart(5, "0")}` }]);
    setCreateModalOpen(false);
  };

  const columns: Column<CdDefinition>[] = [
    { key: "cdCode", label: "CDコード" },
    { key: "cdName", label: "CD名" },
    { key: "cdType", label: "種別", render: (r) => <span className="inline-flex items-center rounded bg-accent-light text-accent px-2 py-0.5 text-xs font-medium">{r.cdType}</span> },
    { key: "usageCount", label: "使用回数", align: "right" },
    { key: "maxUsage", label: "上限", align: "right" },
    { key: "validFrom", label: "有効開始" },
    { key: "validTo", label: "有効終了" },
    { key: "status", label: "状態", render: (r) => <StatusBadge label={r.status} variant={statusVariant(r.status)} /> },
    {
      key: "actions", label: "操作",
      render: (r) => <button onClick={() => openEdit(r)} className="text-accent hover:text-accent-hover text-xs font-medium">編集</button>,
    },
  ];

  return (
    <div className="w-full px-8 py-8">
      <PageHeader
        title="退款CD管理"
        description="退款コード定義の管理。"
        actions={
          <button onClick={() => { setNewItem({ id: "", cdCode: "", cdName: "", cdType: "クーポン", usageCount: 0, maxUsage: 100, validFrom: "", validTo: "", status: "有効", remark: "" }); setCreateModalOpen(true); }} className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            新規登録
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <SearchInput value={search.cdCode} onChange={(v) => { setSearch((s) => ({ ...s, cdCode: v })); setCurrentPage(1); }} placeholder="CDコード" className="w-40" />
        <SearchInput value={search.cdName} onChange={(v) => { setSearch((s) => ({ ...s, cdName: v })); setCurrentPage(1); }} placeholder="CD名" className="w-44" />
        <FilterSelect value={search.cdType} onChange={(v) => { setSearch((s) => ({ ...s, cdType: v })); setCurrentPage(1); }} options={cdTypes.map((t) => ({ value: t, label: t }))} placeholder="種別" />
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
        emptyMessage="該当するCD定義がありません"
      />

      {editing && (
        <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="CD編集" size="lg">
          <form onSubmit={saveEdit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">CDコード</label>
              <input type="text" value={editing.cdCode} disabled className="w-full rounded-lg border border-border bg-gray-50 px-3 py-2 text-sm text-muted" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">CD名</label>
              <input type="text" value={editing.cdName} onChange={(e) => setEditing({ ...editing, cdName: e.target.value })} required className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">種別</label>
              <select value={editing.cdType} onChange={(e) => setEditing({ ...editing, cdType: e.target.value })} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent">
                {cdTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">上限回数</label>
              <input type="number" value={editing.maxUsage} onChange={(e) => setEditing({ ...editing, maxUsage: Number(e.target.value) })} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">有効開始</label>
              <input type="date" value={editing.validFrom} onChange={(e) => setEditing({ ...editing, validFrom: e.target.value })} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">有効終了</label>
              <input type="date" value={editing.validTo} onChange={(e) => setEditing({ ...editing, validTo: e.target.value })} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">状態</label>
              <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent">
                {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-muted mb-1">備考</label>
              <textarea value={editing.remark} onChange={(e) => setEditing({ ...editing, remark: e.target.value })} rows={2} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditModalOpen(false)} className="rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-gray-50 transition-colors">取消</button>
              <button type="submit" className="rounded-lg bg-accent px-4 py-2 text-sm text-white hover:bg-accent-hover transition-colors">保存</button>
            </div>
          </form>
        </Modal>
      )}

      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="CD新規登録" size="lg">
        <form onSubmit={saveNew} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1">CDコード</label>
            <input type="text" value={newItem.cdCode} onChange={(e) => setNewItem({ ...newItem, cdCode: e.target.value })} required className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">CD名</label>
            <input type="text" value={newItem.cdName} onChange={(e) => setNewItem({ ...newItem, cdName: e.target.value })} required className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">種別</label>
            <select value={newItem.cdType} onChange={(e) => setNewItem({ ...newItem, cdType: e.target.value })} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent">
              {cdTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">上限回数</label>
            <input type="number" value={newItem.maxUsage} onChange={(e) => setNewItem({ ...newItem, maxUsage: Number(e.target.value) })} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">有効開始</label>
            <input type="date" value={newItem.validFrom} onChange={(e) => setNewItem({ ...newItem, validFrom: e.target.value })} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">有効終了</label>
            <input type="date" value={newItem.validTo} onChange={(e) => setNewItem({ ...newItem, validTo: e.target.value })} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
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
