# 出金管理ページ 設計書

## 基本情報
- **ルート**: `/delivery/payment`
- **コンポーネント**: `src/app/delivery/payment/page.tsx`
- **タイプ**: Client Component
- **認証**: 必須
- **データ**: 8件のモックデータ

---

## ページ構成
- レイアウト: `w-full px-8 py-8`
- `PageHeader` title: 「出金管理」、description: 「出金記録の管理とステータス追跡。」

---

## 機能概要
1. 出金記録一覧表示（DataTable + ページネーション + 選択可能）
2. 金額集計（総出金額/完了済/保留中）
3. 検索・フィルタ（店铺名、支払方法、状態）
4. 出金詳細モーダル表示

---

## データ型: `PaymentRecord`

| フィールド | 型 | 説明 |
|-----------|------|------|
| `id` | `string` | ID |
| `paymentNumber` | `string` | 出金番号 |
| `orderNumber` | `string` | 注文番号 |
| `storeName` | `string` | 店铺名 |
| `amount` | `number` | 金額 |
| `paymentMethod` | `"cash" | "bank" | "credit"` | 支払方法 |
| `status` | `"completed" | "pending" | "cancelled"` | 状態 |
| `withdrawalDate` | `string` | 出金日 |
| `createdAt` | `string` | 作成日 |

---

## 状態ラベル
| コード | 表示 | StatusBadge Variant |
|--------|------|-------------------|
| completed | 完了 | success |
| pending | 保留中 | warning |
| cancelled | 取消 | danger |

### 支払方法表示
| コード | 表示 | 色 |
|--------|------|-----|
| cash | 現金 | `bg-emerald-50 text-emerald-700` |
| bank | 銀行振込 | `bg-purple-50 text-purple-700` |
| credit | クレジット | `bg-cyan-50 text-cyan-700` |

---

## 集計カード（3カラム）
| カード | 値 | 色 |
|--------|------|-----|
| 総出金額 | `stats.total` | `text-foreground` |
| 完了済 | `stats.completed` | `text-success` |
| 保留中 | `stats.pending` | `text-warning` |

---

## 検索・フィルタ（3項目）
| フィルタ | タイプ | プレースホルダー |
|---------|--------|-----------------|
| 店铺名 | SearchInput | 「店铺名」（w-44） |
| 支払方法 | FilterSelect | 「支払方法」 |
| 状態 | FilterSelect | 「状態」 |

---

## DataTable カラム
| カラム | キー | 表示 |
|--------|------|------|
| 出金番号 | `paymentNumber` | テキスト |
| 注文番号 | `orderNumber` | テキスト |
| 店铺 | `storeName` | テキスト |
| 金額 | `amount` | 右寄せ、¥フォーマット |
| 支払方法 | `paymentMethod` | 色付きバッジ |
| 出金日 | `withdrawalDate` | テキスト |
| 状態 | `status` | StatusBadge |
| 操作 | actions | 「詳細」ボタン |

---

## 詳細モーダル
- タイトル: 「出金詳細 - {paymentNumber}」
- 表示項目（key-value形式）:
  - 出金番号
  - 注文番号
  - 店铺
  - 金額
  - 支払方法
  - 状態
  - 出金日
  - 作成日

---

## 状態管理
| 変数 | 用途 |
|------|------|
| `data` | 出金データ配列 |
| `search` | 検索条件 |
| `selectedIds` | 選択ID（ダミー、`new Set()`固定） |
| `currentPage` / `pageSize` | ページネーション |
| `detailModalOpen` | 詳細モーダル表示状態 |
| `detailRow` | 詳細表示中の出金データ |

---

## 依存コンポーネント
- `PageHeader`, `DataTable`, `SearchInput`, `FilterSelect`
- `Modal`, `StatusBadge`
