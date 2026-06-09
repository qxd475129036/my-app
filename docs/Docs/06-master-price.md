# 単価管理ページ 設計書

## 基本情報
- **ルート**: `/master/price`
- **コンポーネント**: `src/app/master/price/page.tsx`
- **タイプ**: Client Component (`"use client"`)
- **認証**: 必須
- **データ**: 10,000件のモックデータ

---

## ページ構成
- レイアウト: `w-full px-8 py-4`
- タイトル: 「Master管理 / 単価管理」

---

## 機能概要
1. 単価一覧表示（DataTable + ページネーション）
2. 検索・フィルタ（商品名、カテゴリ、状態）
3. 単価の新規登録（モーダル）
4. 単価の編集（モーダル）

---

## データ型: `Price`

| フィールド | 型 | 説明 |
|-----------|------|------|
| `priceId` | `string` | 価格ID（`PRICE00001`形式） |
| `productName` | `string` | 商品名 |
| `price` | `number` | 価格（¥表記フォーマット） |
| `validFrom` | `string` | 有効開始日 |
| `validTo` | `string` | 有効終了日 |
| `status` | `string` | 状態（有効/期限間近/期限切れ/下書） |
| `category` | `string` | カテゴリ（スマホ/PC/タブレット/オーディオ/ウェアラブル/ゲーム/その他） |

---

## 検索・フィルタ（3項目）
| フィルタ | タイプ | プレースホルダー |
|---------|--------|-----------------|
| 商品名 | SearchInput | 「商品名検索」（w-48） |
| カテゴリ | FilterSelect | 「カテゴリ」 |
| 状態 | FilterSelect | 「状態」 |

---

## DataTable カラム
| カラム | キー | 表示 |
|--------|------|------|
| 価格ID | `priceId` | テキスト |
| 商品名 | `productName` | テキスト |
| カテゴリ | `category` | テキスト |
| 価格 | `price` | 右寄せ、`¥` フォーマット |
| 有効開始日 | `validFrom` | テキスト |
| 有効終了日 | `validTo` | テキスト |
| 状態 | `status` | StatusBadge（有効=success/期限間近=warning/期限切れ=danger/下書=default） |
| 操作 | actions | 「編集」ボタン |

---

## 編集モーダル
- タイトル: 「単価編集」
- サイズ: `"lg"`
- フォームレイアウト: `grid grid-cols-1 md:grid-cols-2 gap-4`
- フィールド: 価格ID（readonly）、商品名、カテゴリ、価格、有効開始日、有効終了日、状態
- ボタン: 「取消」 / 「保存」

---

## 新規登録モーダル
- タイトル: 「単価新規登録」
- サイズ: `"lg"`
- 編集モーダルと同様のフォームレイアウト
- ボタン: 「取消」 / 「登録」
- バリデーション: 価格ID重複チェック

---

## モックデータ生成
- 10,000件生成
- 商品名: 20種の製品名を循環
- カテゴリ: 7種から循環割り当て
- 状態: 4種から循環割り当て
- 価格: `5000 + i * 100 + idx * 500`

---

## 状態管理
| 変数 | 用途 |
|------|------|
| `data` | 単価データ配列 |
| `search` | 検索条件 |
| `selectedIds` | 選択ID（利用されていない） |
| `currentPage` / `pageSize` | ページネーション |
| `editModalOpen` / `createModalOpen` | モーダル表示状態 |
| `editingPrice` / `newPrice` | 編集・新規フォームデータ |

---

## 依存コンポーネント
- `DataTable`, `SearchInput`, `FilterSelect`
- `Modal`, `StatusBadge`
