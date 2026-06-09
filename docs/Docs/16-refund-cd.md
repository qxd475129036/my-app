# 退款CD管理ページ 設計書

## 基本情報
- **ルート**: `/refund/cd`
- **コンポーネント**: `src/app/refund/cd/page.tsx`
- **タイプ**: Client Component
- **認証**: 必須
- **データ**: 100件のモックデータ

---

## ページ構成
- レイアウト: `w-full px-8 py-8`
- `PageHeader` title: 「退款CD管理」、description: 「退款コード定義の管理を行います。」

---

## 機能概要
1. CD定義一覧表示（DataTable + ページネーション）
2. 検索・フィルタ（CDコード、CD名、種別、状態）
3. CD定義の新規登録（モーダル）
4. CD定義の編集（モーダル）

---

## データ型: `CdDefinition`

| フィールド | 型 | 説明 |
|-----------|------|------|
| `id` | `string` | ID（CD00001形式） |
| `cdCode` | `string` | CDコード（CD00000001形式） |
| `cdName` | `string` | CD名 |
| `cdType` | `string` | 種別（クーポン/割引券/金券/ギフト券/体験券） |
| `usageCount` | `number` | 使用回数 |
| `maxUsage` | `number` | 上限回数 |
| `validFrom` | `string` | 有効開始日 |
| `validTo` | `string` | 有効終了日 |
| `status` | `string` | 状態（有効/使用済/期限切/無効） |
| `remark` | `string` | 備考 |

---

## 状態別 StatusBadge
| 状態 | Variant |
|------|---------|
| 有効 | success |
| 使用済 | warning |
| 期限切 | warning |
| 無効 | danger |

---

## 検索・フィルタ（4項目）
| フィルタ | タイプ | プレースホルダー |
|---------|--------|-----------------|
| CDコード | SearchInput | 「CDコード検索」（w-44） |
| CD名 | SearchInput | 「CD名検索」（w-44） |
| 種別 | FilterSelect | 「種別」 |
| 状態 | FilterSelect | 「状態」 |

---

## DataTable カラム
| カラム | キー | 表示 |
|--------|------|------|
| CDコード | `cdCode` | テキスト |
| CD名 | `cdName` | テキスト |
| 種別 | `cdType` | Badge（`bg-accent-light text-accent`） |
| 使用回数 | `usageCount` | 右寄せ |
| 上限 | `maxUsage` | 右寄せ |
| 有効開始 | `validFrom` | テキスト |
| 有効終了 | `validTo` | テキスト |
| 状態 | `status` | StatusBadge |
| 操作 | actions | 「編集」ボタン |

---

## 編集モーダル
- タイトル: 「CD編集」
- サイズ: `"lg"`
- フォーム: `grid grid-cols-1 md:grid-cols-2 gap-4`
- フィールド: CDコード、CD名、種別（select）、使用回数（readonly）、上限回数、有効開始、有効終了、状態（select）、備考（textarea, md:col-span-2）

---

## 新規登録モーダル
- 編集モーダルと同様
- バリデーション: CDコード重複チェック

---

## 状態管理
| 変数 | 用途 |
|------|------|
| `data` | CD定義データ配列 |
| `search` | 検索条件 |
| `selectedIds` | 選択ID（利用されていない） |
| `currentPage` / `pageSize` | ページネーション |
| `editModalOpen` / `createModalOpen` | モーダル表示状態 |
| `editing` / `newItem` | 編集・新規フォームデータ |

---

## 依存コンポーネント
- `PageHeader`, `DataTable`, `SearchInput`, `FilterSelect`
- `Modal`, `StatusBadge`
