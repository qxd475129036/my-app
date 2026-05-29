# DataTable コンポーネント

DataTable は汎用のテーブル表示コンポーネント。ソート、選択、ページネーション、展開行、列幅自動調整をサポートする。

---

## インポート

```tsx
import { DataTable, Column } from "@/app/components/DataTable";
```

---

## 基本の型

### `Column<T>`

| プロパティ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `key` | `string` | ✅ | データのプロパティ名 |
| `label` | `string` | ✅ | ヘッダーに表示するテキスト |
| `sortable` | `boolean` | — | ソート可能にする（デフォルト: `false`） |
| `render` | `(row: T) => React.ReactNode` | — | カスタムセルレンダリング |
| `width` | `string` | — | 明示的な列幅（CSS値、例: `"120px"`） |
| `align` | `"left" \| "center" \| "right"` | — | セルの横揃え（デフォルト: `"left"`） |

### `DataTableProps<T>`

| プロパティ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `columns` | `Column<T>[]` | ✅ | 列定義の配列 |
| `data` | `T[]` | ✅ | 表示するデータ配列 |
| `keyExtractor` | `(row: T) => string` | ✅ | 各行の一意なキーを取得する関数 |
| `selectable` | `boolean` | — | チェックボックス列を表示（デフォルト: `false`） |
| `selectedIds` | `Set<string>` | — | 選択状態（外部制御時） |
| `onSelectionChange` | `(ids: Set<string>) => void` | — | 選択変更時のコールバック |
| `onSort` | `(key: string, direction: "asc" \| "desc") => void` | — | ソート時のコールバック（外部制御時） |
| `sortKey` | `string` | — | 現在のソートキー（外部制御時） |
| `sortDirection` | `"asc" \| "desc"` | — | 現在のソート方向（外部制御時） |
| `emptyMessage` | `string` | — | 空データ時のメッセージ（デフォルト: `"データがありません"`） |
| `loading` | `boolean` | — | ローディング表示（デフォルト: `false`） |
| `pageSize` | `number` | — | 1ページあたりの件数（指定でページネーション有効化） |
| `currentPage` | `number` | — | 現在のページ番号（1始まり） |
| `totalItems` | `number` | — | 全データ件数 |
| `onPageChange` | `(page: number) => void` | — | ページ変更時のコールバック |
| `onPageSizeChange` | `(size: number) => void` | — | ページサイズ変更時のコールバック |
| `pagination` | `boolean` | — | ページネーションを表示するかどうか（デフォルト: `true`）。`false` にするとページネーションUIを非表示にする |
| `expandedContent` | `(row: T) => React.ReactNode` | — | 展開行の内容を返す関数 |
| `rowNumber` | `boolean` | — | 行番号列を表示する（デフォルト: `true`） |
| `rowNumberOffset` | `number` | — | 行番号の開始オフセット。ページネーション時の2ページ目以降で指定する |

---

## 基本的な使い方

### 最小構成

```tsx
const columns: Column<Item>[] = [
  { key: "id", label: "ID" },
  { key: "name", label: "名前" },
  { key: "price", label: "価格" },
];

<DataTable
  columns={columns}
  data={items}
  keyExtractor={(row) => row.id}
/>
```

### ページネーション（「すべて表示」オプション付き）

```tsx
const [page, setPage] = useState(1);
const pageSize = 20;

<DataTable
  columns={columns}
  data={paginatedItems}
  keyExtractor={(row) => row.id}
  pageSize={pageSize}
  currentPage={page}
  totalItems={allItems.length}
  onPageChange={setPage}
/>
```

> **ページサイズ**: デフォルトの選択肢は `10` 件、`50` 件、**「すべて表示」** の3種類。プルダウンには **「すべて表示」** も含まれ、選択すると全件を1ページに表示する（ページネーションボタンは非表示になる）。

### カスタムレンダリング

```tsx
const columns: Column<Item>[] = [
  { key: "name", label: "名前" },
  {
    key: "price",
    label: "価格",
    align: "right",
    render: (row) => <span className="font-mono">¥{row.price.toLocaleString()}</span>,
  },
  {
    key: "status",
    label: "ステータス",
    render: (row) => (
      <span className={`badge ${row.active ? "badge-active" : "badge-inactive"}`}>
        {row.active ? "有効" : "無効"}
      </span>
    ),
  },
];
```

### ソート

`Column.sortable` を `true` にするとヘッダークリックでソートできる。

**内部ソート（クライアントサイド）** — `onSort` を渡さない場合、コンポーネント内部でデータをソートする。

```tsx
const columns: Column<Item>[] = [
  { key: "name", label: "名前", sortable: true },
  { key: "price", label: "価格", sortable: true },
];

<DataTable columns={columns} data={items} keyExtractor={(r) => r.id} />
```

- クリックごとに 昇順 → 降順 → なし とトグル
- ソートは **現在表示中のデータ**（ページ内）に対して適用される
- `localeCompare("ja")` で日本語対応の文字列比較

**外部ソート（サーバーサイドなど）** — `onSort`/`sortKey`/`sortDirection` を渡して制御する。

```tsx
const [sortKey, setSortKey] = useState("name");
const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

const handleSort = (key: string, dir: "asc" | "desc") => {
  setSortKey(key);
  setSortDir(dir);
  // API呼び出しや全データのソート処理
};

<DataTable
  columns={columns}
  data={sortedItems}
  keyExtractor={(r) => r.id}
  sortKey={sortKey}
  sortDirection={sortDir}
  onSort={handleSort}
/>
```

外部ソート時は `onSort` が呼ばれるだけで内部でのデータ並び替えは行われない。呼び出し元で全データをソートしてから `data` に渡す。

### 選択可能

```tsx
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

<DataTable
  columns={columns}
  data={items}
  keyExtractor={(r) => r.id}
  selectable
  selectedIds={selectedIds}
  onSelectionChange={setSelectedIds}
/>

// 選択件数の表示
<p>{selectedIds.size} 件選択中</p>
```

---

## 展開行（expandedContent）

データの多い項目に対して、行をクリックで展開して詳細情報を表示できる。

```tsx
const columns: Column<Order>[] = [
  { key: "id", label: "注文番号" },
  { key: "customer", label: "顧客名" },
  { key: "total", label: "合計金額", align: "right" },
];

<DataTable
  columns={columns}
  data={orders}
  keyExtractor={(r) => r.id}
  expandedContent={(row) => (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-xs text-muted mb-1">配送先</p>
        <p className="text-sm">{row.address}</p>
      </div>
      <div>
        <p className="text-xs text-muted mb-1">注文明細</p>
        <ul className="text-sm space-y-0.5">
          {row.items.map((item) => (
            <li key={item.sku}>{item.name} × {item.qty}</li>
          ))}
        </ul>
      </div>
    </div>
  )}
/>
```

展開行の表示/非表示はコンポーネント内部で `Set<string>` により管理される。展開行はテーブルの全列を跨ぐ1行としてレンダリングされる。

---

## 行番号

`rowNumber` プロパティで各行の左端に行番号を表示できる。

```tsx
<DataTable
  columns={columns}
  data={items}
  keyExtractor={(r) => r.id}
  rowNumber
/>
```

- 行番号は右揃え、`font-mono tabular-nums` で等幅表示される
- ページネーション併用時は `(currentPage - 1) * pageSize + index + 1` で自動計算
- サーバーサイドページネーションなどでオフセットを明示したい場合は `rowNumberOffset` を指定する

```tsx
// 2ページ目、開始行が26の場合
<DataTable
  columns={columns}
  data={pageItems}
  keyExtractor={(r) => r.id}
  rowNumber
  rowNumberOffset={25}
  pageSize={25}
  currentPage={2}
  totalItems={total}
  onPageChange={setPage}
/>
```

---

## 列幅の自動調整

列幅は内容に基づいて自動計算される：

- **短い内容（≤40文字）**：`white-space: nowrap` + `min-width` → すべてのセルが1行に収まる
- **長い内容（>40文字）**：`white-space: normal` + `word-break: break-word` + `max-width` 制約 → 自動改行
- **`Column.render` を使用する列**：`white-space: nowrap`、`min-width: 8ch`（内容の実測不可のため）

明示的に `Column.width` を指定した場合はその値が優先される（`th` の `style` に適用）。

---

## ローディング / 空状態

```tsx
// ローディング中
<DataTable columns={columns} data={[]} keyExtractor={(r) => r.id} loading />

// 空データ（カスタムメッセージ）
<DataTable
  columns={columns}
  data={[]}
  keyExtractor={(r) => r.id}
  emptyMessage="該当するデータは見つかりませんでした"
/>
```

---

## 実装の注意点

- **`"use client"`** コンポーネント。クライアントコンポーネント内でのみ使用可能。
- **`selectedIds`** は外部から渡す場合も `Set<string>` で受け渡す。`string[]` ではないことに注意。
- **ページネーション**は `Pagination` コンポーネントに委譲。`pageSize` が指定された場合のみ表示。
- **`colSpan`** は `rowNumber`/`selectable`/`expandedContent` の有無に応じて自動計算される。
