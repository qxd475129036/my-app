# ログインページ 設計書

## 基本情報
- **ルート**: `/login`
- **コンポーネント**: `src/app/login/page.tsx`
- **タイプ**: Client Component (`"use client"`)
- **認証**: 未認証ユーザー向け（認証済みユーザーはMiddlewareによりアクセス制御）

---

## ページ構成

### レイアウト
- 2ペイン分割レイアウト（`flex min-h-screen`）
  - 左ペイン: ブランドパネル（`lg:w-1/2`、大画面のみ表示）
  - 右ペイン: ログインフォーム（`flex-1`）

### 左ペイン — ブランドパネル
- 背景: `bg-[#2563eb]` に `bg-gradient-to-br from-[#2563eb] to-[#1d4ed8]`
- ロゴ: 白い盾アイコン（SVG）
- アプリ名: `MyApp`
- サブテキスト: 「業務管理システム — マスタデータ管理、請求処理、代引業務を一元管理」
- 統計表示（3カラムグリッド）:
  - 27+ 機能モジュール
  - 99.9% 稼働率
  - 24/7 サポート

### 右ペイン — ログインフォーム

#### モバイル表示（`lg:hidden`）
- アプリアイコン + 「MyApp」タイトル + 「業務管理システム」サブテキスト

#### フォーム要素
| 項目 | タイプ | ID | プレースホルダー | 注意事項 |
|------|--------|-----|-----------------|---------|
| ユーザー名 | `text` | `identifier` | 「ユーザー名を入力」 | `autoComplete="username"`、`required` |
| パスワード | `password` | `password` | 「パスワードを入力」 | `autoComplete="current-password"`、`required` |

- 初期値: ユーザー名 = `admin`、パスワード = `password`
- ログインボタン: 送信時にローディングスピナー表示 + ボタンテキスト「ログイン中...」

#### エラー表示
- 赤枠のエラーバナー（`bg-red-50 border border-red-200`）
- エラー種別:
  - 認証失敗: 「ログイン情報が正しくありません」
  - システムエラー: 「エラーが発生しました。もう一度お試しください。」

---

## 認証ロジック
- `signIn("credentials", { redirect: false, identifier, password })` を呼び出し
- 成功時: `router.push("/dashboard")` + `router.refresh()`
- エラー時: `result?.error` を判定してエラーメッセージ表示
- 送信中は `isLoading = true` でボタン無効化

### デモ認証情報表示
- フォーム下部にグレーのボックス（`bg-gray-50`）
- 「デモ認証情報」見出し
- ユーザー名: `admin`
- パスワード: `password`

---

## 状態管理
| 変数 | 型 | 初期値 | 用途 |
|------|-----|--------|------|
| `email` | `string` | `"admin"` | ユーザー名入力値 |
| `password` | `string` | `"password"` | パスワード入力値 |
| `error` | `string` | `""` | エラーメッセージ |
| `isLoading` | `boolean` | `false` | 送信状態 |

---

## 依存コンポーネント
- なし（独自実装）
- 使用ライブラリ: `next-auth/react`（signIn）、`next/navigation`（useRouter）

---

## 注意事項
- Middleware（`src/proxy.ts`）により、認証済みユーザーが `/login` にアクセスすると `/dashboard` にリダイレクトされる
- 認証情報はハードコードされたデモ用で、本番環境では差し替えが必要
