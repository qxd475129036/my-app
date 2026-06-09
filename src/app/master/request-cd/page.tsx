"use client";

import { useState, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DataTable, Column } from "@/app/components/DataTable";
import { SearchInput } from "@/app/components/SearchInput";
import { FilterSelect } from "@/app/components/FilterSelect";
import { Modal } from "@/app/components/Modal";

// ─── Types ──────────────────────────────────────────────────────────────
interface ChargeCd {
  id: string;
  scope: string;           // 適用範囲 (LOB)
  feeTypeCd: string;       // 費用種別コード
  majorCd: string;         // 大分類コード
  mediumCd: string;        // 中分類コード
  itemCd: string;          // 項目コード
  feeType: string;         // 費用種別名
  major: string;           // 大分類名
  medium: string;          // 中分類名
  item: string;            // 項目名
  description: string;     // 内容
  unitPrice: number;       // 単価
  priceUnit: string;       // 単位(単価用)
  inputType: string;       // 入力区分
  taxCode: string;         // 税コード
  returnDiscountFlag: string; // 返還割引フラグ
  gsapAccountCd: string;      // GSAP 勘定科目コード
  hanaAccountCd: string;      // HANA 勘定科目コード
  detailCd: string;            // 細目コード
  optionalWorkFlag: string;    // オプション作業フラグ
  revenueMethod: string;       // 売上計上方法区分
  workTiming: string;          // 作業タイミング
  productSize: string;         // 商品サイズ
  sizeUnit: string;            // 単位(サイズ用)
  extendedStorage: string;     // 延長保管
  packagingSize: string;       // 梱包サイズ
  workDetailCd: string;        // 作業詳細区分
  productCategoryCd: string;   // 商品区分コード
}

// ─── Option arrays ───────────────────────────────────────────────────────
const scopes = ["全店舗", "個別店舗"];
const feeTypes = ["月額利用料", "標準", "オプション", "特別", "割引"];
const feeTypeCds = ["A", "B", "C", "D", "E"];
const majors = [
  "月額利用料調整", "倉庫作業", "出荷作業", "入荷作業", "保管作業",
  "仕分け作業", "梱包作業", "ラベル発行", "返品処理", "その他",
];
const majorCds = ["L98", "L01", "L02", "L03", "L04", "L05", "L06", "L07", "L08", "L99"];
const mediums = [
  "月額利用料調整", "出荷作業", "入荷作業", "保管作業", "仕分け作業",
  "梱包作業", "ピッキング", "検品", "ラベル発行", "その他",
];
const mediumCds = ["M01", "M02", "M03", "M04", "M05", "M06", "M07", "M08", "M09", "M99"];
const items = [
  "月額利用料調整", "出荷作業料", "入荷作業料", "保管料", "仕分け作業料",
  "梱包作業料", "ピッキング料", "検品料", "ラベル発行料", "その他手数料",
  "出荷作業料割引き (ポスト投函)", "特別割引", "数量割引", "長期契約割引",
];
const itemCds = ["S001", "S002", "S003", "S004", "S005", "S006", "S007", "S008", "S009", "S010", "S999"];
const descriptions = [
  "",
  "在庫サイズ極小以外ゆうパケット配送 10 円お値引き",
  "標準保管料金",
  "1ケースあたりのピッキング料金",
  "時間外作業料金",
];
const priceUnits = ["円", "PCS", "ケース", "kg", "個"];
const sizeUnits = ["Pcs", "Kg", "箱", "パレット"];
const inputTypes = ["0: 手入力", "1: 取込", "2: 自動計算"];
const taxCodes = ["UA: 課税売上 10%", "UB: 課税売上 8%", "非課税", "不課税"];
const returnDiscountFlags = ["0: 対象外", "1: 返還", "2: 割引"];
const gsapAccountCds = [
  "40400999: その他売上高他", "40400063: その他売上高物流作業",
  "40400100: 売上高", "40400200: 売上原価",
];
const hanaAccountCds = [
  "4101130001", "4101007001", "4102001001", "4103002001",
];
const detailCds = [
  "1122: 出庫作業", "1123: 入庫作業", "1124: 保管作業", "1125: 梱包作業",
];
const optionalWorkFlags = ["0", "1"];
const revenueMethods = [
  "01: 売上計上", "02: 未収計上", "03: 作業実績", "04: 請求計上",
];
const workTimings = [
  "11220: 出庫作業 (ピッキング)", "11230: 入庫作業", "11240: 保管作業",
  "11250: 梱包作業", "11260: ラベル発行",
];
const productSizes = [
  "", "100: サイズ極小", "101: サイズ小", "102: サイズ中",
  "103: サイズ大", "104: サイズ特大", "105: サイズ特大",
];
const packagingSizes = ["", "S", "M", "L", "LL", "3L"];
const workDetailCds = [
  "11220: 出庫作業 (ピッキング)", "11230: 入庫作業", "11240: 保管作業",
];
const productCategoryCds = [
  "P999: 商品サイズ共通", "P001: 食品", "P002: 飲料", "P003: 雑貨", "P004: 日用品",
];

const pick = <T,>(arr: T[], i: number): T => arr[i % arr.length];

const generateMockData = (): ChargeCd[] => {
  const data: ChargeCd[] = [];
  for (let i = 1; i <= 10000; i++) {
    data.push({
      id: `CC${String(i).padStart(5, "0")}`,
      scope: `${(i % 2) + 1}: ${scopes[i % scopes.length]}`,
      feeTypeCd: pick(feeTypeCds, i),
      majorCd: pick(majorCds, i),
      mediumCd: pick(mediumCds, i),
      itemCd: pick(itemCds, i),
      feeType: pick(feeTypes, i),
      major: pick(majors, i),
      medium: pick(mediums, i),
      item: pick(items, i),
      description: pick(descriptions, i),
      unitPrice: (i * 50) % 10000,
      priceUnit: pick(priceUnits, i),
      inputType: pick(inputTypes, i),
      taxCode: pick(taxCodes, i),
      returnDiscountFlag: pick(returnDiscountFlags, i),
      gsapAccountCd: pick(gsapAccountCds, i),
      hanaAccountCd: pick(hanaAccountCds, i),
      detailCd: pick(detailCds, i),
      optionalWorkFlag: pick(optionalWorkFlags, i),
      revenueMethod: pick(revenueMethods, i),
      workTiming: pick(workTimings, i),
      productSize: pick(productSizes, i),
      sizeUnit: pick(sizeUnits, i),
      extendedStorage: `${i % 2 === 0 ? "可能" : "不可"}`,
      packagingSize: pick(packagingSizes, i),
      workDetailCd: pick(workDetailCds, i),
      productCategoryCd: pick(productCategoryCds, i),
    });
  }
  return data;
};

const formatPrice = (v: number) => v.toLocaleString() + " 円";

export default function RequestCdListPage() {
  const { status: authStatus } = useSession();
  const router = useRouter();

  useMemo(() => {
    if (authStatus === "unauthenticated") router.push("/login");
  }, [authStatus, router]);

  const [allData] = useState<ChargeCd[]>(generateMockData);

  const [search, setSearch] = useState({ scope: "", feeType: "", chargeCd: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ChargeCd | null>(null);
  const [newItem, setNewItem] = useState<ChargeCd | null>(null);

  // ── Filter & pagination ──
  const filteredData = useMemo(() => {
    return allData.filter((row) => {
      if (search.scope && !row.scope.includes(search.scope)) return false;
      if (search.feeType && row.feeType !== search.feeType) return false;
      if (search.chargeCd) {
        const code = `${row.feeTypeCd}-${row.majorCd}-${row.mediumCd}-${row.itemCd}`;
        if (!code.toLowerCase().includes(search.chargeCd.toLowerCase())) return false;
      }
      return true;
    });
  }, [allData, search]);

  const totalItems = filteredData.length;
  const pagedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // ── CRUD ──
  const [data, setData] = useState<ChargeCd[]>([]);

  // Populate data from allData on mount
  useMemo(() => {
    if (data.length === 0 && allData.length > 0) setData(allData);
  }, [allData, data.length]);

  const openEdit = (item: ChargeCd) => {
    setEditingItem({ ...item });
    setEditModalOpen(true);
  };

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setData((prev) => prev.map((r) => (r.id === editingItem.id ? editingItem : r)));
    setEditModalOpen(false);
    setEditingItem(null);
  };

  const openCreate = () => {
    setNewItem({
      id: `CC${String(Date.now()).slice(-5)}`,
      scope: "", feeTypeCd: "", majorCd: "", mediumCd: "", itemCd: "",
      feeType: "", major: "", medium: "", item: "", description: "",
      unitPrice: 0, priceUnit: "", inputType: "", taxCode: "",
      returnDiscountFlag: "", gsapAccountCd: "", hanaAccountCd: "",
      detailCd: "", optionalWorkFlag: "", revenueMethod: "",
      workTiming: "", productSize: "", sizeUnit: "", extendedStorage: "",
      packagingSize: "", workDetailCd: "", productCategoryCd: "",
    });
    setCreateModalOpen(true);
  };

  const saveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem) return;
    setData((prev) => [...prev, newItem]);
    setCreateModalOpen(false);
    setNewItem(null);
  };

  // ── Columns ──
  const columns: Column<ChargeCd>[] = [
    {
      key: "actions", label: "更新",
      render: (row) => (
        <button onClick={() => openEdit(row)} className="text-accent hover:text-accent-hover text-xs font-medium transition-colors">
          編集
        </button>
      ),
    },
    { key: "scope", label: "適用範囲", width: "100px" },
    {
      key: "chargeCd", label: "請求コード", width: "180px",
      render: (row) => {
        const code = `${row.feeTypeCd}-${row.majorCd}-${row.mediumCd}-${row.itemCd}`;
        return <code className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded">{code}</code>;
      },
    },
    { key: "feeType", label: "費用種別", width: "100px" },
    { key: "major", label: "大分類", width: "120px" },
    { key: "medium", label: "中分類", width: "120px" },
    { key: "item", label: "項目", width: "120px" },
    { key: "description", label: "内容", width: "220px" },
    {
      key: "unitPrice", label: "単価", width: "90px", align: "right",
      render: (row) => <span className="font-medium tabular-nums">{formatPrice(row.unitPrice)}</span>,
    },
    { key: "priceUnit", label: "単位", width: "80px" },
    { key: "inputType", label: "入力区分", width: "100px" },
    { key: "taxCode", label: "税コード", width: "140px" },
    { key: "returnDiscountFlag", label: "返還割引フラグ", width: "140px" },
    { key: "gsapAccountCd", label: "GSAP 勘定科目コード", width: "170px" },
    { key: "hanaAccountCd", label: "HANA 勘定科目コード", width: "150px" },
    { key: "detailCd", label: "細目コード", width: "100px" },
    { key: "optionalWorkFlag", label: "オプション作業フラグ", width: "150px" },
    { key: "revenueMethod", label: "売上計上方法区分", width: "160px" },
    { key: "workTiming", label: "作業タイミング", width: "160px" },
    { key: "productSize", label: "商品サイズ", width: "120px" },
    { key: "sizeUnit", label: "単位", width: "80px" },
    { key: "extendedStorage", label: "延長保管", width: "110px" },
    { key: "packagingSize", label: "梱包サイズ", width: "100px" },
    { key: "workDetailCd", label: "作業詳細区分", width: "160px" },
    { key: "productCategoryCd", label: "商品区分コード", width: "160px" },
  ];

  // ── Render helpers for the form ──
  const renderField = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    options?: string[],
  ) => (
    <div>
      <label className="block text-xs font-medium text-muted mb-1">{label}</label>
      {options ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
        >
          <option value="">--</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
        />
      )}
    </div>
  );

  const renderEditForm = (
    item: ChargeCd,
    setItem: React.Dispatch<React.SetStateAction<ChargeCd | null>>,
  ) => {
    if (!item) return null;
    const u = (key: keyof ChargeCd) => (v: string) => setItem({ ...item, [key]: v });

    return (
      <div className="grid grid-cols-3 gap-4">
        {renderField("適用範囲", item.scope, u("scope"), scopes.map((s, i) => `${i + 1}: ${s}`))}
        {renderField("費用種別コード", item.feeTypeCd, u("feeTypeCd"), feeTypeCds)}
        {renderField("大分類コード", item.majorCd, u("majorCd"), majorCds)}
        {renderField("中分類コード", item.mediumCd, u("mediumCd"), mediumCds)}
        {renderField("項目コード", item.itemCd, u("itemCd"), itemCds)}
        {renderField("費用種別", item.feeType, u("feeType"), feeTypes)}
        {renderField("大分類", item.major, u("major"), majors)}
        {renderField("中分類", item.medium, u("medium"), mediums)}
        {renderField("項目", item.item, u("item"), items)}
        {renderField("内容", item.description, u("description"), descriptions)}
        {renderField("単価", String(item.unitPrice), (v) => setItem({ ...item, unitPrice: Number(v) || 0 }))}
        {renderField("単位", item.priceUnit, u("priceUnit"), priceUnits)}
        {renderField("入力区分", item.inputType, u("inputType"), inputTypes)}
        {renderField("税コード", item.taxCode, u("taxCode"), taxCodes)}
        {renderField("返還割引フラグ", item.returnDiscountFlag, u("returnDiscountFlag"), returnDiscountFlags)}
        {renderField("GSAP 勘定科目コード", item.gsapAccountCd, u("gsapAccountCd"), gsapAccountCds)}
        {renderField("HANA 勘定科目コード", item.hanaAccountCd, u("hanaAccountCd"), hanaAccountCds)}
        {renderField("細目コード", item.detailCd, u("detailCd"), detailCds)}
        {renderField("オプション作業フラグ", item.optionalWorkFlag, u("optionalWorkFlag"), optionalWorkFlags)}
        {renderField("売上計上方法区分", item.revenueMethod, u("revenueMethod"), revenueMethods)}
        {renderField("作業タイミング", item.workTiming, u("workTiming"), workTimings)}
        {renderField("商品サイズ", item.productSize, u("productSize"), productSizes)}
        {renderField("単位(サイズ)", item.sizeUnit, u("sizeUnit"), sizeUnits)}
        {renderField("延長保管", item.extendedStorage, u("extendedStorage"))}
        {renderField("梱包サイズ", item.packagingSize, u("packagingSize"), packagingSizes)}
        {renderField("作業詳細区分", item.workDetailCd, u("workDetailCd"), workDetailCds)}
        {renderField("商品区分コード", item.productCategoryCd, u("productCategoryCd"), productCategoryCds)}
      </div>
    );
  };

  // ── Render ──
  return (
    <div className="w-full px-8 py-4">
      <h1 className="text-2xl font-bold text-foreground mb-6">Master管理 / 請求コード管理</h1>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <FilterSelect
          value={search.scope}
          onChange={(v) => { setSearch((s) => ({ ...s, scope: v })); setCurrentPage(1); }}
          options={scopes.map((s, i) => ({ value: `${i + 1}: ${s}`, label: `${i + 1}: ${s}` }))}
          placeholder="適用範囲"
        />
        <FilterSelect
          value={search.feeType}
          onChange={(v) => { setSearch((s) => ({ ...s, feeType: v })); setCurrentPage(1); }}
          options={feeTypes.map((t) => ({ value: t, label: t }))}
          placeholder="費用種別"
        />
        <SearchInput
          value={search.chargeCd}
          onChange={(v) => { setSearch((s) => ({ ...s, chargeCd: v })); setCurrentPage(1); }}
          placeholder="請求コード検索"
          className="w-52"
        />
        <button
          onClick={openCreate}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新規登録
        </button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={pagedData}
        keyExtractor={(row) => row.id}
        selectable={false}
        pageSize={pageSize}
        currentPage={currentPage}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }}
        emptyMessage="条件に一致する請求コードがありません"
        wrapHeaders
        rowNumber
      />

      {/* ── Edit Modal ── */}
      {editingItem && (
        <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="請求コード編集" size="2xl">
          <form onSubmit={saveEdit}>
            {renderEditForm(editingItem, setEditingItem)}
            <div className="flex justify-end gap-2 pt-4 border-t border-border mt-4">
              <button type="button" onClick={() => setEditModalOpen(false)} className="rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-gray-50 transition-colors">取消</button>
              <button type="submit" className="rounded-lg bg-accent px-4 py-2 text-sm text-white hover:bg-accent-hover transition-colors">保存</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Create Modal ── */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="請求コード新規登録" size="2xl">
        <form onSubmit={saveNew}>
          {newItem && renderEditForm(newItem, setNewItem)}
          <div className="flex justify-end gap-2 pt-4 border-t border-border mt-4">
            <button type="button" onClick={() => setCreateModalOpen(false)} className="rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-gray-50 transition-colors">取消</button>
            <button type="submit" className="rounded-lg bg-accent px-4 py-2 text-sm text-white hover:bg-accent-hover transition-colors">登録</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
