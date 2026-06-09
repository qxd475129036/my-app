"use client";

import { useState, useMemo, useCallback } from "react";

import { PageHeader } from "@/app/components/PageHeader";
import { Modal } from "@/app/components/Modal";

interface ScheduleEntry {
  id: string;
  year: number;
  month: number;
  jpDepositDate: string;
  sgDepositDate: string;
  closingDate: string;
  paymentDate: string;
  jpProcessed: boolean;
  sgProcessed: boolean;
}

const monthNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
const monthColors = [
  "#6366f1", "#7c6ff7", "#8b5cf6", "#9b6ff7",
  "#a855f7", "#b35ef7", "#6366f1", "#7c6ff7",
  "#8b5cf6", "#9b6ff7", "#a855f7", "#b35ef7",
];

const getDaysInMonth = (year: number, month: number): number =>
  new Date(year, month + 1, 0).getDate();

const generateDefaultSchedule = (year: number, month: number): ScheduleEntry[] => {
  const daysInMonth = getDaysInMonth(year, month);
  const lastDay = String(daysInMonth);
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  const nextMonthDays = getDaysInMonth(nextYear, nextMonth);

  return [
    {
      id: `${year}-${month}-0`,
      year,
      month,
      jpDepositDate: "15",
      sgDepositDate: "12",
      closingDate: "10",
      paymentDate: lastDay,
      jpProcessed: false,
      sgProcessed: false,
    },
    {
      id: `${year}-${month}-1`,
      year,
      month,
      jpDepositDate: "27",
      sgDepositDate: "25",
      closingDate: "25",
      paymentDate: `${nextMonth + 1}/${nextMonthDays}`,
      jpProcessed: false,
      sgProcessed: false,
    },
  ];
};

function resolveDateString(year: number, month: number, s: string): Date {
  if (s.includes("/")) {
    const [m, d] = s.split("/").map(Number);
    return new Date(year, m - 1, d);
  }
  return new Date(year, month, Number(s) || 1);
}

function countdownDays(target: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function CalendarPage() {
  const currentYear = new Date().getFullYear();

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [schedules, setSchedules] = useState<Record<number, ScheduleEntry[]>>(() => {
    const all: ScheduleEntry[] = [];
    for (let month = 0; month < 12; month++) {
      all.push(...generateDefaultSchedule(currentYear, month));
    }
    return { [currentYear]: all };
  });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ScheduleEntry | null>(null);
  const [newYearModalOpen, setNewYearModalOpen] = useState(false);
  const [newYearValue, setNewYearValue] = useState(currentYear + 1);

  const currentEntries: ScheduleEntry[] = schedules[selectedYear] || [];
  const availableYears = useMemo(() => {
    const years = new Set(Object.keys(schedules).map(Number));
    years.add(currentYear);
    return Array.from(years).sort();
  }, [schedules, currentYear]);

  const monthlyData = useMemo(() => {
    const map: Record<number, ScheduleEntry[]> = {};
    for (let m = 0; m < 12; m++) map[m] = [];
    currentEntries.forEach((e) => {
      map[e.month]?.push(e);
    });
    return map;
  }, [currentEntries]);

  // Next deposit — use a plain loop to avoid TS narrowing issues
  const nextDeposit = useMemo((): { entry: ScheduleEntry; daysLeft: number } | null => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    let bestEntry: ScheduleEntry | null = null;
    let bestDiff = Infinity;

    for (let i = 0; i < currentEntries.length; i++) {
      const e = currentEntries[i];
      const d = resolveDateString(e.year, e.month, e.jpDepositDate);
      d.setHours(0, 0, 0, 0);
      const diff = d.getTime() - now.getTime();
      if (diff > 0 && diff < bestDiff) {
        bestDiff = diff;
        bestEntry = e;
      }
    }

    if (!bestEntry) return null;
    const daysLeft = countdownDays(
      resolveDateString(bestEntry.year, bestEntry.month, bestEntry.jpDepositDate)
    );
    return { entry: bestEntry, daysLeft };
  }, [currentEntries]);

  // Edit handlers
  const openEdit = useCallback((entry: ScheduleEntry) => {
    setEditingEntry({ ...entry });
    setEditModalOpen(true);
  }, []);

  const saveEntry = useCallback(() => {
    if (!editingEntry) return;
    setSchedules((prev) => {
      const filtered = (prev[selectedYear] || []).filter(
        (e) => e.id !== editingEntry.id
      );
      const merged = [...filtered, editingEntry];
      merged.sort((a, b) => a.month - b.month || a.id.localeCompare(b.id));
      return { ...prev, [selectedYear]: merged };
    });
    setEditModalOpen(false);
  }, [editingEntry, selectedYear]);

  const toggleJPProcessed = useCallback((e: React.MouseEvent, entry: ScheduleEntry) => {
    e.stopPropagation();
    setSchedules((prev) => {
      const yearSchedules = (prev[selectedYear] || []).map((en) =>
        en.id === entry.id ? { ...en, jpProcessed: !en.jpProcessed } : en
      );
      return { ...prev, [selectedYear]: yearSchedules };
    });
  }, [selectedYear]);

  const toggleSGProcessed = useCallback((e: React.MouseEvent, entry: ScheduleEntry) => {
    e.stopPropagation();
    setSchedules((prev) => {
      const yearSchedules = (prev[selectedYear] || []).map((en) =>
        en.id === entry.id ? { ...en, sgProcessed: !en.sgProcessed } : en
      );
      return { ...prev, [selectedYear]: yearSchedules };
    });
  }, [selectedYear]);

  // 新規作成
  const createNewYear = useCallback(() => {
    if (schedules[newYearValue]) {
      alert(`${newYearValue}年のデータは既に存在します。`);
      return;
    }
    const all: ScheduleEntry[] = [];
    for (let month = 0; month < 12; month++) {
      all.push(...generateDefaultSchedule(newYearValue, month));
    }
    setSchedules((prev) => ({ ...prev, [newYearValue]: all }));
    setSelectedYear(newYearValue);
    setNewYearModalOpen(false);
  }, [newYearValue, schedules]);

  return (
    <div className="w-full px-8 py-8">
      <PageHeader
        title="配送日历"
        description="入金・締日・支付のスケジュール管理。"
        actions={
          <div className="flex items-center gap-2">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>{y}年</option>
              ))}
            </select>
            <button
              onClick={() => setNewYearModalOpen(true)}
              className="rounded-lg bg-accent px-4 py-2 text-sm text-white hover:bg-accent-hover transition-colors"
            >
              ✨ 新規作成
            </button>
          </div>
        }
      />

      {/* Next deposit banner */}
      {nextDeposit && (
        <div className="mb-6 rounded-xl border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-violet-50 p-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-2xl">📅</span>
            <div>
              <div className="text-xs text-gray-500 mb-1">次回入金日</div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 bg-white text-blue-700 font-extrabold text-lg px-3 py-1 rounded-md shadow-sm">
                  <span className="text-[10px] font-semibold opacity-70">JP</span>
                  {nextDeposit.entry.jpDepositDate}
                </span>
                <span className="text-purple-300">·</span>
                <span className="inline-flex items-center gap-1 bg-white text-amber-600 font-extrabold text-lg px-3 py-1 rounded-md shadow-sm">
                  <span className="text-[10px] font-semibold opacity-70">佐川</span>
                  {nextDeposit.entry.sgDepositDate}
                </span>
              </div>
              <div className="text-[10px] text-gray-500 mt-1">
                締日 {nextDeposit.entry.closingDate} · 支付预定日 {nextDeposit.entry.paymentDate}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">残り</div>
            <div className="text-2xl font-extrabold text-violet-600">
              {nextDeposit.daysLeft}
              <span className="text-sm font-medium">日</span>
            </div>
          </div>
        </div>
      )}

      {/* Month grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 12 }, (_, m) => m).map((month) => {
          const entries = monthlyData[month] || [];
          const isNextMonth =
            nextDeposit?.entry.month === month && nextDeposit?.entry.year === selectedYear;
          return (
            <div
              key={month}
              className={`rounded-xl border overflow-hidden transition-all ${
                isNextMonth
                  ? "border-indigo-400 shadow-[0_0_0_2px_rgba(99,102,241,0.15)]"
                  : "border-card-border"
              } bg-card`}
            >
              <div
                className="px-4 py-2 text-sm font-semibold text-white"
                style={{ background: monthColors[month] }}
              >
                {monthNames[month]}
              </div>
              <div className="p-3 space-y-2">
                {entries.length === 0 && (
                  <p className="text-xs text-muted text-center py-3">予定なし</p>
                )}
                {entries.map((entry) => {
                  const isNextEntry =
                    isNextMonth && entry.id === nextDeposit?.entry.id;
                  return (
                    <div
                      key={entry.id}
                      onClick={() => openEdit(entry)}
                      className={`flex items-center justify-between gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                        isNextEntry
                          ? "border-indigo-400 bg-indigo-50 shadow-[0_0_0_0_rgba(99,102,241,0.4)] animate-pulse"
                          : "border-border bg-white hover:bg-gray-50 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`inline-flex items-center gap-0.5 rounded-md px-2 py-1 text-xs font-bold flex-shrink-0 ${
                          entry.jpDepositDate.includes("/")
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-blue-100 text-blue-700"
                        }`}>
                          JP<span className="text-base ml-0.5">{entry.jpDepositDate}</span>
                        </span>
                        <span className="text-gray-300 text-[10px]">·</span>
                        <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-50 text-amber-700 px-2 py-1 text-xs font-bold flex-shrink-0">
                          佐川<span className="text-base ml-0.5">{entry.sgDepositDate}</span>
                        </span>
                        {isNextEntry && (
                          <span className="text-[9px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-semibold flex-shrink-0">
                            ← 次回
                          </span>
                        )}
                        <span className="text-[10px] text-gray-400 ml-1 flex-shrink-0 truncate">
                          締<span className="text-gray-500 font-semibold">{entry.closingDate}</span>
                          {" "}支<span className="text-gray-500 font-semibold">{entry.paymentDate}</span>
                        </span>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={(e) => toggleJPProcessed(e, entry)}
                          className={`text-[9px] px-1.5 py-0.5 rounded font-semibold border transition-colors ${
                            entry.jpProcessed
                              ? "bg-blue-500 text-white border-blue-500"
                              : "bg-white text-gray-400 border-gray-200 hover:border-blue-300"
                          }`}
                        >
                          JP{entry.jpProcessed ? " ✓" : ""}
                        </button>
                        <button
                          onClick={(e) => toggleSGProcessed(e, entry)}
                          className={`text-[9px] px-1.5 py-0.5 rounded font-semibold border transition-colors ${
                            entry.sgProcessed
                              ? "bg-amber-500 text-white border-amber-500"
                              : "bg-white text-gray-400 border-gray-200 hover:border-amber-300"
                          }`}
                        >
                          佐川{entry.sgProcessed ? " ✓" : ""}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit modal */}
      {editingEntry && (
        <Modal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title={`日程編集 — ${monthNames[editingEntry.month]}${editingEntry.id.endsWith("0") ? "①" : "②"}`}
          size="sm"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">JP入金日</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editingEntry.jpDepositDate}
                  onChange={(e) =>
                    setEditingEntry({ ...editingEntry, jpDepositDate: e.target.value || "1" })
                  }
                  placeholder="日 または 月/日"
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
                <span className="text-[10px] text-gray-400 w-12 shrink-0">月/日</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">佐川入金日</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editingEntry.sgDepositDate}
                  onChange={(e) =>
                    setEditingEntry({ ...editingEntry, sgDepositDate: e.target.value || "1" })
                  }
                  placeholder="日"
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
                <span className="text-[10px] text-gray-400 w-12 shrink-0">日</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">締日</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editingEntry.closingDate}
                  onChange={(e) =>
                    setEditingEntry({ ...editingEntry, closingDate: e.target.value || "1" })
                  }
                  placeholder="日"
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
                <span className="text-[10px] text-gray-400 w-12 shrink-0">日</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">支付预定日</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editingEntry.paymentDate}
                  onChange={(e) =>
                    setEditingEntry({ ...editingEntry, paymentDate: e.target.value || "1" })
                  }
                  placeholder="日 または 月/日"
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
                <span className="text-[10px] text-gray-400 w-12 shrink-0">月/日</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditModalOpen(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={saveEntry}
                className="rounded-lg bg-accent px-4 py-2 text-sm text-white hover:bg-accent-hover transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* New year modal */}
      <Modal
        isOpen={newYearModalOpen}
        onClose={() => setNewYearModalOpen(false)}
        title="新年份作成"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">
            新しい年のスケジュールをデフォルト値で生成します。
          </p>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">年度</label>
            <input
              type="number"
              value={newYearValue}
              onChange={(e) => setNewYearValue(Number(e.target.value) || currentYear + 1)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
          </div>
          <div className="text-xs text-muted space-y-1">
            <p>生成规则：</p>
            <p>· JP入金日=15 → 佐川=12, 締日=10, 支付=月末</p>
            <p>· JP入金日=27 → 佐川=25, 締日=25, 支付=次月末</p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setNewYearModalOpen(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={createNewYear}
              className="rounded-lg bg-accent px-4 py-2 text-sm text-white hover:bg-accent-hover transition-colors"
            >
              作成
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
