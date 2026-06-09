# 承認管理ページ 設計書

## 基本情報
- **ルート**: `/request/approval`
- **コンポーネント**: `src/app/request/approval/page.tsx`
- **タイプ**: Client Component
- **認証**: 必須
- **データ**: 8件のモックデータ

---

## ページ構成
- レイアウト: `w-full px-8 py-8`
- `PageHeader` title: 「承認管理」、description: 「承認ワークフローの管理を行います。」

---

## 機能概要
1. 承認リクエスト一覧表示（DataTable + ページネーション + 選択可能）
2. ステータス別集計カード（未処理/承認済/拒否）
3. 検索・フィルタ（店铺名、種類、状態）
4. 複数選択 → 一括承認／拒否
5. ActionBar による一括操作UI
6. 承認/拒否時に備考入力可能

---

## データ型: `ApprovalRecord`

| フィールド | 型 | 説明 |
|-----------|------|------|
| `id` | `string` | ID |
| `approvalNo` | `string` | 承認番号 |
| `storeCd` | `string` | 店铺コード |
| `storeName` | `string` | 店铺名 |
| `approvalType` | `string` | 承認タイプコード |
| `approvalTypeName` | `string` | 承認タイプ名（価格変更/在庫増加/勤務調整/割引承認/特別販促/設備購入/休暇申請） |
| `applicantName` | `string` | 申請者 |
| `targetName` | `string` | 対象 |
| `amount` | `number` | 金額 |
| `status` | `"pending" | "processing" | "approved" | "rejected" | "cancelled"` | 状態 |
| `reason` | `string` | 理由 |
| `submittedDate` | `string` | 申請日 |
| `approvedDate` | `string` | 承認日（任意） |
| `approverName` | `string` | 承認者名（任意） |

---

## 状態ラベル
| コード | 表示 | StatusBadge Variant |
|--------|------|-------------------|
| pending | 待承認 | warning |
| processing | 承認中 | info |
| approved | 承認済 | success |
| rejected | 拒否 | danger |
| cancelled | 取消 | danger |

---

## 集計カード（3カラム）
| カード | 値 | 色 |
|--------|------|-----|
| 未処理 | `stats.pending` | `text-foreground` |
| 承認済 | `stats.approved` | `text-success` |
| 拒否 | `stats.rejected` | `text-danger` |

---

## 検索・フィルタ（3項目）
| フィルタ | タイプ | プレースホルダー |
|---------|--------|-----------------|
| 店铺名 | SearchInput | 「店铺名」（w-44） |
| 種類 | FilterSelect | 「種類」（7種） |
| 状態 | FilterSelect | 「状態」 |

---

## DataTable カラム
| カラム | キー | 表示 |
|--------|------|------|
| 番号 | `approvalNo` | テキスト |
| 店铺名 | `storeName` | テキスト |
| 種類 | `approvalTypeName` | Badge（`bg-accent-light text-accent`） |
| 対象 | `targetName` | テキスト |
| 申請者 | `applicantName` | テキスト |
| 金額 | `amount` | 右寄せ、¥フォーマット |
| 申請日 | `submittedDate` | テキスト |
| 状態 | `status` | StatusBadge |

---

## ActionBar
- 選択中の場合のみ表示
- アクション:
  - 「承認」ボタン（accent）
  - 「拒否」ボタン（danger variant）

---

## 確認モーダル
- タイトル: 「承認確認」/「拒否確認」
- メッセージ: 「{n}件のリクエストを承認/拒否します。」
- 備考テキストエリア（4行）
- ボタン: 「取消」 / 「実行」（承認=accent、拒否=red）
- 実行時: 選択レコードのstatus更新 + `approvedDate` / `approverName` 設定

---

## 状態管理
| 変数 | 用途 |
|------|------|
| `data` | 承認データ配列 |
| `search` | 検索条件 |
| `selectedIds` | 選択IDセット |
| `currentPage` / `pageSize` | ページネーション |
| `modalOpen` | 確認モーダル表示状態 |
| `modalAction` | 承認/拒否アクション種別 |
| `remark` | 備考テキスト |

---

## 依存コンポーネント
- `PageHeader`, `DataTable`, `SearchInput`, `FilterSelect`
- `Modal`, `ActionBar`, `StatusBadge`
