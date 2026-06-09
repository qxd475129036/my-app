# 配送明細ダウンロードページ 設計書

## 基本情報
- **ルート**: `/download/sohaku`
- **コンポーネント**: `src/app/download/sohaku/page.tsx`
- **タイプ**: Client Component
- **認証**: 必須
- **データ**: 300件のモックデータ

---

## ページ構成
- レイアウト: `w-full px-8 py-8`
- `PageHeader` title: 「配送明細ダウンロード」、description: 「配送データの検索とダウンロード。」

---

## 機能概要
1. 配送データ一覧表示（DataTable + ページネーション、選択不可）
2. 集計カード（該当件数/総数量/総金額）
3. 検索・フィルタ（注文番号、店铺名、商品名、状態）
4. CSVダウンロード

---

## データ型: `SohakuRecord`

| フィールド | 型 | 説明 |
|-----------|------|------|
| `id` | `string` | ID |
| `orderNo` | `string` | 注文番号 |
| `storeName` | `string` | 店铺名 |
| `productName` | `string` | 商品名 |
| `quantity` | `number` | 数量 |
| `unitPrice` | `number` | 単価 |
| `totalAmount` | `number` | 金額 |
| `deliveryDate` | `string` | 配送日 |
| `deliveryAddress` | `string` | 配送先住所 |
| `status` | `string` | 状態（配送待/配送中/配送済/配送失敗） |

---

## 状態別 StatusBadge
| 状態 | Variant |
|------|---------|
| 配送済 | success |
| 配送中 | info |
| 配送待 | warning |
| 配送失敗 | danger |

---

## 集計カード（3カラム）
| カード | 値 |
|--------|------|
| 該当件数 | `stats.total` |
| 総数量 | `stats.totalQty` |
| 総金額 | `stats.totalAmount`（¥フォーマット） |

---

## 検索・フィルタ（4項目）
| フィルタ | タイプ | プレースホルダー |
|---------|--------|-----------------|
| 注文番号 | SearchInput | 「注文番号」（w-40） |
| 店铺名 | SearchInput | 「店铺名」（w-40） |
| 商品名 | SearchInput | 「商品名」（w-40） |
| 状態 | FilterSelect | 「状態」（4種） |

---

## DataTable カラム
| カラム | キー | 表示 |
|--------|------|------|
| 注文番号 | `orderNo` | テキスト |
| 店铺 | `storeName` | テキスト |
| 商品名 | `productName` | テキスト |
| 数量 | `quantity` | 右寄せ |
| 金額 | `totalAmount` | 右寄せ、¥フォーマット |
| 配送日 | `deliveryDate` | テキスト |
| 状態 | `status` | StatusBadge |

---

## ダウンロード機能
- PageHeader actions内の「CSV出力」ボタン（accent）
- 現在は `alert()` によるモック実装
- 選択不可（`selectable` なし）

---

## 状態管理
| 変数 | 用途 |
|------|------|
| `data` | 配送データ配列 |
| `search` | 検索条件（注文番号/店铺名/商品名/状態） |
| `currentPage` / `pageSize` | ページネーション（初期20件/ページ） |

---

## 依存コンポーネント
- `PageHeader`, `DataTable`, `SearchInput`, `FilterSelect`
- `StatusBadge`
