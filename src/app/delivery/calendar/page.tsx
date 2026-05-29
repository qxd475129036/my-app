"use client";

import { useState, useMemo } from "react";

import { PageHeader } from "@/app/components/PageHeader";
import { Modal } from "@/app/components/Modal";

interface ScheduleEntry {
  id: string;
  year: number;
  month: number;
  depositDate: number;
  settlementDate: number;
  withdrawalDate: number;
  remark: string;
}

const monthNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
const DEFAULT_DEPOSIT_DAYS = [12, 27];

const getDaysInMonth = (year: number, month: number): number => new Date(year, month + 1, 0).getDate();

const generateDefaultSchedule = (year: number, month: number): ScheduleEntry[] => {
  const entries: ScheduleEntry[] = [];
  const daysInMonth = getDaysInMonth(year, month);
  DEFAULT_DEPOSIT_DAYS.forEach((depositDay) => {
    if (depositDay <= daysInMonth) {
      const settlementDay = depositDay + 2;
      const withdrawalDay = depositDay + 5;
      entries.push({
        id: `${year}-${month}-${depositDay}`,
        year,
        month,
        depositDate: depositDay,
        settlementDate: settlementDay > daysInMonth ? settlementDay - daysInMonth : settlementDay,
        withdrawalDate: withdrawalDay > daysInMonth ? withdrawalDay - daysInMonth : withdrawalDay,
        remark: "",
      });
    }
  });
  return entries;
};

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const currentEntries: ScheduleEntry[] = schedules[selectedYear] || [];

  // Group by month
  const monthlyData = useMemo(() => {
    const map: Record<number, ScheduleEntry[]> = {};
    for (let m = 0; m < 12; m++) map[m] = [];
    currentEntries.forEach((e) => { map[e.month]?.push(e); });
    return map;
  }, [currentEntries]);

  const totalEntries = currentEntries.length;

  // Find next deposit
  const nextDeposit = useMemo((): ScheduleEntry | null => {
    const now = new Date();
    let closest: ScheduleEntry | null = null;
    let minDiff = Infinity;
    currentEntries.forEach((e) => {
      const d = new Date(e.year, e.month, e.depositDate);
      const diff = d.getTime() - now.getTime();
      if (diff > 0 && diff < minDiff) { minDiff = diff; closest = e; }
    });
    return closest;
  }, [currentEntries]);

  const openEdit = (entry: ScheduleEntry) => {
    setEditingEntry({ ...entry });
    setEditModalOpen(true);
  };

  const saveEntry = () => {
    if (!editingEntry) return;
    setSchedules((prev) => {
      const yearSchedules = (prev[selectedYear] || []).filter(
        (e) => e.id !== editingEntry.id
      );
      return { ...prev, [selectedYear]: [...yearSchedules, editingEntry] };
    });
    setEditModalOpen(false);
  };

  const formatDate = (year: number, month: number, day: number): string =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  return (
    <div className="w-full px-8 py-8">
      <PageHeader
        title="配送日曆"
        description="入金・決済・出金のスケジュール管理。"
        actions={
          <div className="flex items-center gap-2">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            >
              {[2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>{y}年</option>
              ))}
            </select>
          </div>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-card-border bg-card p-4 text-center">
          <div className="text-xs font-medium text-muted uppercase tracking-wide">総登録件数</div>
          <div className="mt-1 text-2xl font-bold text-foreground">{totalEntries}件</div>
        </div>
        <div className="rounded-xl border border-card-border bg-card p-4 text-center">
          <div className="text-xs font-medium text-muted uppercase tracking-wide">年間予定月数</div>
          <div className="mt-1 text-2xl font-bold text-accent">12ヶ月</div>
        </div>
        <div className="rounded-xl border border-card-border bg-card p-4 text-center">
          <div className="text-xs font-medium text-muted uppercase tracking-wide">次回入金日</div>
          <div className="mt-1 text-lg font-bold text-foreground">
            {nextDeposit
              ? formatDate(nextDeposit.year, nextDeposit.month, nextDeposit.depositDate)
              : "--"}
          </div>
        </div>
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 12 }, (_, m) => m).map((month) => {
          const entries = monthlyData[month] || [];
          return (
            <div
              key={month}
              className="rounded-xl border border-card-border bg-card overflow-hidden"
            >
              <div className="bg-accent text-white px-4 py-2 text-sm font-semibold">
                {monthNames[month]}
              </div>
              <div className="p-3 space-y-2">
                {entries.length === 0 && (
                  <p className="text-xs text-muted text-center py-2">予定なし</p>
                )}
                {entries.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => openEdit(entry)}
                    className="w-full text-left rounded-lg border border-border bg-white p-3 hover:bg-accent-light hover:border-accent/30 transition-all group"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-foreground">
                        入金: {entry.depositDate}日
                      </span>
                      <span className="text-[10px] text-muted group-hover:text-accent transition-colors">編集</span>
                    </div>
                    <div className="flex gap-3 text-[10px] text-muted">
                      <span>決済: {entry.settlementDate}日</span>
                      <span>出金: {entry.withdrawalDate}日</span>
                    </div>
                    {entry.remark && (
                      <p className="mt-1 text-[10px] text-muted truncate">{entry.remark}</p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {editingEntry && (
        <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="日程編集" size="sm">
          <div className="space-y-4">
            <div className="text-sm text-muted">
              {selectedYear}年 {monthNames[editingEntry.month]} — {editingEntry.depositDate}日 入金
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">入金日</label>
              <input
                type="number" min={1} max={31}
                value={editingEntry.depositDate}
                onChange={(e) => setEditingEntry({ ...editingEntry, depositDate: Number(e.target.value) || 1 })}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">決済日</label>
              <input
                type="number" min={1} max={31}
                value={editingEntry.settlementDate}
                onChange={(e) => setEditingEntry({ ...editingEntry, settlementDate: Number(e.target.value) || 1 })}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">出金日</label>
              <input
                type="number" min={1} max={31}
                value={editingEntry.withdrawalDate}
                onChange={(e) => setEditingEntry({ ...editingEntry, withdrawalDate: Number(e.target.value) || 1 })}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">備考</label>
              <textarea
                value={editingEntry.remark}
                onChange={(e) => setEditingEntry({ ...editingEntry, remark: e.target.value })}
                rows={2}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditModalOpen(false)} className="rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-gray-50 transition-colors">取消</button>
              <button onClick={saveEntry} className="rounded-lg bg-accent px-4 py-2 text-sm text-white hover:bg-accent-hover transition-colors">保存</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
