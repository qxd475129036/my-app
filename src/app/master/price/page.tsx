"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DataTable, Column } from "@/app/components/DataTable";
import { SearchInput } from "@/app/components/SearchInput";
import { FilterSelect } from "@/app/components/FilterSelect";
import { Modal } from "@/app/components/Modal";
import { StatusBadge } from "@/app/components/StatusBadge";

interface Price {
  priceId: string;
  productName: string;
  price: number;
  validFrom: string;
  validTo: string;
  status: string;
  category: string;
}

const productNames = [
  "Apple iPhone 15 Pro", "Apple iPhone 15", "Samsung Galaxy S24", "Google Pixel 8",
  "MacBook Pro 14", "MacBook Air M3", "Dell XPS 15", "ThinkPad X1 Carbon",
  "iPad Pro 12.9", "iPad Air", "Surface Pro 10", "Galaxy Tab S9",
  "AirPods Pro 2", "Sony WH-1000XM5", "Bose QC Ultra", "Apple Watch Ultra 2",
  "Garmin Fenix 7", "Kindle Scribe", "Nintendo Switch OLED", "PS5 Slim",
];
const statuses = ["有効", "期限間近", "期限切れ", "下書"];
const categories = ["スマホ", "PC", "タブレット", "オーディオ", "ウェアラブル", "ゲーム", "その他"];

const generateData = (): Price[] => {
  const data: Price[] = [];
  for (let i = 1; i <= 10000; i++) {
    const idx = (i - 1) % productNames.length;
    data.push({
      priceId: `PRICE${String(i).padStart(5, "0")}`,
      productName: productNames[idx],
      price: 5000 + i * 100 + idx * 500,
      validFrom: `2024-${String((i % 12) + 1).padStart(2, "0")}-01`,
      validTo: `2025-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`,
      status: statuses[i % statuses.length],
      category: categories[idx],
    });
  }
  return data;
};

const initialData: Price[] = generateData();

const statusVariant = (s: string): "success" | "warning" | "danger" | "default" => {
  if (s === "有効") return "success";
  if (s === "期限間近") return "warning";
  if (s === "期限切れ") return "danger";
  return "default";
};

const formatPrice = (n: number) => "¥" + n.toLocaleString();

export default function PricePage() {
  const { status: authStatus } = useSession();
  const router = useRouter();

  useMemo(() => {
    if (authStatus === "unauthenticated") router.push("/login");
  }, [authStatus, router]);

  const [data, setData] = useState<Price[]>(initialData);
  const [search, setSearch] = useState({ productName: "", category: "", status: "" });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<Price | null>(null);
  const [newPrice, setNewPrice] = useState<Price>({ priceId: "", productName: "", price: 0, validFrom: "", validTo: "", status: "有効", category: "スマホ" });

  const filtered = useMemo(() => {
    return data.filter((p) => {
      if (search.productName && !p.productName.toLowerCase().includes(search.productName.toLowerCase())) return false;
      if (search.category && p.category !== search.category) return false;
      if (search.status && p.status !== search.status) return false;
      return true;
    });
  }, [data, search]);

  const totalItems = filtered.length;
  const pagedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const openEdit = (price: Price) => { setEditingPrice({ ...price }); setEditModalOpen(true); };
  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPrice) return;
    setData((prev) => prev.map((p) => (p.priceId === editingPrice.priceId ? editingPrice : p)));
    setEditModalOpen(false);
  };
  const saveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.some((p) => p.priceId === newPrice.priceId)) return alert("この価格IDは既に存在します");
    setData((prev) => [...prev, newPrice]);
    setCreateModalOpen(false);
  };

  const columns: Column<Price>[] = [
    { key: "priceId", label: "価格ID", width: "110px" },
    { key: "productName", label: "商品名" },
    { key: "category", label: "カテゴリ", width: "90px" },
    { key: "price", label: "価格", width: "130px", align: "right", render: (row) => <span className="font-medium">{formatPrice(row.price)}</span> },
    { key: "validFrom", label: "有効開始日", width: "110px" },
    { key: "validTo", label: "有効終了日", width: "110px" },
    { key: "status", label: "状態", width: "90px", render: (row) => <StatusBadge label={row.status} variant={statusVariant(row.status)} /> },
    {
      key: "actions", label: "操作", width: "60px",
      render: (row) => <button onClick={() => openEdit(row)} className="text-accent hover:text-accent-hover text-xs font-medium">編集</button>,
    },
  ];

  return (
    <div className="w-full px-8 py-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Master管理 / 単価管理</h1>
        <button onClick={() => { setNewPrice({ priceId: "", productName: "", price: 0, validFrom: "", validTo: "", status: "有効", category: "スマホ" }); setCreateModalOpen(true); }} className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新規登録
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <SearchInput value={search.productName} onChange={(v) => { setSearch((s) => ({ ...s, productName: v })); setCurrentPage(1); }} placeholder="商品名検索" className="w-56" />
        <FilterSelect value={search.category} onChange={(v) => { setSearch((s) => ({ ...s, category: v })); setCurrentPage(1); }} options={categories.map((c) => ({ value: c, label: c }))} placeholder="カテゴリ" />
        <FilterSelect value={search.status} onChange={(v) => { setSearch((s) => ({ ...s, status: v })); setCurrentPage(1); }} options={statuses.map((s) => ({ value: s, label: s }))} placeholder="状態" />
      </div>

      <DataTable
        columns={columns}
        data={pagedData}
        keyExtractor={(row) => row.priceId}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        pageSize={pageSize}
        currentPage={currentPage}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }}
        emptyMessage="条件に一致する単価がありません"
      />

      {/* Edit Modal */}
      {editingPrice && (
        <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="単価編集" size="lg">
          <form onSubmit={saveEdit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">価格ID</label>
              <input type="text" value={editingPrice.priceId} disabled className="w-full rounded-lg border border-border bg-gray-50 px-3 py-2 text-sm text-muted" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">商品名</label>
              <input type="text" value={editingPrice.productName} onChange={(e) => setEditingPrice({ ...editingPrice, productName: e.target.value })} required className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">カテゴリ</label>
              <select value={editingPrice.category} onChange={(e) => setEditingPrice({ ...editingPrice, category: e.target.value })} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent">
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">価格</label>
              <input type="number" value={editingPrice.price} onChange={(e) => setEditingPrice({ ...editingPrice, price: Number(e.target.value) })} required className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">有効開始日</label>
              <input type="date" value={editingPrice.validFrom} onChange={(e) => setEditingPrice({ ...editingPrice, validFrom: e.target.value })} required className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">有効終了日</label>
              <input type="date" value={editingPrice.validTo} onChange={(e) => setEditingPrice({ ...editingPrice, validTo: e.target.value })} required className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">状態</label>
              <select value={editingPrice.status} onChange={(e) => setEditingPrice({ ...editingPrice, status: e.target.value })} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent">
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
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="単価新規登録" size="lg">
        <form onSubmit={saveNew} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1">価格ID</label>
            <input type="text" value={newPrice.priceId} onChange={(e) => setNewPrice({ ...newPrice, priceId: e.target.value })} required className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">商品名</label>
            <input type="text" value={newPrice.productName} onChange={(e) => setNewPrice({ ...newPrice, productName: e.target.value })} required className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">カテゴリ</label>
            <select value={newPrice.category} onChange={(e) => setNewPrice({ ...newPrice, category: e.target.value })} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent">
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">価格</label>
            <input type="number" value={newPrice.price} onChange={(e) => setNewPrice({ ...newPrice, price: Number(e.target.value) })} required className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">有効開始日</label>
            <input type="date" value={newPrice.validFrom} onChange={(e) => setNewPrice({ ...newPrice, validFrom: e.target.value })} required className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">有効終了日</label>
            <input type="date" value={newPrice.validTo} onChange={(e) => setNewPrice({ ...newPrice, validTo: e.target.value })} required className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
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
