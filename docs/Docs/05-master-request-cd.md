# 請求CD管理ページ 設計書

## 基本情報
- **ルート**: `/master/request-cd`
- **コンポーネント**: `src/app/master/request-cd/page.tsx`
- **タイプ**: Client Component (`"use client"`)
- **認証**: 必須
- **データ**: 10,000件のモックデータ

---

## ページ構成
- レイアウト: `w-full px-8 py-4`
- タイトル: 「Master管理 / 請求コード管理」

---

## 機能概要
1. 請求コード一覧表示（DataTable + ページネーション + 行番号）
2. 検索・フィルタ（適用範囲、費用種別、請求コード）
3. 請求コードの新規登録（モーダル）
4. 請求コードの編集（モーダル）
5. 選択不可（`selectable={false}`）
6. ヘッダー折り返し（`wrapHeaders`）

---

## データ型: `ChargeCd`

| フィールド | 型 | 説明 | 選択肢例 |
|-----------|------|------|---------|
| `id` | `string` | 一意識別子 | |
| `scope` | `string` | 適用範囲 (LOB) | 全店舗, 個別店舗 |
| `feeTypeCd` | `string` | 費用種別コード | A, B, C, D, E |
| `majorCd` | `string` | 大分類コード | L98, L01-L07, L99 |
| `mediumCd` | `string` | 中分類コード | M01-M09, M99 |
| `itemCd` | `string` | 項目コード | S001-S010, S999 |
| `feeType` | `string` | 費用種別名 | 月額利用料, 標準, オプション, 特別, 割引 |
| `major` | `string` | 大分類名 | 月額利用料調整, 倉庫作業, 出荷作業 等 |
| `medium` | `string` | 中分類名 | 出荷作業, 入荷作業, 保管作業 等 |
| `item` | `string` | 項目名 | 月額利用料調整, 出荷作業料 等 |
| `description` | `string` | 内容 | 自由テキスト |
| `unitPrice` | `number` | 単価 | |
| `priceUnit` | `string` | 単位(単価用) | 円, PCS, ケース, kg, 個 |
| `inputType` | `string` | 入力区分 | 0: 手入力, 1: 取込, 2: 自動計算 |
| `taxCode` | `string` | 税コード | UA/UB/非課税/不課税 |
| `returnDiscountFlag` | `string` | 返還割引フラグ | 0: 対象外, 1: 返還, 2: 割引 |
| `gsapAccountCd` | `string` | GSAP勘定科目コード | 4種 |
| `hanaAccountCd` | `string` | HANA勘定科目コード | 4種 |
| `detailCd` | `string` | 細目コード | 4種 |
| `optionalWorkFlag` | `string` | オプション作業フラグ | 0, 1 |
| `revenueMethod` | `string` | 売上計上方法区分 | 4種 |
| `workTiming` | `string` | 作業タイミング | 5種 |
| `productSize` | `string` | 商品サイズ | 空/100-105 |
| `sizeUnit` | `string` | 単位(サイズ用) | Pcs, Kg, 箱, パレット |
| `extendedStorage` | `string` | 延長保管 | 自由テキスト |
| `packagingSize` | `string` | 梱包サイズ | 空/S/M/L/LL/3L |
| `workDetailCd` | `string` | 作業詳細区分 | 3種 |
| `productCategoryCd` | `string` | 商品区分コード | P999, P001-P005 |

---

## 検索・フィルタ（3項目）
| フィルタ | タイプ | プレースホルダー |
|---------|--------|-----------------|
| 適用範囲 | FilterSelect | 「適用範囲」 |
| 費用種別 | FilterSelect | 「費用種別」 |
| 請求コード | SearchInput | 「請求コード検索」（w-52） |

---

## DataTable カラム
| カラム | キー |
|--------|------|
| No | 行番号（rowNumber） |
| 適用範囲 | `scope` |
| 費用種別CD | `feeTypeCd` |
| 費用種別 | `feeType` |
| 大分類CD | `majorCd` |
| 大分類 | `major` |
| 中分類CD | `mediumCd` |
| 中分類 | `medium` |
| 項目CD | `itemCd` |
| 項目 | `item` |
| 内容 | `description` |
| 単価 | `unitPrice`（右寄せ） |
| 単位 | `priceUnit` |
| 入力区分 | `inputType` |
| 税コード | `taxCode` |
| 状態 | StatusBadge |

---

## 編集フォーム（モーダル内）
- タイトル: 「請求コード編集」 / 「請求コード新規登録」
- サイズ: `"2xl"`
- フォームフィールド: 28項目（全て同一モーダル内）
- 主なフィールドタイプ:
  - テキスト入力: `unitPrice`, `extendedStorage` 等
  - セレクトボックス: 各種コード・区分
- フォームのスクロール: `max-h-[70vh] overflow-y-auto`
- ボタン: 「取消」 / 「保存」（または「登録」）

---

## モックデータ生成
- 10,000件生成
- 費用種別・大分類・中分類・項目を循環パターンで割り当て
- 単価: 100〜10,000のランダム値

---

## 状態管理
| 変数 | 用途 |
|------|------|
| `items` | 請求コードデータ配列 |
| `search` | 検索条件 |
| `currentPage` / `pageSize` | ページネーション |
| `editModalOpen` / `createModalOpen` | モーダル表示状態 |
| `editingItem` / `newItem` | 編集・新規フォームデータ |

---

## 依存コンポーネント
- `DataTable`（`selectable={false}`, `wrapHeaders`, `rowNumber`）
- `SearchInput`, `FilterSelect`
- `Modal`
