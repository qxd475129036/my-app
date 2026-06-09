# ルートページ（リダイレクト）設計書

## 基本情報
- **ルート**: `/`
- **コンポーネント**: `src/app/page.tsx`
- **タイプ**: Server Component
- **認証**: Middlewareによる保護

---

## 処理
- `redirect("/dashboard")` を実行
- ルートアクセス時は常にダッシュボードへリダイレクト

---

## 補足
- このページ自体はレンダリングなし
- 認証はMiddleware（`src/proxy.ts`）で行われる
  - 未認証: `/login` へリダイレクト
  - 認証済み: `/dashboard` へリダイレクト
