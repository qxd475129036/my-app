# DataTable テストページ 設計書

## 基本情報
- **ルート**: `/test/datatable`
- **コンポーネント**: `src/app/test/datatable/page.tsx`
- **タイプ**: Client Component
- **認証**: なし
- **データ**: 50,000件の自動生成データ

---

## ページ構成
- レイアウト: `w-full px-8 py-4`
- タイトル: 「Test / DataTable (Virtual + 50k rows)」

---

## 機能概要
1. DataTable 仮想スクロールの性能テスト
2. 50,000行のデータ表示
3. 行番号表示（`rowNumber`）
4. 全カラムソート可能
5. データリフレッシュ

---

## カラム定義
| カラム | キー | 幅 | ソート可能 |
|--------|------|-----|-----------|
| ID | `id` | 60px | ✓ |
| First Name | `firstName` | 自動 | ✓ |
| Last Name | `lastName` | 自動 | ✓ |
| Age | `age` | 50px | ✓ |
| Visits | `visits` | 50px | ✓ |
| Status | `status` | 自動 | ✓ |
| Profile Progress | `progress` | 80px | ✓ |
| Created At | `createdAt` | 250px | ✓（renderでロケール文字列変換） |

---

## DataTable 設定
- `virtualize`: `true`（仮想スクロール有効）
- `virtualizeOptions`: `{ containerHeight: "800px" }`
- `rowNumber`: `true`
- ページネーションなし（全件表示）

---

## データ生成
- `makeData(50000)` を利用
- `Person` 型のデータ（src/app/test/datatable/makeData.ts）
- 「Refresh Data」ボタンでデータ再生成

---

## 状態管理
| 変数 | 用途 |
|------|------|
| `data` | 50,000件のPersonデータ |

---

## 依存コンポーネント
- `DataTable`（仮想スクロールモード）

---

## 注意事項
- このページは開発/テスト専用
- 認証チェックなし
- 実データとの関連なし
