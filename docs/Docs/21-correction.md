# 明細修正ページ 設計書

## 基本情報
- **ルート**: `/correction`
- **コンポーネント**: `src/app/correction/page.tsx`
- **タイプ**: Client Component
- **認証**: 必須
- **データ**: 5件のモックデータ

---

## ページ構成
- レイアウト: `w-full px-8 py-8`
- `PageHeader` title: 「明細修正」、description: 「価格修正履歴の管理と一括承認。」

---

## 機能概要
1. 修正記録一覧表示（DataTable + 選択可能、固定1ページ）
2. 検索・フィルタ（ID/商品名/店铺名、状態）
3. 複数選択 → 一括承認／拒否
4. ActionBar による一括操作UI
5. 修正詳細モーダル表示

---

## データ型: `CorrectionRecord`

| フィールド | 型 | 説明 |
|-----------|------|------|
| `id` | `string` | ID（COR001形式） |
| `itemName` | `string` | 商品名 |
| `storeName` | `string` | 店铺名 |
| `oldPrice` | `number` | 旧価格 |
| `newPrice` | `number` | 新価格 |
| `reason` | `string` | 理由 |
| `status` | `"pending" | "approved" | "rejected"` | 状態 |

---

## 状態ラベル
| コード | 表示 | StatusBadge Variant |
|--------|------|-------------------|
| pending | 保留 | warning |
| approved | 承認済 | success |
| rejected | 拒否 | danger |

---

## 検索・フィルタ（2項目）
| フィルタ | タイプ | プレースホルダー |
|---------|--------|-----------------|
| ID/商品名/店铺名 | SearchInput | 「ID/商品名/店铺名」（w-64） |
| 状態 | FilterSelect | 「状態」 |

---

## DataTable カラム
| カラム | キー | 表示 |
|--------|------|------|
| ID | `id` | テキスト |
| 商品名 | `itemName` | テキスト |
| 店铺 | `storeName` | テキスト |
| 旧価格 | `oldPrice` | 右寄せ、¥フォーマット |
| 新価格 | `newPrice` | 右寄せ、`font-semibold text-accent` |
| 差分 | `diff` | 色分け（正=赤、負=緑、0=グレー） |
| 理由 | `reason` | テキスト |
| 状態 | `status` | StatusBadge |
| 操作 | actions | 「編集」ボタン |

---

## ActionBar
- 選択中の場合のみ表示
- アクション: 「承認」/「拒否」（danger）

---

## 詳細モーダル
- タイトル: 「修正詳細」
- サイズ: `"sm"`
- 表示項目:
  - 商品名
  - 店铺
  - 旧価格
  - 新価格
  - 理由
  - 状態

---

## 状態管理
| 変数 | 用途 |
|------|------|
| `records` | 修正記録データ配列（状態変更可能） |
| `filter` | テキスト検索条件 |
| `statusFilter` | 状態フィルタ条件 |
| `selectedIds` | 選択IDセット |
| `editModalOpen` | 詳細モーダル表示状態 |
| `editing` / `formData` | 詳細表示用データ |

---

## 依存コンポーネント
- `PageHeader`, `DataTable`, `SearchInput`, `FilterSelect`
- `Modal`, `ActionBar`, `StatusBadge`
