# 代引管理（代引注文一覧）ページ 設計書

## 基本情報
- **ルート**: `/delivery/list`
- **コンポーネント**: `src/app/delivery/list/page.tsx`
- **タイプ**: Client Component
- **認証**: 必須
- **データ**: 8件のモックデータ

---

## ページ構成
- レイアウト: `w-full px-8 py-8`
- `PageHeader` title: 「代引管理」、description: 「代引注文の一覧と管理。」

---

## 機能概要
1. 代引注文一覧表示（DataTable + ページネーション + 選択可能）
2. 検索・フィルタ（店铺名、顧客名、状態）
3. 注文詳細モーダル表示

---

## データ型: `DeliveryOrder`

| フィールド | 型 | 説明 |
|-----------|------|------|
| `id` | `string` | ID |
| `orderNumber` | `string` | 注文番号 |
| `storeName` | `string` | 店铺名 |
| `productName` | `string` | 商品名 |
| `amount` | `number` | 金額 |
| `status` | `"pending" | "processing" | "completed" | "cancelled"` | 状態 |
| `customerName` | `string` | 顧客名 |
| `customerAddress` | `string` | 住所 |
| `customerPhone` | `string` | 電話番号 |
| `createdAt` | `string` | 作成日 |
| `completedAt` | `string` | 完了日（任意） |

---

## 状態ラベル
| コード | 表示 | StatusBadge Variant |
|--------|------|-------------------|
| pending | 保留 | warning |
| processing | 処理中 | info |
| completed | 完了 | success |
| cancelled | 取消 | danger |

---

## 検索・フィルタ（3項目）
| フィルタ | タイプ | プレースホルダー |
|---------|--------|-----------------|
| 店铺名 | SearchInput | 「店铺名」（w-44） |
| 顧客名 | SearchInput | 「顧客名」（w-44） |
| 状態 | FilterSelect | 「状態」 |

---

## DataTable カラム
| カラム | キー | 表示 |
|--------|------|------|
| 注文番号 | `orderNumber` | テキスト |
| 店铺 | `storeName` | テキスト |
| 商品名 | `productName` | テキスト |
| 金額 | `amount` | 右寄せ、¥フォーマット |
| 顧客 | `customerName` | テキスト |
| 住所 | `customerAddress` | テキスト |
| 作成日 | `createdAt` | テキスト |
| 状態 | `status` | StatusBadge |
| 操作 | actions | 「詳細」ボタン |

---

## 詳細モーダル
- タイトル: 「注文詳細 - {orderNumber}」
- 表示項目（key-value形式、`flex justify-between border-b`）:
  - 注文番号
  - 店铺
  - 商品
  - 金額
  - 状態
  - 顧客名
  - 住所
  - 電話
  - 作成日
  - 完了日（`-` 表示）

---

## 状態管理
| 変数 | 用途 |
|------|------|
| `data` | 注文データ配列 |
| `search` | 検索条件 |
| `selectedIds` | 選択IDセット |
| `currentPage` / `pageSize` | ページネーション |
| `detailModalOpen` | 詳細モーダル表示状態 |
| `detailRow` | 詳細表示中の注文データ |

---

## 依存コンポーネント
- `PageHeader`, `DataTable`, `SearchInput`, `FilterSelect`
- `Modal`, `StatusBadge`
