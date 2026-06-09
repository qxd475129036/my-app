# 一括価格修正ページ 設計書

## 基本情報
- **ルート**: `/request/bulk-adjust`
- **コンポーネント**: `src/app/request/bulk-adjust/page.tsx`
- **タイプ**: Client Component
- **認証**: 必須
- **データ**: 8件のモックデータ

---

## ページ構成
- レイアウト: `w-full px-8 py-8`
- `PageHeader` title: 「一括価格修正」、description: 「価格の一括修正申請を管理します。」

---

## 機能概要
1. 一括価格修正申請一覧表示（DataTable + ページネーション）
2. 検索・フィルタ（店铺名、商品名、状態）
3. 複数選択 → 一括承認／拒否
4. ActionBar による一括操作UI

---

## データ型: `BulkAdjustRecord`

| フィールド | 型 | 説明 |
|-----------|------|------|
| `id` | `string` | ID（BA001等） |
| `adjustmentNo` | `string` | 修正番号（ADJ-2024-xxx） |
| `storeCd` | `string` | 店铺コード |
| `storeName` | `string` | 店铺名 |
| `productName` | `string` | 商品名 |
| `cdCode` | `string` | 商品コード |
| `oldPrice` | `number` | 旧価格 |
| `newPrice` | `number` | 新価格 |
| `priceChange` | `number` | 差額（+/-） |
| `reason` | `string` | 理由 |
| `requestedBy` | `string` | 申請者 |
| `requestDate` | `string` | 申請日 |
| `status` | `"pending" | "processing" | "approved" | "rejected"` | 状態 |

---

## 状態ラベル
| コード | 表示 | StatusBadge Variant |
|--------|------|-------------------|
| pending | 保留 | warning |
| processing | 処理中 | info |
| approved | 承認済 | success |
| rejected | 拒否 | danger |

---

## 検索・フィルタ（3項目）
| フィルタ | タイプ | プレースホルダー |
|---------|--------|-----------------|
| 店铺名 | SearchInput | 「店铺名」（w-44） |
| 商品名 | SearchInput | 「商品名」（w-44） |
| 状態 | FilterSelect | 「状態」 |

---

## DataTable カラム
| カラム | キー | 表示 |
|--------|------|------|
| 修正番号 | `adjustmentNo` | テキスト |
| 店铺名 | `storeName` | テキスト |
| 商品名 | `productName` | テキスト |
| 旧価格 | `oldPrice` | 右寄せ、¥フォーマット |
| 新価格 | `newPrice` | 右寄せ、`font-semibold text-accent` |
| 差額 | `priceChange` | 色分け（正=赤、負=緑、0=グレー） |
| 理由 | `reason` | テキスト |
| 申請者 | `requestedBy` | テキスト |
| 状態 | `status` | StatusBadge |

---

## ActionBar
- 選択中の場合のみ表示
- アクション:
  - 「承認」ボタン（accent）
  - 「拒否」ボタン（danger variant）
- 選択解除リンク

---

## 確認モーダル
- タイトル: 「承認確認」/「拒否確認」
- メッセージ: 「{n}件の申請を承認/拒否します。よろしいですか？」
- ボタン: 「取消」 / 「実行」

---

## 状態管理
| 変数 | 用途 |
|------|------|
| `data` | 申請データ配列 |
| `search` | 検索条件 |
| `selectedIds` | 選択IDセット |
| `currentPage` / `pageSize` | ページネーション |
| `modalOpen` | 確認モーダル表示状態 |
| `modalAction` | 承認/拒否アクション種別 |

---

## 依存コンポーネント
- `PageHeader`, `DataTable`, `SearchInput`, `FilterSelect`
- `Modal`, `ActionBar`, `StatusBadge`
