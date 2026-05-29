"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("admin");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        identifier: email,
        password,
      });

      if (result?.error) {
        setError("ログイン情報が正しくありません");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("エラーが発生しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left: Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-[#2563eb] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2563eb] to-[#1d4ed8]" />
        <div className="relative z-10 text-center px-12">
          <div className="mb-6 inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3">MyApp</h1>
          <p className="text-lg text-blue-100 max-w-sm mx-auto">
            業務管理システム — マスタデータ管理、請求処理、代引業務を一元管理
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6 max-w-sm mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold">27+</div>
              <div className="text-xs text-blue-200 mt-1">機能モジュール</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">99.9%</div>
              <div className="text-xs text-blue-200 mt-1">稼働率</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-xs text-blue-200 mt-1">サポート</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-10 text-center">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-[#2563eb] text-white mb-4">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-foreground">MyApp</h1>
            <p className="text-sm text-muted mt-1">業務管理システム</p>
          </div>

          <h2 className="text-xl font-semibold text-foreground mb-1">ログイン</h2>
          <p className="text-sm text-muted mb-8">アカウント情報を入力してください</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-foreground mb-1.5">
                ユーザー名
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
                placeholder="ユーザー名を入力"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                パスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
                placeholder="パスワードを入力"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  ログイン中...
                </span>
              ) : (
                "ログイン"
              )}
            </button>
          </form>

          <div className="mt-8 rounded-lg bg-gray-50 border border-border p-4">
            <p className="text-xs font-medium text-muted mb-2">デモ認証情報</p>
            <div className="text-xs text-muted space-y-0.5">
              <p>ユーザー名: <span className="font-medium text-foreground">admin</span></p>
              <p>パスワード: <span className="font-medium text-foreground">password</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
