# 店铺管理ページ 設計書

## 基本情報
- **ルート**: `/master/store`
- **コンポーネント**: `src/app/master/store/page.tsx`
- **タイプ**: Client Component (`"use client"`)
- **認証**: 必須
- **データ**: 10,000件のモックデータ

---

## ページ構成
- レイアウト: `w-full px-8 py-4`
- タイトル: 「Master管理 / 店铺管理」

---

## 機能概要
1. 店铺情報の一覧表示（DataTable + ページネーション）
2. 検索・フィルタ（店铺コード、会社名、LOB、拠点、サービス状態）
3. 店铺情報の新規登録（モーダル）
4. 店铺情報の編集（モーダル）
5. 編集モーダルは4タブ構成

---

## データ型: `Store`

### Tab 1: 基本信息（基本情報）
| フィールド | 型 | 説明 |
|-----------|------|------|
| `storeCd` | `string` | 店舗コード（一意） |
| `honorific` | `string` | 敬称（御中/様/殿） |
| `storeUrl` | `string` | URL |
| `companyNameEn` | `string` | 英語会社名 |
| `companyShortName` | `string` | 会社略称 |
| `companyName` | `string` | 会社名 |
| `departmentContact` | `string` | 部署担当者 |
| `countryCode` | `string` | 国コード |
| `regionCode` | `string` | 地域コード |
| `postalCode` | `string` | 郵便番号 |
| `address1` | `string` | 住所1（都道府県･市区町村） |
| `address2` | `string` | 住所2（町名･番地） |
| `address3` | `string` | 住所3（建物名） |
| `phone` | `string` | 電話番号 |

### Tab 2: 管理情報
| フィールド | 型 | 説明 |
|-----------|------|------|
| `lobAssignments` | `LobAssignment[]` | LOB割り当て（1-2件） |
| `customerCode` | `string` | 顧客コード |
| `serviceStatus` | `string` | サービス利用状態 |
| `monthlyStorageUnitPrice` | `string` | 月額保管単価 |
| `longTermStorageUnitPrice` | `string` | 長期保管単価 |
| `marketCoordCustomerCode` | `string` | 市場在庫調整顧客コード |

### Tab 3: 配送管理
| フィールド | 型 | 説明 |
|-----------|------|------|
| `jpDeliveryCategory` | `string` | JP配送区分 |
| `sagawaDeliveryCategory` | `string` | 佐川配送区分 |

### Tab 4: 代引精算情報
| フィールド | 型 | 説明 |
|-----------|------|------|
| `codFee` | `string` | 代引手数料 |
| `sapJournalFlag` | `string` | SAP仕訳フラグ |

### サブ型: `LobAssignment`
| フィールド | 型 |
|-----------|------|
| `lob` | `string`（RSL / RSL(1stParty) / RSL(佐川) / サテライトRSL / BOOKS） |
| `base` | `string`（市川Ⅱ / 東京 / 大阪 / 名古屋 / 福岡） |
| `floor` | `string`（1F / 2F / 3F / B1F） |

---

## 選択肢一覧
| フィールド | 選択肢 |
|-----------|--------|
| 敬称 | 御中, 様, 殿 |
| 国コード | 日本国, その他 |
| 地域コード | その他, 北海道, 東北, 関東, 中部, 近畿, 中国, 四国, 九州 |
| LOB | RSL, RSL(1stParty), RSL(佐川), サテライトRSL, BOOKS |
| 拠点 | 市川Ⅱ, 東京, 大阪, 名古屋, 福岡 |
| フロア | 1F, 2F, 3F, B1F |
| サービス状態 | 稼働, 停止, 休止 |
| JP配送区分 | 設定不要, 通常, 時間指定 |
| 佐川配送区分 | 設定不要, 通常, 時間指定 |
| SAP仕訳フラグ | 出力する, 出力しない |

---

## 検索・フィルタ（5項目）
| フィルタ | タイプ | プレースホルダー | サイズ |
|---------|--------|-----------------|--------|
| 店舗コード | SearchInput | 「店舗コード検索」 | w-48 |
| 会社名 | SearchInput | 「会社名検索」 | w-48 |
| LOB | FilterSelect | 「LOB」 | デフォルト |
| 拠点 | FilterSelect | 「拠点」 | デフォルト |
| サービス利用状態 | FilterSelect | 「サービス利用状態」 | デフォルト |

---

## DataTable カラム
| カラム | キー | 表示内容 |
|--------|------|---------|
| 店舗コード | `storeCd` | テキスト |
| 会社名 | `companyName` | テキスト |
| LOB表示 | `lobDisplay` | LOB割り当てをカンマ区切り + StatusBadge |
| 拠点表示 | `baseDisplay` | 拠点をカンマ区切り + StatusBadge |
| サービス状態 | `serviceStatus` | StatusBadge（稼働=success, 停止=warning, 休止=default） |
| 操作 | — | 「編集」ボタン |

---

## モーダル

### 編集モーダル
- タイトル: 「店铺編集」
- サイズ: `"2xl"`
- 4タブ（TabBarコンポーネント利用）
  - Tab 0: 基本信息 — `renderBasicInfo()`
  - Tab 1: 管理情報 — `renderManagementInfo()`
  - Tab 2: 配送管理 — `renderDelivery()`
  - Tab 3: 代引精算情報 — `renderCodInfo()`
- スクロールエリア: `h-[360px] overflow-y-auto`
- ボタン: 「取消」 / 「保存」

### 新規登録モーダル
- タイトル: 「店铺新規登録」
- サイズ: `"2xl"`
- 編集モーダルと同様の4タブ構成
- ボタン: 「取消」 / 「登録」

---

## モックデータ生成
- 10,000件生成
- 会社名: 12種の企業名を循環
- LOB割り当て: 1-2件/店舗（重複なし）
- 住所: 12都市を循環
- 店舗コード: `STORE{連番}`（例: STORE00001）

---

## 状態管理
| 変数 | 型 | 用途 |
|------|-----|------|
| `stores` | `Store[]` | 店舗データ配列 |
| `search` | `{ storeCd, companyName, lob, base, serviceStatus }` | 検索条件 |
| `currentPage` | `number` | 現在のページ |
| `pageSize` | `number` | 1ページ表示件数 |
| `editModalOpen` | `boolean` | 編集モーダル表示状態 |
| `createModalOpen` | `boolean` | 新規登録モーダル表示状態 |
| `editingStore` | `Store | null` | 編集中の店舗データ |
| `newStore` | `Store` | 新規登録フォームデータ |
| `editTab` / `createTab` | `number` | アクティブタブ（0-3） |

---

## 依存コンポーネント
- `DataTable` — データ一覧
- `SearchInput` — テキスト検索
- `FilterSelect` — ドロップダウンフィルタ
- `Modal` — 編集・新規登録モーダル
- `StatusBadge` — 状態バッジ
- `TabBar` — タブ切り替え（モーダル内）
