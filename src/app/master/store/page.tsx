"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DataTable, Column } from "@/app/components/DataTable";
import { SearchInput } from "@/app/components/SearchInput";
import { FilterSelect } from "@/app/components/FilterSelect";
import { Modal } from "@/app/components/Modal";
import { StatusBadge } from "@/app/components/StatusBadge";

// ─── Types ───────────────────────────────────────────────────────
interface LobAssignment {
  lob: string;
  base: string;
  floor: string;
}

interface Store {
  // Tab 1: 基本信息
  storeCd: string;
  honorific: string;
  storeUrl: string;
  companyNameEn: string;
  companyShortName: string;
  companyName: string;
  departmentContact: string;
  countryCode: string;
  regionCode: string;
  postalCode: string;
  address1: string;
  address2: string;
  address3: string;
  phone: string;

  // Tab 2: 管理情報
  lobAssignments: LobAssignment[];
  customerCode: string;
  serviceStatus: string;
  monthlyStorageUnitPrice: string;
  longTermStorageUnitPrice: string;
  marketCoordCustomerCode: string;

  // Tab 3: 配送管理
  jpDeliveryCategory: string;
  sagawaDeliveryCategory: string;

  // Tab 4: 代引精算情報
  codFee: string;
  sapJournalFlag: string;
}

// ─── Option arrays ───────────────────────────────────────────────
const honorifics = ["御中", "様", "殿"];
const countryCodes = ["日本国", "その他"];
const regionCodes = ["その他", "北海道", "東北", "関東", "中部", "近畿", "中国", "四国", "九州"];
const lobOptions = ["RSL", "RSL(1stParty)", "RSL(佐川)", "サテライトRSL", "BOOKS"];
const bases = ["市川Ⅱ", "東京", "大阪", "名古屋", "福岡"];
const floors = ["1F", "2F", "3F", "B1F"];
const serviceStatuses = ["稼働", "停止", "休止"];
const jpDeliveryCategories = ["設定不要", "通常", "時間指定"];
const sagawaDeliveryCategories = ["設定不要", "通常", "時間指定"];
const sapJournalFlags = ["出力する", "出力しない"];
const address1Hints = "都道府県･市区町村";
const address2Hints = "町名･番地";
const address3Hints = "建物名";

const companyNames = [
  "株式会社山田商事", "有限会社佐藤物産", "株式会社鈴木産業",
  "株式会社高橋貿易", "田中工業株式会社", "株式会社伊藤商会",
  "渡辺輸送株式会社", "株式会社中村商店", "小林物流株式会社",
  "株式会社加藤製作所", "吉田運輸株式会社", "株式会社山本興業",
];
const companyShortNames = [
  "山田商事", "佐藤物産", "鈴木産業", "高橋貿易", "田中工業",
  "伊藤商会", "渡辺輸送", "中村商店", "小林物流", "加藤製作所",
  "吉田運輸", "山本興業",
];
const companyNameEns = [
  "YAMADA SHOJI CO.,LTD.", "SATO BUSSAN CO.,LTD.", "SUZUKI SANGYO CO.,LTD.",
  "TAKAHASHI BOEKI CO.,LTD.", "TANAKA KOGYO CO.,LTD.", "ITO SHOKAI CO.,LTD.",
  "WATANABE YUSO CO.,LTD.", "NAKAMURA SHOTEN CO.,LTD.", "KOBAYASHI BUTSURYU CO.,LTD.",
  "KATO SEISAKUSHO CO.,LTD.", "YOSHIDA UNYU CO.,LTD.", "YAMAMOTO KOGYO CO.,LTD.",
];
const cities = [
  "東京都千代田区", "東京都中央区", "東京都港区", "大阪市北区",
  "大阪市中央区", "名古屋市中区", "福岡市博多区", "札幌市中央区",
  "仙台市青葉区", "広島市中区", "神戸市中央区", "京都市中京区",
];
const streets = [
  "丸の内1-1-1", "日本橋2-2-2", "虎ノ門3-3-3", "梅田4-4-4",
  "本町5-5-5", "栄6-6-6", "博多駅前7-7-7", "大通8-8-8",
  "一番町9-9-9", "紙屋町10-10-10", "三宮11-11-11", "四条河原町12-12-12",
];
const buildings = [
  "山田ビル5F", "佐藤ビル3F", "鈴木ビル8F", "駅前プラザ2F",
  "中央ビル6F", "栄タワー10F", "博多センタービル4F", "大通ビル7F",
  "一番町スクエア9F", "紙屋町ビル3F", "三宮東ビル5F", "四条ビル6F",
];

const departments = [
  "営業部 田中", "総務部 佐藤", "事業企画部 鈴木",
  "物流部 高橋", "購買部 渡辺", "経理部 伊藤",
];

// ─── Mock data generator ──────────────────────────────────────────
const generateTestStores = (): Store[] => {
  const stores: Store[] = [];
  for (let i = 1; i <= 10000; i++) {
    const ci = i % companyNames.length;
    const assignCount = (i % 2) + 1; // 1-2 assignments per store
    const assignments: LobAssignment[] = [];
    const usedLobs = new Set<string>();
    for (let j = 0; j < assignCount; j++) {
      const lobIdx = ((i * (j + 1)) * 7 + j * 3) % lobOptions.length;
      const lob = lobOptions[lobIdx];
      if (!usedLobs.has(lob)) {
        usedLobs.add(lob);
        assignments.push({
          lob,
          base: bases[((i + j) * 3) % bases.length],
          floor: floors[((i + j) * 5) % floors.length],
        });
      }
    }

    stores.push({
      storeCd: `STORE${String(i).padStart(5, "0")}`,
      honorific: honorifics[0],
      storeUrl: `https://shop${i}.example.com`,
      companyNameEn: companyNameEns[ci],
      companyShortName: companyShortNames[ci],
      companyName: companyNames[ci],
      departmentContact: departments[i % departments.length],
      countryCode: countryCodes[0],
      regionCode: regionCodes[i % regionCodes.length],
      postalCode: String(1000000 + i).slice(0, 7),
      address1: cities[i % cities.length],
      address2: streets[i % streets.length],
      address3: buildings[i % buildings.length],
      phone: `0${String(3 + (i % 10))}-${String(1000 + i).slice(0, 4)}-${String(2000 + i).slice(0, 4)}`,

      lobAssignments: assignments,
      customerCode: `CUST${String(i).padStart(5, "0")}`,
      serviceStatus: serviceStatuses[i % serviceStatuses.length],
      monthlyStorageUnitPrice: "7.5",
      longTermStorageUnitPrice: "23",
      marketCoordCustomerCode: `MKT${String(i).padStart(5, "0")}`,

      jpDeliveryCategory: "設定不要",
      sagawaDeliveryCategory: "設定不要",

      codFee: "300",
      sapJournalFlag: sapJournalFlags[i % sapJournalFlags.length],
    });
  }
  return stores;
};

const initialStores: Store[] = generateTestStores();

// ─── Helpers ──────────────────────────────────────────────────────
const statusVariant = (s: string): "success" | "warning" | "danger" | "default" => {
  if (s === "稼働") return "success";
  if (s === "停止") return "warning";
  if (s === "休止") return "warning";
  return "default";
};

// ─── LOB color mapping ──────────────────────────────────────────
const lobColors: Record<string, string> = {
  "RSL": "bg-blue-50 text-blue-700",
  "RSL(1stParty)": "bg-indigo-50 text-indigo-700",
  "RSL(佐川)": "bg-purple-50 text-purple-700",
  "サテライトRSL": "bg-emerald-50 text-emerald-700",
  "BOOKS": "bg-amber-50 text-amber-700",
};
const defaultLobColor = "bg-gray-50 text-gray-700";

// ─── Shared input classes ────────────────────────────────────────
const inputCls =
  "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors";
const inputDisabledCls =
  "w-full rounded-lg border border-border bg-gray-50 px-3 py-2 text-sm text-muted focus:outline-none transition-colors";
const labelCls = "block text-xs font-medium text-muted mb-1";

// ─── Reusable field renderers ─────────────────────────────────────
function TextField({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}) {
  return (
    <div>
      <label className={labelCls}>
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={disabled ? inputDisabledCls : inputCls}
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  required?: boolean;
}) {
  return (
    <div>
      <label className={labelCls}>
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─── Tab bar ──────────────────────────────────────────────────────
const tabs = ["基本信息", "管理情報", "配送管理", "代引精算情報"];

function TabBar({
  active,
  onChange,
}: {
  active: number;
  onChange: (i: number) => void;
}) {
  return (
    <div className="flex border-b border-border mb-5 -mx-6 px-6">
      {tabs.map((label, i) => (
        <button
          key={label}
          type="button"
          onClick={() => onChange(i)}
          className={`relative px-4 py-3 text-sm font-medium transition-colors ${
            active === i
              ? "text-accent after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-accent"
              : "text-muted hover:text-foreground"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── LOB Assignment Editor ────────────────────────────────────────
function LobAssignmentsEditor({
  assignments,
  onChange,
}: {
  assignments: LobAssignment[];
  onChange: (v: LobAssignment[]) => void;
}) {
  const update = (index: number, field: keyof LobAssignment, value: string) => {
    const next = assignments.map((a, i) =>
      i === index ? { ...a, [field]: value } : a
    );
    onChange(next);
  };

  const remove = (index: number) => {
    onChange(assignments.filter((_, i) => i !== index));
  };

  const add = () => {
    const used = new Set(assignments.map((a) => a.lob));
    const nextLob = lobOptions.find((l) => !used.has(l)) ?? lobOptions[0];
    onChange([...assignments, { lob: nextLob, base: bases[0], floor: floors[0] }]);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className={labelCls}>
          LOB区分 <span className="text-red-500 ml-0.5">*</span>
          <span className="text-muted font-normal ml-1 text-[10px]">
            （1 LOBにつき1拠点・1フロア）
          </span>
        </label>
      </div>

      {/* Header row */}
      <div className="hidden md:grid grid-cols-[1fr_1fr_1fr_32px] gap-3 mb-1 px-3">
        <span className="text-[11px] font-medium text-muted">LOB</span>
        <span className="text-[11px] font-medium text-muted">拠点</span>
        <span className="text-[11px] font-medium text-muted">フロア</span>
        <span />
      </div>

      <div className="space-y-2">
        {assignments.map((a, i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_1fr_1fr_32px] gap-3 items-center rounded-lg border border-border bg-white px-3 py-2"
          >
            <select
              value={a.lob}
              onChange={(e) => update(i, "lob", e.target.value)}
              className="w-full border-0 bg-transparent text-sm text-foreground focus:outline-none cursor-pointer"
            >
              {lobOptions.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            <select
              value={a.base}
              onChange={(e) => update(i, "base", e.target.value)}
              className="w-full border-0 bg-transparent text-sm text-foreground focus:outline-none cursor-pointer"
            >
              {bases.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            <select
              value={a.floor}
              onChange={(e) => update(i, "floor", e.target.value)}
              className="w-full border-0 bg-transparent text-sm text-foreground focus:outline-none cursor-pointer"
            >
              {floors.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => remove(i)}
              disabled={assignments.length <= 1}
              className="flex items-center justify-center w-7 h-7 rounded-md text-muted hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={add}
        disabled={assignments.length >= lobOptions.length}
        className="mt-2 inline-flex items-center gap-1 text-xs text-accent hover:text-accent-hover font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        LOB割当を追加
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────
export default function StorePage() {
  const { status: authStatus } = useSession();
  const router = useRouter();

  useMemo(() => {
    if (authStatus === "unauthenticated") router.push("/login");
  }, [authStatus, router]);

  // ── Search / Filter ──
  const [search, setSearch] = useState({
    storeCd: "",
    companyName: "",
    lob: "",
    base: "",
    serviceStatus: "",
  });

  // ── Data ──
  const [stores, setStores] = useState<Store[]>(initialStores);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ── Modal state ──
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [editTab, setEditTab] = useState(0);
  const [createTab, setCreateTab] = useState(0);

  const emptyStore = (): Store => ({
    storeCd: "",
    honorific: "御中",
    storeUrl: "",
    companyNameEn: "",
    companyShortName: "",
    companyName: "",
    departmentContact: "",
    countryCode: "日本国",
    regionCode: "その他",
    postalCode: "",
    address1: "",
    address2: "",
    address3: "",
    phone: "",

    lobAssignments: [{ lob: "RSL", base: "市川Ⅱ", floor: "2F" }],
    customerCode: "",
    serviceStatus: "稼働",
    monthlyStorageUnitPrice: "7.5",
    longTermStorageUnitPrice: "23",
    marketCoordCustomerCode: "",

    jpDeliveryCategory: "設定不要",
    sagawaDeliveryCategory: "設定不要",

    codFee: "300",
    sapJournalFlag: "出力する",
  });

  const [newStore, setNewStore] = useState<Store>(emptyStore());

  // ── Filtered data ──
  const filteredData = useMemo(() => {
    return stores.filter((s) => {
      if (
        search.storeCd &&
        !s.storeCd.toLowerCase().includes(search.storeCd.toLowerCase())
      )
        return false;
      if (
        search.companyName &&
        !s.companyName.includes(search.companyName)
      )
        return false;
      if (
        search.lob &&
        !s.lobAssignments.some((a) => a.lob === search.lob)
      )
        return false;
      if (
        search.base &&
        !s.lobAssignments.some((a) => a.base === search.base)
      )
        return false;
      if (search.serviceStatus && s.serviceStatus !== search.serviceStatus)
        return false;
      return true;
    });
  }, [stores, search]);

  const totalItems = filteredData.length;

  // ── Handlers ──
  const openEdit = (store: Store) => {
    setEditingStore({
      ...store,
      lobAssignments: store.lobAssignments.map((a) => ({ ...a })),
    });
    setEditTab(0);
    setEditModalOpen(true);
  };
  const openCreate = () => {
    setNewStore(emptyStore());
    setCreateTab(0);
    setCreateModalOpen(true);
  };

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStore) return;
    setStores((prev) =>
      prev.map((s) => (s.storeCd === editingStore.storeCd ? editingStore : s))
    );
    setEditModalOpen(false);
  };

  const saveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (stores.some((s) => s.storeCd === newStore.storeCd))
      return alert("店舗コードが既に存在します");
    setStores((prev) => [...prev, newStore]);
    setCreateModalOpen(false);
  };

  // ── Columns ──
  const columns: Column<Store>[] = [
    { key: "storeCd", label: "店舗コード", sortable: true },
    { key: "companyName", label: "会社名", sortable: true },
    {
      key: "lobAssignments",
      label: "LOB区分",
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.lobAssignments.map((a, i) => (
            <span
              key={i}
              className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium whitespace-nowrap ${lobColors[a.lob] ?? defaultLobColor}`}
              title={`${a.lob} @ ${a.base} ${a.floor}`}
            >
              {a.lob} @ {a.base} ({a.floor})
            </span>
          ))}
        </div>
      ),
    },
    {
      key: "serviceStatus",
      label: "サービス利用状態",
      sortable: true,
      render: (row) => (
        <StatusBadge
          label={row.serviceStatus}
          variant={statusVariant(row.serviceStatus)}
        />
      ),
    },
    { key: "monthlyStorageUnitPrice", label: "保管月単価", sortable: true },
    { key: "marketCoordCustomerCode", label: "市場連携顧客コード" },
    {
      key: "actions",
      label: "操作",
      render: (row) => (
        <button
          onClick={() => openEdit(row)}
          className="text-accent hover:text-accent-hover text-xs font-medium"
        >
          編集
        </button>
      ),
    },
  ];

  // ── Tab content renderers ──
  const renderBasicInfo = (
    store: Store,
    setter: (s: Store) => void,
    isNew: boolean
  ) => {
    const updater =
      <K extends keyof Store>(key: K) =>
      (v: Store[K]) =>
        setter({ ...store, [key]: v });

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TextField
          label="店舗コード"
          value={store.storeCd}
          onChange={updater("storeCd")}
          required
          disabled={!isNew}
        />
        <SelectField
          label="敬称"
          value={store.honorific}
          onChange={updater("honorific")}
          options={honorifics}
          required
        />
        <TextField
          label="店舗URL"
          value={store.storeUrl}
          onChange={updater("storeUrl")}
          placeholder="https://"
          required
        />
        <TextField
          label="企業名(半角)"
          value={store.companyNameEn}
          onChange={updater("companyNameEn")}
          required
        />
        <TextField
          label="会社名略称"
          value={store.companyShortName}
          onChange={updater("companyShortName")}
          required
        />
        <TextField
          label="会社名"
          value={store.companyName}
          onChange={updater("companyName")}
          required
        />
        <TextField
          label="部署名/担当者名"
          value={store.departmentContact}
          onChange={updater("departmentContact")}
        />
        <SelectField
          label="国コード"
          value={store.countryCode}
          onChange={updater("countryCode")}
          options={countryCodes}
          required
        />
        <SelectField
          label="地域コード"
          value={store.regionCode}
          onChange={updater("regionCode")}
          options={regionCodes}
          required
        />
        <TextField
          label="郵便番号"
          value={store.postalCode}
          onChange={updater("postalCode")}
          placeholder="ハイフンなし"
          required
        />
        <TextField
          label="住所1"
          value={store.address1}
          onChange={updater("address1")}
          placeholder={address1Hints}
          required
        />
        <TextField
          label="住所2"
          value={store.address2}
          onChange={updater("address2")}
          placeholder={address2Hints}
          required
        />
        <TextField
          label="住所3"
          value={store.address3}
          onChange={updater("address3")}
          placeholder={address3Hints}
        />
        <TextField
          label="電話番号"
          value={store.phone}
          onChange={updater("phone")}
          required
        />
      </div>
    );
  };

  const renderManagementInfo = (
    store: Store,
    setter: (s: Store) => void
  ) => {
    const updater =
      <K extends keyof Store>(key: K) =>
      (v: Store[K]) =>
        setter({ ...store, [key]: v });

    return (
      <div className="space-y-5">
        {/* LOB assignments — standalone block */}
        <div className="rounded-lg border border-border bg-gray-50/40 p-4">
          <LobAssignmentsEditor
            assignments={store.lobAssignments}
            onChange={updater("lobAssignments")}
          />
        </div>

        {/* Other management fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TextField
            label="得意先コード"
            value={store.customerCode}
            onChange={updater("customerCode")}
          />
          <SelectField
            label="サービス利用状態"
            value={store.serviceStatus}
            onChange={updater("serviceStatus")}
            options={serviceStatuses}
            required
          />
          <TextField
            label="保管月単価"
            value={store.monthlyStorageUnitPrice}
            onChange={updater("monthlyStorageUnitPrice")}
            required
          />
          <TextField
            label="長期保管月単価"
            value={store.longTermStorageUnitPrice}
            onChange={updater("longTermStorageUnitPrice")}
          />
          <TextField
            label="市場連携顧客コード"
            value={store.marketCoordCustomerCode}
            onChange={updater("marketCoordCustomerCode")}
          />
        </div>
      </div>
    );
  };

  const renderDelivery = (
    store: Store,
    setter: (s: Store) => void
  ) => {
    const updater =
      <K extends keyof Store>(key: K) =>
      (v: Store[K]) =>
        setter({ ...store, [key]: v });

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelectField
          label="JP配送区分"
          value={store.jpDeliveryCategory}
          onChange={updater("jpDeliveryCategory")}
          options={jpDeliveryCategories}
          required
        />
        <SelectField
          label="佐川配送区分"
          value={store.sagawaDeliveryCategory}
          onChange={updater("sagawaDeliveryCategory")}
          options={sagawaDeliveryCategories}
          required
        />
      </div>
    );
  };

  const renderCodInfo = (
    store: Store,
    setter: (s: Store) => void
  ) => {
    const updater =
      <K extends keyof Store>(key: K) =>
      (v: Store[K]) =>
        setter({ ...store, [key]: v });

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TextField
          label="代引手数料"
          value={store.codFee}
          onChange={updater("codFee")}
          required
        />
        <SelectField
          label="SAP仕訳フラグ"
          value={store.sapJournalFlag}
          onChange={updater("sapJournalFlag")}
          options={sapJournalFlags}
          required
        />
      </div>
    );
  };

  // ── Render ──
  return (
    <div className="w-full px-8 py-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          Master管理 / 店铺管理
        </h1>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          新規登録
        </button>
      </div>

      {/* Search filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <SearchInput
          value={search.storeCd}
          onChange={(v) => {
            setSearch((s) => ({ ...s, storeCd: v }));
            setCurrentPage(1);
          }}
          placeholder="店舗コード検索"
          className="w-48"
        />
        <SearchInput
          value={search.companyName}
          onChange={(v) => {
            setSearch((s) => ({ ...s, companyName: v }));
            setCurrentPage(1);
          }}
          placeholder="会社名検索"
          className="w-48"
        />
        <FilterSelect
          value={search.lob}
          onChange={(v) => {
            setSearch((s) => ({ ...s, lob: v }));
            setCurrentPage(1);
          }}
          options={lobOptions.map((r) => ({ value: r, label: r }))}
          placeholder="LOB"
        />
        <FilterSelect
          value={search.base}
          onChange={(v) => {
            setSearch((s) => ({ ...s, base: v }));
            setCurrentPage(1);
          }}
          options={bases.map((r) => ({ value: r, label: r }))}
          placeholder="拠点"
        />
        <FilterSelect
          value={search.serviceStatus}
          onChange={(v) => {
            setSearch((s) => ({ ...s, serviceStatus: v }));
            setCurrentPage(1);
          }}
          options={serviceStatuses.map((s) => ({ value: s, label: s }))}
          placeholder="サービス利用状態"
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        keyExtractor={(row) => row.storeCd}
        pageSize={pageSize}
        currentPage={currentPage}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onPageSizeChange={(s) => {
          setPageSize(s);
          setCurrentPage(1);
        }}
        emptyMessage="条件に一致する店铺がありません"
      />

      {/* ── Edit Modal ── */}
      {editingStore && (
        <Modal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title="店铺編集"
          size="2xl"
        >
          <TabBar active={editTab} onChange={setEditTab} />
          <form onSubmit={saveEdit}>
            <div className="h-[360px] overflow-y-auto -mx-6 px-6">
              {editTab === 0 && renderBasicInfo(editingStore, setEditingStore, false)}
              {editTab === 1 && renderManagementInfo(editingStore, setEditingStore)}
              {editTab === 2 && renderDelivery(editingStore, setEditingStore)}
              {editTab === 3 && renderCodInfo(editingStore, setEditingStore)}
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-border mt-4">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="rounded-lg bg-accent px-4 py-2 text-sm text-white hover:bg-accent-hover transition-colors"
              >
                保存
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Create Modal ── */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="店铺新規登録"
        size="2xl"
      >
        <TabBar active={createTab} onChange={setCreateTab} />
        <form onSubmit={saveNew}>
          <div className="h-[360px] overflow-y-auto -mx-6 px-6">
            {createTab === 0 && renderBasicInfo(newStore, setNewStore, true)}
            {createTab === 1 && renderManagementInfo(newStore, setNewStore)}
            {createTab === 2 && renderDelivery(newStore, setNewStore)}
            {createTab === 3 && renderCodInfo(newStore, setNewStore)}
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-border mt-4">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="rounded-lg bg-accent px-4 py-2 text-sm text-white hover:bg-accent-hover transition-colors"
            >
              登録
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
