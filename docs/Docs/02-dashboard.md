# ダッシュボードページ 設計書

## 基本情報
- **ルート**: `/dashboard`
- **コンポーネント**: `src/app/dashboard/page.tsx`
- **タイプ**: Client Component (`"use client"`)
- **認証**: 必須 — `status === "unauthenticated"` で `/login` にリダイレクト

---

## ページ構成
- レイアウト: `max-w-7xl mx-auto px-8 py-8`

### ヘッダー
- `PageHeader` コンポーネント利用
- title: `"Dashboard"`
- description: `"おかえりなさい、{session.user.name}さん"`

---

## 統計カード（4カラムグリッド）

| カード | 値 | アイコン | トレンド |
|--------|------|---------|---------|
| 総店铺数 | 156 | ビルアイコン | +3件増加（positive） |
| 今月請求額 | ¥4,582,000 | 通貨アイコン | +12.5%増（positive） |
| 処理中請求 | 23 | クリップボードアイコン | 5件未処理（negative） |
| 本代引件数 | 48 | カードアイコン | 前日比+8（positive） |

- 使用コンポーネント: `StatCard`
- Props: `label`, `value`, `icon`, `trend: { value: string, positive: boolean }`

---

## 最近の操作履歴

### データ型: `RecentActivity`
| フィールド | 型 | 説明 |
|-----------|------|------|
| `id` | `string` | 一意識別子 |
| `user` | `string` | 操作ユーザー名 |
| `action` | `string` | 操作内容 |
| `target` | `string` | 対象リソース |
| `time` | `string` | 時刻 |
| `status` | `"completed" | "pending" | "error"` | 状態 |

### テーブルカラム
| カラム | キー | 表示内容 |
|--------|------|---------|
| ユーザー | `user` | テキスト |
| 操作 | `action` | テキスト |
| 対象 | `target` | テキスト |
| 時刻 | `time` | テキスト |
| 状態 | `status` | StatusBadge（色分け: 完了=緑、処理中=黄、エラー=赤） |

### モックデータ
- 8件のサンプルアクティビティ
- モックの範囲: 店铺登録、請求承認、代引出金、単価更新、データ取込、請求一括調整、代引登録、店铺情報修正

---

## 状態管理
| 変数 | 用途 |
|------|------|
| `session`, `status` | NextAuth セッション状態（useSession） |

---

## 依存コンポーネント
- `PageHeader` — ページタイトル・説明
- `StatCard` — 統計カード
- `DataTable` — 操作履歴一覧テーブル

---

## ローディング状態
- `status === "loading"` 時: 中央にスピナー + 「読み込み中...」表示
- `min-h-[60vh]` で中央配置

## 認証ガード
- `useEffect` で `status === "unauthenticated"` 検出 → `router.push("/login")`
- `status === "unauthenticated"` 時は `return null` で何も描画しない
