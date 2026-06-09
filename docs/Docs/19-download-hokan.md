# 保管明細ダウンロードページ 設計書

## 基本情報
- **ルート**: `/download/hokan`
- **コンポーネント**: `src/app/download/hokan/page.tsx`
- **タイプ**: Client Component
- **認証**: 必須
- **データ**: 200件のモックデータ

---

## ページ構成
- レイアウト: `w-full px-8 py-8`
- `PageHeader` title: 「保管明細ダウンロード」、description: 「保管データの検索とダウンロード。」

---

## 機能概要
1. 保管データ一覧表示（DataTable + ページネーション + 選択可能）
2. 集計カード（該当件数/総数量/総金額）
3. 検索・フィルタ（店铺名、商品名、カテゴリ、状態）
4. CSVダウンロード機能
5. 選択データ個別ダウンロード

---

## データ型: `HokanRecord`

| フィールド | 型 | 説明 |
|-----------|------|------|
| `id` | `string` | ID |
| `storeName` | `string` | 店铺名 |
| `productName` | `string` | 商品名 |
| `category` | `string` | カテゴリ（ケーキ類/パン類/スイーツ類/ギフト類） |
| `quantity` | `number` | 数量 |
| `unitPrice` | `number` | 単価 |
| `totalAmount` | `number` | 金額 |
| `holdingDate` | `string` | 保管日 |
| `status` | `string` | 状態（保管中/処理中/出庫済/異常） |

---

## 状態別 StatusBadge
| 状態 | Variant |
|------|---------|
| 保管中 | info |
| 処理中 | warning |
| 出庫済 | success |
| 異常 | danger |

---

## 集計カード（3カラム）
| カード | 値 |
|--------|------|
| 該当件数 | `stats.total`（フィルタ後の件数） |
| 総数量 | `stats.totalQty` |
| 総金額 | `stats.totalAmount`（¥フォーマット） |

---

## 検索・フィルタ（4項目）
| フィルタ | タイプ | プレースホルダー |
|---------|--------|-----------------|
| 店铺名 | SearchInput | 「店铺名」（w-44） |
| 商品名 | SearchInput | 「商品名」（w-44） |
| カテゴリ | FilterSelect | 「カテゴリ」（4種） |
| 状態 | FilterSelect | 「状態」（4種） |

---

## DataTable カラム
| カラム | キー | 表示 |
|--------|------|------|
| 店铺 | `storeName` | テキスト |
| 商品名 | `productName` | テキスト |
| カテゴリ | `category` | テキスト |
| 数量 | `quantity` | 右寄せ |
| 金額 | `totalAmount` | 右寄せ、¥フォーマット |
| 保管日 | `holdingDate` | テキスト |
| 状態 | `status` | StatusBadge |

---

## ダウンロード機能
- PageHeader actions 内のボタン:
  - 選択なし: 「CSV出力」ボタン（`border` + 白背景） → 全データ出力
  - 選択あり: 「{n}件DL」ボタン（accent） → 選択データ出力
- 現在は `alert()` によるモック実装

---

## 状態管理
| 変数 | 用途 |
|------|------|
| `data` | 保管データ配列 |
| `search` | 検索条件 |
| `selectedIds` | 選択IDセット |
| `currentPage` / `pageSize` | ページネーション（初期20件/ページ） |

---

## 依存コンポーネント
- `PageHeader`, `DataTable`, `SearchInput`, `FilterSelect`
- `StatusBadge`
