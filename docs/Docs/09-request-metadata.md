# メタデータ管理ページ 設計書

## 基本情報
- **ルート**: `/request/metadata`
- **コンポーネント**: `src/app/request/metadata/page.tsx`
- **タイプ**: Client Component
- **認証**: 必須
- **データ**: 8件のモックデータ

---

## ページ構成
- レイアウト: `w-full px-8 py-8`
- `PageHeader` title: 「メタデータ管理」、description: 「システム設定項目の管理を行います。」

---

## 機能概要
1. メタデータ一覧表示（DataTable + ページネーション）
2. 検索・フィルタ（項目名、カテゴリ、状態）
3. メタデータの新規登録（モーダル）
4. メタデータの編集（モーダル）

---

## データ型: `MetadataRecord`

| フィールド | 型 | 説明 |
|-----------|------|------|
| `id` | `string` | ID |
| `metadataNo` | `string` | メタデータ番号 |
| `category` | `string` | カテゴリコード（price/inventory/discount/shipping/tax） |
| `categoryName` | `string` | カテゴリ名（価格管理/在庫管理/割引規則/配送規則/税率設定） |
| `itemName` | `string` | 項目名 |
| `itemCode` | `string` | 項目コード |
| `defaultValue` | `string` | 初期値 |
| `isMandatory` | `boolean` | 必須フラグ |
| `displayOrder` | `number` | 表示順 |
| `status` | `"active" | "inactive"` | 状態 |
| `description` | `string` | 説明 |

---

## 検索・フィルタ（3項目）
| フィルタ | タイプ | プレースホルダー |
|---------|--------|-----------------|
| 項目名 | SearchInput | 「項目名検索」（w-52） |
| カテゴリ | FilterSelect | 「カテゴリ」 |
| 状態 | FilterSelect | 「状態」 |

---

## DataTable カラム
| カラム | キー | 表示 |
|--------|------|------|
| No | 行番号 | |
| メタデータ番号 | `metadataNo` | テキスト |
| カテゴリ | `categoryName` | テキスト |
| 項目名 | `itemName` | テキスト |
| コード | `itemCode` | テキスト |
| 初期値 | `defaultValue` | テキスト |
| 表示順 | `displayOrder` | 数値 |
| 必須 | `isMandatory` | チェック（✔マーク / `-`） |
| 状態 | `status` | StatusBadge（有効=success/無効=default） |
| 操作 | actions | 「編集」ボタン |

---

## 編集モーダル
- タイトル: 「メタデータ編集」
- サイズ: `"lg"`
- フォームレイアウト: `grid grid-cols-1 md:grid-cols-2 gap-4`
- フィールド:
  - 項目名（text, required）
  - コード（text, required）
  - カテゴリ（select）
  - 初期値（text）
  - 表示順（number）
  - 状態（select: 有効/無効）
  - 説明（textarea, md:col-span-2）
  - 必須項目（checkbox）
- ボタン: 「取消」 / 「保存」

---

## 新規登録モーダル
- 編集モーダルと同様のフォーム構成
- ボタン: 「取消」 / 「登録」

---

## 状態管理
| 変数 | 用途 |
|------|------|
| `data` | メタデータ配列 |
| `search` | 検索条件 |
| `selectedIds` | 選択ID（利用されていない） |
| `currentPage` / `pageSize` | ページネーション |
| `editModalOpen` / `createModalOpen` | モーダル表示状態 |
| `editing` / `newItem` | 編集・新規フォームデータ |

---

## 依存コンポーネント
- `PageHeader`, `DataTable`, `SearchInput`, `FilterSelect`
- `Modal`, `StatusBadge`
