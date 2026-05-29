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

// --- Types ---
interface Store {
  storeCd: string;
  storeName: string;
  storeShortName: string;
  storeType: string;
  openDate: string;
  status: string;
  phone: string;
  email: string;
  manager: string;
  region: string;
  businessType: string;
  settlementCycle: string;
  lob: string[];
  remark: string;
}

// --- Mock data (50 records for readability) ---
const storeTypes = ["直営店", "加盟店", "合作店", "代理店"];
const statuses = ["営業中", "改装中", "休業中", "閉店"];
const regions = ["華北区", "華東区", "華南区", "華西区", "華中区"];
const businessTypes = ["小売", "卸売", "総合", "EC", "その他"];
const settlementCycles = ["週締", "半月締", "月締", "四半期締"];
const managers = ["田中太郎", "佐藤花子", "鈴木一郎", "高橋美咲", "伊藤健二", "渡辺優子", "山本拓也", "中村誠"];
const lobOptions = ["RSL", "RSL_SGW", "TECH"];

const generateTestStores = (): Store[] => {
  const stores: Store[] = [];
  for (let i = 1; i <= 10000; i++) {
    const lobCount = i % 4;
    const lob: string[] = [];
    for (let j = 0; j < lobCount; j++) lob.push(lobOptions[j % lobOptions.length]);
    stores.push({
      storeCd: `STORE${String(i).padStart(5, "0")}`,
      storeName: `店舗${i}`,
      storeShortName: `S${i}`,
      storeType: storeTypes[i % storeTypes.length],
      openDate: `2024-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`,
      status: statuses[i % statuses.length],
      phone: `03-${String(1000 + i).padStart(4, "0")}-${String(2000 + i).padStart(4, "0")}`,
      email: `store${i}@example.com`,
      manager: managers[i % managers.length],
      region: regions[i % regions.length],
      businessType: businessTypes[i % businessTypes.length],
      settlementCycle: settlementCycles[i % settlementCycles.length],
      lob,
      remark: i % 5 === 0 ? `備考${i}` : "",
    });
  }
  return stores;
};

const initialStores: Store[] = generateTestStores();

// --- Helper components ---
const statusVariant = (s: string): "success" | "warning" | "danger" | "default" => {
  if (s === "営業中") return "success";
  if (s === "改装中") return "warning";
  if (s === "休業中") return "warning";
  return "danger";
};

export default function StorePage() {
  const { status: authStatus } = useSession();
  const router = useRouter();

  useMemo(() => {
    if (authStatus === "unauthenticated") router.push("/login");
  }, [authStatus, router]);

  // --- Search / Filter ---
  const [search, setSearch] = useState({ storeCd: "", storeName: "", region: "", status: "" });

  // --- Data ---
  const [stores, setStores] = useState<Store[]>(initialStores);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // --- Modal state ---
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [lobModalOpen, setLobModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [lobStore, setLobStore] = useState<Store | null>(null);
  const [lobInput, setLobInput] = useState("");

  const [newStore, setNewStore] = useState<Store>({
    storeCd: "", storeName: "", storeShortName: "", storeType: "直営店",
    openDate: "", status: "営業中", phone: "", email: "", manager: "",
    region: "華北区", businessType: "小売", settlementCycle: "月締", lob: [], remark: "",
  });

  // --- filtered data ---
  const filteredData = useMemo(() => {
    return stores.filter((s) => {
      if (search.storeCd && !s.storeCd.toLowerCase().includes(search.storeCd.toLowerCase())) return false;
      if (search.storeName && !s.storeName.includes(search.storeName)) return false;
      if (search.region && s.region !== search.region) return false;
      if (search.status && s.status !== search.status) return false;
      return true;
    });
  }, [stores, search]);

  const totalItems = filteredData.length;
  const pagedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // --- Handlers ---
  const openEdit = (store: Store) => { setEditingStore({ ...store }); setEditModalOpen(true); };
  const openCreate = () => { setNewStore({ storeCd: "", storeName: "", storeShortName: "", storeType: "直営店", openDate: "", status: "営業中", phone: "", email: "", manager: "", region: "華北区", businessType: "小売", settlementCycle: "月締", lob: [], remark: "" }); setCreateModalOpen(true); };
  const openLob = (store: Store) => { setLobStore({ ...store }); setLobInput(""); setLobModalOpen(true); };

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStore) return;
    setStores((prev) => prev.map((s) => (s.storeCd === editingStore.storeCd ? editingStore : s)));
    setEditModalOpen(false);
  };

  const saveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (stores.some((s) => s.storeCd === newStore.storeCd)) return alert("店铺CD已存在");
    setStores((prev) => [...prev, newStore]);
    setCreateModalOpen(false);
  };

  const addLob = () => {
    if (!lobInput || !lobStore) return;
    if (lobStore.lob.includes(lobInput)) return;
    const updated = { ...lobStore, lob: [...lobStore.lob, lobInput] };
    setLobStore(updated);
    setLobInput("");
  };
  const removeLob = (lob: string) => {
    if (!lobStore) return;
    setLobStore({ ...lobStore, lob: lobStore.lob.filter((l) => l !== lob) });
  };
  const saveLob = () => {
    if (!lobStore) return;
    setStores((prev) => prev.map((s) => (s.storeCd === lobStore.storeCd ? lobStore : s)));
    setLobModalOpen(false);
  };

  const handleBatchDelete = () => {
    setStores((prev) => prev.filter((s) => !selectedIds.has(s.storeCd)));
    setSelectedIds(new Set());
  };

  // --- Columns ---
  const columns: Column<Store>[] = [
    { key: "storeCd", label: "店铺CD", width: "100px", sortable: true },
    { key: "storeName", label: "店铺名", width: "130px", sortable: true },
    { key: "storeType", label: "種別", width: "80px", sortable: true },
    { key: "region", label: "地域", width: "80px", sortable: true },
    { key: "manager", label: "責任者", width: "100px", sortable: true },
    { key: "phone", label: "電話番号", width: "150px" },
    {
      key: "status",
      label: "状態",
      width: "90px",
      sortable: true,
      render: (row) => <StatusBadge label={row.status} variant={statusVariant(row.status)} />,
    },
    {
      key: "lob",
      label: "LOB",
      width: "140px",
      render: (row) => (
        <div className="flex items-center gap-1 flex-wrap">
          {row.lob.map((l) => (
            <span key={l} className="inline-flex items-center rounded bg-blue-50 text-blue-700 px-1.5 py-0.5 text-xs font-medium">
              {l}
            </span>
          ))}
          <button onClick={() => openLob(row)} className="text-accent hover:text-accent-hover text-xs ml-1">編集</button>
        </div>
      ),
    },
    {
      key: "actions",
      label: "操作",
      width: "60px",
      render: (row) => (
        <button onClick={() => openEdit(row)} className="text-accent hover:text-accent-hover text-xs font-medium">
          編集
        </button>
      ),
    },
  ];

  return (
    <div className="w-full px-8 py-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Master管理 / 店铺管理</h1>
        <button onClick={openCreate} className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新規登録
        </button>
      </div>

      <ActionBar
        selectedCount={selectedIds.size}
        onClearSelection={() => setSelectedIds(new Set())}
        actions={[
          { label: "削除", onClick: handleBatchDelete, variant: "danger" },
          { label: "CSV出力", onClick: () => {}, variant: "outline" },
        ]}
      />

      {/* Search filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <SearchInput
          value={search.storeCd}
          onChange={(v) => { setSearch((s) => ({ ...s, storeCd: v })); setCurrentPage(1); }}
          placeholder="店铺CD検索"
          className="w-48"
        />
        <SearchInput
          value={search.storeName}
          onChange={(v) => { setSearch((s) => ({ ...s, storeName: v })); setCurrentPage(1); }}
          placeholder="店铺名検索"
          className="w-48"
        />
        <FilterSelect
          value={search.region}
          onChange={(v) => { setSearch((s) => ({ ...s, region: v })); setCurrentPage(1); }}
          options={regions.map((r) => ({ value: r, label: r }))}
          placeholder="地域"
        />
        <FilterSelect
          value={search.status}
          onChange={(v) => { setSearch((s) => ({ ...s, status: v })); setCurrentPage(1); }}
          options={statuses.map((s) => ({ value: s, label: s }))}
          placeholder="状態"
        />
      </div>

      <DataTable
        columns={columns}
        data={pagedData}
        keyExtractor={(row) => row.storeCd}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        pageSize={pageSize}
        currentPage={currentPage}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }}
        emptyMessage="条件に一致する店铺がありません"
      />

      {/* Edit Modal */}
      {editingStore && (
        <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="店铺編集" size="lg">
          <form onSubmit={saveEdit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "店铺CD", key: "storeCd", disabled: true },
              { label: "店铺名", key: "storeName" },
              { label: "略称", key: "storeShortName" },
              { label: "電話番号", key: "phone" },
              { label: "Email", key: "email" },
              { label: "責任者", key: "manager" },
              { label: "住所", key: "remark" },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-muted mb-1">{f.label}</label>
                <input
                  type="text"
                  value={(editingStore[f.key as keyof Store] as string) ?? ""}
                  disabled={f.disabled}
                  onChange={(e) => setEditingStore({ ...editingStore, [f.key]: e.target.value })}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent disabled:bg-gray-50 disabled:text-muted transition-colors"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-muted mb-1">種別</label>
              <select
                value={editingStore.storeType}
                onChange={(e) => setEditingStore({ ...editingStore, storeType: e.target.value })}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              >
                {storeTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">状態</label>
              <select
                value={editingStore.status}
                onChange={(e) => setEditingStore({ ...editingStore, status: e.target.value })}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              >
                {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditModalOpen(false)} className="rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-gray-50 transition-colors">取消</button>
              <button type="submit" className="rounded-lg bg-accent px-4 py-2 text-sm text-white hover:bg-accent-hover transition-colors">保存</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Create Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="店铺新規登録" size="lg">
        <form onSubmit={saveNew} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "店铺CD", key: "storeCd" },
            { label: "店铺名", key: "storeName" },
            { label: "略称", key: "storeShortName" },
            { label: "電話番号", key: "phone" },
            { label: "Email", key: "email" },
            { label: "責任者", key: "manager" },
            { label: "備考", key: "remark" },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-xs font-medium text-muted mb-1">{f.label}</label>
              <input
                type="text"
                value={(newStore[f.key as keyof Store] as string) ?? ""}
                required
                onChange={(e) => setNewStore({ ...newStore, [f.key]: e.target.value })}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-muted mb-1">種別</label>
            <select value={newStore.storeType} onChange={(e) => setNewStore({ ...newStore, storeType: e.target.value })} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent">
              {storeTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">地域</label>
            <select value={newStore.region} onChange={(e) => setNewStore({ ...newStore, region: e.target.value })} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent">
              {regions.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setCreateModalOpen(false)} className="rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-gray-50 transition-colors">取消</button>
            <button type="submit" className="rounded-lg bg-accent px-4 py-2 text-sm text-white hover:bg-accent-hover transition-colors">登録</button>
          </div>
        </form>
      </Modal>

      {/* LOB Modal */}
      {lobStore && (
        <Modal isOpen={lobModalOpen} onClose={() => setLobModalOpen(false)} title={`LOB管理 - ${lobStore.storeCd}`} size="sm">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-muted mb-2">現在のLOB</p>
              <div className="flex flex-wrap gap-2">
                {lobStore.lob.length === 0 && <span className="text-xs text-muted">なし</span>}
                {lobStore.lob.map((l) => (
                  <span key={l} className="inline-flex items-center gap-1 rounded bg-blue-50 text-blue-700 px-2 py-1 text-xs font-medium">
                    {l}
                    <button onClick={() => removeLob(l)} className="text-blue-400 hover:text-red-500 transition-colors">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted mb-2">LOB追加</p>
              <div className="flex gap-2">
                <select
                  value={lobInput}
                  onChange={(e) => setLobInput(e.target.value)}
                  className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                >
                  <option value="">選択</option>
                  {lobOptions.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
                <button onClick={addLob} className="rounded-lg bg-accent px-3 py-2 text-sm text-white hover:bg-accent-hover transition-colors">追加</button>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setLobModalOpen(false)} className="rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-gray-50 transition-colors">取消</button>
              <button onClick={saveLob} className="rounded-lg bg-accent px-4 py-2 text-sm text-white hover:bg-accent-hover transition-colors">保存</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
