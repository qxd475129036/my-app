"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { PageHeader } from "@/app/components/PageHeader";
import { StatCard } from "@/app/components/StatCard";
import { DataTable } from "@/app/components/DataTable";

interface RecentActivity {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
  status: "completed" | "pending" | "error";
}

const statusLabel: Record<string, string> = {
  completed: "完了",
  pending: "処理中",
  error: "エラー",
};

const MOCK_ACTIVITIES: RecentActivity[] = [
  { id: "1", user: "山田太郎", action: "店铺登録", target: "東京店", time: "10:32", status: "completed" },
  { id: "2", user: "佐藤花子", action: "請求承認", target: "請求#2024-0891", time: "10:15", status: "completed" },
  { id: "3", user: "田中誠", action: "代引出金", target: "出金#2024-0456", time: "09:48", status: "pending" },
  { id: "4", user: "鈴木一郎", action: "単価更新", target: "商品A-001", time: "09:22", status: "completed" },
  { id: "5", user: "高橋美咲", action: "データ取込", target: "保管明细_202405", time: "08:55", status: "error" },
  { id: "6", user: "伊藤健司", action: "請求一括調整", target: "調整#B-0234", time: "08:30", status: "completed" },
  { id: "7", user: "渡辺優子", action: "代引登録", target: "代引#D-0789", time: "08:12", status: "completed" },
  { id: "8", user: "山本拓也", action: "店铺情報修正", target: "大阪店", time: "07:45", status: "pending" },
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const columns = useMemo(
    () => [
      { key: "user", label: "ユーザー" },
      { key: "action", label: "操作" },
      { key: "target", label: "対象" },
      { key: "time", label: "時刻" },
      {
        key: "status",
        label: "状態",
        render: (row: RecentActivity) => {
          const colors: Record<string, string> = {
            completed: "bg-green-50 text-green-700",
            pending: "bg-amber-50 text-amber-700",
            error: "bg-red-50 text-red-700",
          };
          return (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[row.status]}`}>
              {statusLabel[row.status]}
            </span>
          );
        },
      },
    ],
    []
  );

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
          <p className="mt-3 text-sm text-muted">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <PageHeader
        title="Dashboard"
        description={`おかえりなさい、${session?.user?.name}さん`}
      />

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="総店铺数"
          value="156"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          trend={{ value: "3件増加", positive: true }}
        />
        <StatCard
          label="今月請求額"
          value="¥4,582,000"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          trend={{ value: "12.5%増", positive: true }}
        />
        <StatCard
          label="処理中請求"
          value="23"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          trend={{ value: "5件未処理", positive: false }}
        />
        <StatCard
          label="本代引件数"
          value="48"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          trend={{ value: "前日比+8", positive: true }}
        />
      </div>

      {/* Recent activity */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">最近の操作履歴</h2>
        <DataTable
          columns={columns}
          data={MOCK_ACTIVITIES}
          keyExtractor={(row) => row.id}
          pageSize={10}
          currentPage={1}
          totalItems={MOCK_ACTIVITIES.length}
          onPageChange={() => {}}
          emptyMessage="操作履歴はありません"
        />
      </div>
    </div>
  );
}
