# DataTable コンポーネント

汎用データテーブルコンポーネント。内部で `@tanstack/react-table` v8 を使用。

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `Column<T>[]` | — | カラム定義の配列 |
| `data` | `T[]` | — | 表示するデータ配列 |
| `keyExtractor` | `(row: T) => string` | — | 各行の一意識別子を返す関数 |
| `selectable` | `boolean` | `false` | チェックボックス選択を有効にする |
| `selectedIds` | `Set<string>` | — | 選択状態（制御時） |
| `onSelectionChange` | `(ids: Set<string>) => void` | — | 選択変更時のコールバック |
| `onSort` | `(key: string, direction) => void` | — | ソート変更時のコールバック（制御時） |
| `sortKey` | `string` | — | 現在のソートキー（制御時） |
| `sortDirection` | `"asc" \| "desc"` | — | 現在のソート方向（制御時） |
| `emptyMessage` | `string` | `"データがありません"` | 空データ時の表示メッセージ |
| `loading` | `boolean` | `false` | ローディング表示 |
| `pageSize` | `number` | — | 1ページあたりの行数 |
| `currentPage` | `number` | — | 現在のページ番号 |
| `totalItems` | `number` | — | 全データ件数 |
| `onPageChange` | `(page: number) => void` | — | ページ変更時のコールバック |
| `onPageSizeChange` | `(size: number) => void` | — | ページサイズ変更時のコールバック |
| `pagination` | `boolean` | `true` | ページネーション表示の有無 |
| `expandedContent` | `(row: T) => React.ReactNode` | — | 行展開時の詳細コンテンツ |
| `rowNumber` | `boolean` | `true` | 行番号列の表示 |
| `rowNumberOffset` | `number` | — | 行番号のオフセット値 |
| `wrapHeaders` | `boolean` | `false` | 全ヘッダーの折り返しを有効にする |

---

## Column 型

```typescript
interface Column<T> {
  key: string                              // データフィールド名
  label: string                            // ヘッダー表示テキスト
  sortable?: boolean                       // ソート可能にする
  render?: (row: T) => React.ReactNode     // カスタムレンダラー
  width?: string                           // 列幅（例: "120px"）
  align?: "left" | "center" | "right"      // テキスト寄せ
  wrapHeader?: boolean                     // この列のヘッダーを折り返す
  wrapText?: boolean                       // この列のセルテキストを折り返す
}
```

---

## テキスト折り返し

### ヘッダー折り返し

- **全列一括**: `wrapHeaders={true}` → 全ヘッダーが折り返し可能
- **列個別**: `wrapHeader: true` → その列のみ折り返し（`wrapHeaders` より優先）

```tsx
<DataTable columns={columns} data={data} keyExtractor={(r) => r.id} wrapHeaders />

const columns: Column<Data>[] = [
  { key: "long", label: "長いラベル／折り返し", width: "120px", wrapHeader: true },
];
```

### セルテキスト折り返し

`wrapText: true` → その列のセルが折り返し表示される。

```tsx
const columns: Column<Data>[] = [
  { key: "description", label: "説明", width: "200px", wrapText: true },
];
```

---

## 使用例

```tsx
import { DataTable, Column } from "@/app/components/DataTable";

interface User { id: string; name: string; email: string; }

const columns: Column<User>[] = [
  { key: "name", label: "名前", sortable: true },
  { key: "email", label: "メールアドレス", width: "220px", wrapText: true },
];

<DataTable
  columns={columns}
  data={users}
  keyExtractor={(u) => u.id}
  pageSize={20}
  currentPage={page}
  totalItems={users.length}
  onPageChange={setPage}
/>
```

---

## 内部実装

- ソート・選択の状態管理は `@tanstack/react-table` v8 に委譲
- テーブルは HTML `<table>` を直接レンダリングし、CSS class でスタイル
- テーブル幅は `width: max-content` により内容に合わせて自動調整
  - 列幅 = 各列の最長コンテンツ幅
  - 列内容が少なければテーブルはコンパクトに収まり、空白が生じない
  - 列内容が多い場合はテーブルがコンテナをはみ出すが、`overflow-x-auto` は持たせていない
