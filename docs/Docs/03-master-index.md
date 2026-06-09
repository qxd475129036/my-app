# Master管理（インデックスページ）設計書

## 基本情報
- **ルート**: `/master`
- **コンポーネント**: `src/app/master/page.tsx`
- **タイプ**: Server Component（データフェッチなし）
- **認証**: Middleware によるルート保護（Navbarは認証済みユーザーにのみ表示）

---

## ページ構成
- レイアウト: `max-w-7xl mx-auto px-8 py-8`

### ヘッダー
- h1: 「Master管理」
- サブテキスト: 「マスタデータ管理モジュール」

---

## モジュールカード一覧（3カラムグリッド）

各カードは `Link` でサブモジュールに遷移。

| モジュール | href | アイコン | 説明 |
|-----------|------|---------|------|
| 店铺管理 | `/master/store` | ビルアイコン | 店铺情報の管理。LOB管理、店铺詳細情報のCRUD。 |
| 請求CD管理 | `/master/request-cd` | ドキュメントアイコン | 請求CDの登録、編集、削除。バッチ操作、ページネーション。 |
| 単価管理 | `/master/price` | 通貨アイコン | 商品単価の一括管理。検索、フィルタ、CSV出力機能。 |

### カードデザイン
- `rounded-xl border border-card-border bg-card p-6`
- ホバー時: `hover:shadow-lg hover:border-accent/30`
- アイコンラッパー: `h-14 w-14 rounded-xl bg-accent-light text-accent`
  - ホバー時: `group-hover:bg-accent group-hover:text-white`
- タイトル: `text-lg font-semibold`、ホバー時 `group-hover:text-accent`
- 説明: `text-sm text-muted leading-relaxed`

---

## 依存コンポーネント
- `Link`（next/link）
- SVGアイコン（インライン定義）
