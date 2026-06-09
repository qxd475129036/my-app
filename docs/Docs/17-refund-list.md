# 退款記録管理ページ 設計書

## 基本情報
- **ルート**: `/refund/list`
- **コンポーネント**: `src/app/refund/list/page.tsx`
- **タイプ**: Client Component
- **認証**: 必須
- **データ**: 150件のモックデータ

---

## ページ構成
- レイアウト: `w-full px-8 py-8`
- `PageHeader` title: 「退款記録管理」、description: 「退款申請の確認と一括処理。」

---

## 機能概要
1. 退款記録一覧表示（DataTable + ページネーション + 選択可能）
2. 集計カード（総件数/未処理/処理済/総金額）
3. 検索・フィルタ（退款番号、店铺名、理由、状態）
4. 複数選択 → 一括承認／拒否
5. ActionBar による一括操作UI

---

## データ型: `RefundRecord`

| フィールド | 型 | 説明 |
|-----------|------|------|
| `id` | `string` | ID |
| `refundNo` | `string` | 退款番号 |
| `orderNo` | `string` | 注文番号 |
| `storeName` | `string` | 店铺名 |
| `productName` | `string` | 商品名 |
| `quantity` | `number` | 数量 |
| `unitPrice` | `number` | 単価 |
| `refundAmount` | `number` | 退款金額 |
| `refundDate` | `string` | 退款日 |
| `reason` | `string` | 理由（商品破損/品質問題/サイズ不一致/色違い/その他） |
| `status` | `"申請中" | "審査中" | "承認済" | "拒否" | "完了"` | 状態 |

---

## 状態別 StatusBadge
| 状態 | Variant |
|------|---------|
| 完了 / 承認済 | success |
| 申請中 | warning |
| 審査中 | info |
| 拒否 | danger |

---

## 集計カード（4カラム）
| カード | 値 |
|--------|------|
| 総件数 | `stats.total` |
| 未処理 | `stats.pending`（申請中 + 審査中） |
| 処理済 | `stats.approved`（承認済 + 完了） |
| 総金額 | `stats.totalAmount`（¥フォーマット） |

---

## 検索・フィルタ（4項目）
| フィルタ | タイプ | プレースホルダー |
|---------|--------|-----------------|
| 退款番号 | SearchInput | 「退款番号」（w-40） |
| 店铺名 | SearchInput | 「店铺名」（w-40） |
| 理由 | FilterSelect | 「理由」（5種） |
| 状態 | FilterSelect | 「状態」（5種） |

---

## DataTable カラム
| カラム | キー | 表示 |
|--------|------|------|
| 退款番号 | `refundNo` | テキスト |
| 注文番号 | `orderNo` | テキスト |
| 店铺 | `storeName` | テキスト |
| 商品名 | `productName` | テキスト |
| 数量 | `quantity` | 右寄せ |
| 金額 | `refundAmount` | 右寄せ、¥フォーマット |
| 理由 | `reason` | テキスト |
| 状態 | `status` | StatusBadge |

---

## ActionBar
- 選択中の場合のみ表示
- アクション: 「承認」/「拒否」（danger）

---

## 確認モーダル
- タイトル: 「承認確認」/「拒否確認」
- メッセージ: 「{n}件の退款申請を承認/拒否します。よろしいですか？」

---

## 状態管理
| 変数 | 用途 |
|------|------|
| `data` | 退款データ配列 |
| `search` | 検索条件 |
| `selectedIds` | 選択IDセット |
| `currentPage` / `pageSize` | ページネーション |
| `modalOpen` | 確認モーダル表示状態 |
| `modalAction` | 承認/拒否アクション種別 |

---

## 依存コンポーネント
- `PageHeader`, `DataTable`, `SearchInput`, `FilterSelect`
- `Modal`, `ActionBar`, `StatusBadge`
