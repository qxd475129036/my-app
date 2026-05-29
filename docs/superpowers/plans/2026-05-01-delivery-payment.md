# Delivery Payment Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-featured payment (出金) overview page at `/delivery/payment` with search, filters, stat cards, data table, and detail modal.

**Architecture:** Single "use client" component following the established pattern in `delivery/list/page.tsx` — in-memory mock data, useState/useMemo for state, inline sub-components, detail modal with fixed overlay.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS 4, TypeScript, NextAuth.js.

---

## File Structure

- **Modify:** `src/app/delivery/payment/page.tsx` — replace placeholder with full implementation
- **No new files needed** — follows the established pattern of self-contained page components

## Design Decisions

- **出金 (withdrawal)** in this context = payment records from cash-on-delivery orders. Each record represents a withdrawal from the delivery company to the merchant.
- **Payment methods:** 現金 (Cash), 銀行振込 (Bank Transfer), クレジットカード (Credit Card)
- **Statuses:** 完了 (Completed), 保留中 (Pending), 取消 (Cancelled)
- **Reuse STATUS_COLORS pattern** from `delivery/list/page.tsx` for consistency
- **Japanese labels** throughout (app is Japanese-language)
- **Dark mode** support with `dark:` variants

---

### Task 1: Define PaymentRecord Interface and Constants

**Files:**
- Modify: `src/app/delivery/payment/page.tsx`

- [ ] **Step 1: Add interface and constants**

Replace the placeholder with the full component. Start by defining the data model:

```tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface PaymentRecord {
  id: string;
  paymentNumber: string;
  orderNumber: string;
  storeName: string;
  amount: number;
  paymentMethod: "cash" | "bank" | "credit";
  status: "completed" | "pending" | "cancelled";
  withdrawalDate: string;
  createdAt: string;
}

const PAYMENT_METHOD_LABELS: Record<PaymentRecord["paymentMethod"], string> = {
  cash: "現金",
  bank: "銀行振込",
  credit: "クレジットカード",
};

const PAYMENT_METHOD_COLORS: Record<PaymentRecord["paymentMethod"], string> = {
  cash: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  bank: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  credit: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
};

const STATUS_LABELS: Record<PaymentRecord["status"], string> = {
  completed: "完了",
  pending: "保留中",
  cancelled: "取消",
};

const STATUS_COLORS: Record<PaymentRecord["status"], string> = {
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};
```

- [ ] **Step 2: Add mock data**

```tsx
const MOCK_PAYMENT_DATA: PaymentRecord[] = [
  {
    id: "PM001",
    paymentNumber: "PAY-2024-001",
    orderNumber: "ORD-2024-001",
    storeName: "Store A",
    amount: 15000,
    paymentMethod: "cash",
    status: "completed",
    withdrawalDate: "2024-04-03",
    createdAt: "2024-04-01T10:00:00Z",
  },
  {
    id: "PM002",
    paymentNumber: "PAY-2024-002",
    orderNumber: "ORD-2024-002",
    storeName: "Store B",
    amount: 25000,
    paymentMethod: "bank",
    status: "pending",
    withdrawalDate: "2024-04-05",
    createdAt: "2024-04-02T09:15:00Z",
  },
  {
    id: "PM003",
    paymentNumber: "PAY-2024-003",
    orderNumber: "ORD-2024-003",
    storeName: "Store A",
    amount: 18000,
    paymentMethod: "credit",
    status: "completed",
    withdrawalDate: "2024-04-04",
    createdAt: "2024-04-03T14:20:00Z",
  },
  {
    id: "PM004",
    paymentNumber: "PAY-2024-004",
    orderNumber: "ORD-2024-004",
    storeName: "Store C",
    amount: 32000,
    paymentMethod: "cash",
    status: "completed",
    withdrawalDate: "2024-04-06",
    createdAt: "2024-04-04T08:45:00Z",
  },
  {
    id: "PM005",
    paymentNumber: "PAY-2024-005",
    orderNumber: "ORD-2024-005",
    storeName: "Store B",
    amount: 22000,
    paymentMethod: "bank",
    status: "cancelled",
    withdrawalDate: "2024-04-07",
    createdAt: "2024-04-05T11:30:00Z",
  },
  {
    id: "PM006",
    paymentNumber: "PAY-2024-006",
    orderNumber: "ORD-2024-006",
    storeName: "Store D",
    amount: 45000,
    paymentMethod: "credit",
    status: "pending",
    withdrawalDate: "2024-04-09",
    createdAt: "2024-04-06T16:00:00Z",
  },
  {
    id: "PM007",
    paymentNumber: "PAY-2024-007",
    orderNumber: "ORD-2024-007",
    storeName: "Store A",
    amount: 12000,
    paymentMethod: "cash",
    status: "completed",
    withdrawalDate: "2024-04-08",
    createdAt: "2024-04-07T09:00:00Z",
  },
  {
    id: "PM008",
    paymentNumber: "PAY-2024-008",
    orderNumber: "ORD-2024-008",
    storeName: "Store E",
    amount: 55000,
    paymentMethod: "bank",
    status: "completed",
    withdrawalDate: "2024-04-08",
    createdAt: "2024-04-07T13:30:00Z",
  },
];
```

- [ ] **Step 3: Verify** — No TypeScript errors, file compiles

---

### Task 2: Implement Page Component with State and Loading

**Files:**
- Modify: `src/app/delivery/payment/page.tsx`

- [ ] **Step 1: Add component with state variables**

```tsx
export default function PaymentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    setTimeout(() => {
      setPayments(MOCK_PAYMENT_DATA);
      setLoading(false);
    }, 500);
  }, [status, router]);
```

- [ ] **Step 2: Add loading return**

```tsx
  if (loading) {
    return (
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="text-center text-zinc-900 dark:text-white">Loading...</div>
      </div>
    );
  }
```

- [ ] **Step 3: Verify** — Component renders with loading state

---

### Task 3: Implement Filter Logic and Computed Values

**Files:**
- Modify: `src/app/delivery/payment/page.tsx`

- [ ] **Step 1: Add filteredPayments useMemo**

```tsx
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesSearch =
        payment.paymentNumber.includes(searchTerm) ||
        payment.orderNumber.includes(searchTerm) ||
        payment.storeName.includes(searchTerm);
      const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
      const matchesMethod = methodFilter === "all" || payment.paymentMethod === methodFilter;
      const matchesDateFrom =
        !dateFrom || new Date(payment.createdAt) >= new Date(dateFrom);
      const matchesDateTo =
        !dateTo || new Date(payment.createdAt) <= new Date(dateTo);
      return matchesSearch && matchesStatus && matchesMethod && matchesDateFrom && matchesDateTo;
    });
  }, [payments, searchTerm, statusFilter, methodFilter, dateFrom, dateTo]);
```

- [ ] **Step 2: Add computed stats**

```tsx
  const totalAmount = useMemo(() => {
    return filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  }, [filteredPayments]);

  const completedAmount = useMemo(() => {
    return filteredPayments
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + p.amount, 0);
  }, [filteredPayments]);

  const pendingAmount = useMemo(() => {
    return filteredPayments
      .filter((p) => p.status === "pending")
      .reduce((sum, p) => sum + p.amount, 0);
  }, [filteredPayments]);
```

- [ ] **Step 3: Add handler functions**

```tsx
  const handleViewDetail = (payment: PaymentRecord) => {
    setSelectedPayment(payment);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedPayment(null);
  };

  const handleSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };
```

- [ ] **Step 4: Verify** — No TypeScript errors

---

### Task 4: Implement Stat Cards

**Files:**
- Modify: `src/app/delivery/payment/page.tsx`

- [ ] **Step 1: Add stat cards section**

Place after the filter bar, before the table:

```tsx
        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white dark:bg-zinc-900 px-4 py-6 shadow">
            <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              総出金額
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-zinc-900 dark:text-white">
              ¥{totalAmount.toLocaleString()}
            </dd>
          </div>
          <div className="rounded-lg bg-white dark:bg-zinc-900 px-4 py-6 shadow">
            <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              完了金額
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-green-600 dark:text-green-400">
              ¥{completedAmount.toLocaleString()}
            </dd>
          </div>
          <div className="rounded-lg bg-white dark:bg-zinc-900 px-4 py-6 shadow">
            <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              保留中金額
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-yellow-600 dark:text-yellow-400">
              ¥{pendingAmount.toLocaleString()}
            </dd>
          </div>
          <div className="rounded-lg bg-white dark:bg-zinc-900 px-4 py-6 shadow">
            <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              出金件数
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-zinc-900 dark:text-white">
              {filteredPayments.length}
            </dd>
          </div>
        </div>
```

- [ ] **Step 2: Verify** — Cards render correctly with mock data

---

### Task 5: Implement Filter Bar

**Files:**
- Modify: `src/app/delivery/payment/page.tsx`

- [ ] **Step 1: Add filter bar**

Place after the page header, before the stat cards:

```tsx
        {/* Filters */}
        <div className="mb-6 rounded-lg bg-white dark:bg-zinc-900 p-4 shadow">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                検索
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="出金番号, 注文番号, 店舗"
                className="mt-1 block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                状態
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="mt-1 block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">すべて</option>
                <option value="completed">完了</option>
                <option value="pending">保留中</option>
                <option value="cancelled">取消</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                支払方法
              </label>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="mt-1 block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">すべて</option>
                <option value="cash">現金</option>
                <option value="bank">銀行振込</option>
                <option value="credit">クレジットカード</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                From Date
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="mt-1 block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                To Date
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="mt-1 block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
```

- [ ] **Step 2: Verify** — Filters work with mock data

---

### Task 6: Implement Data Table

**Files:**
- Modify: `src/app/delivery/payment/page.tsx`

- [ ] **Step 1: Add table section**

Place after the filter bar (before stat cards or after — same pattern as list page):

```tsx
        {/* Payments Table */}
        <div className="bg-white dark:bg-zinc-900 shadow sm:rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
              <thead className="bg-zinc-50 dark:bg-zinc-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    出金番号
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    注文番号
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    店舗
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    金額
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    支払方法
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    状態
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    出金日
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    作成日
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-6 py-12 text-center text-zinc-500 dark:text-zinc-400"
                    >
                      該当する出金レコードがありません
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-white">
                        {payment.paymentNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300">
                        {payment.orderNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300">
                        {payment.storeName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-white">
                        ¥{payment.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PAYMENT_METHOD_COLORS[payment.paymentMethod]}`}
                        >
                          {PAYMENT_METHOD_LABELS[payment.paymentMethod]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[payment.status]}`}
                        >
                          {STATUS_LABELS[payment.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                        {payment.withdrawalDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewDetail(payment)}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                        >
                          詳細
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
```

- [ ] **Step 2: Verify** — Table renders with all columns, badges display correctly

---

### Task 7: Implement Detail Modal

**Files:**
- Modify: `src/app/delivery/payment/page.tsx`

- [ ] **Step 1: Add modal markup**

Place after the `</main>` closing tag, before the final `</div>`:

```tsx
      {/* Detail Modal */}
      {showDetailModal && selectedPayment && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-zinc-900 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={handleCloseModal}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-zinc-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              <div className="bg-white dark:bg-zinc-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-zinc-900 dark:text-white" id="modal-title">
                      出金詳細
                    </h3>
                    <div className="mt-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">出金番号</p>
                          <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-white">{selectedPayment.paymentNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">注文番号</p>
                          <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-white">{selectedPayment.orderNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">店舗</p>
                          <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-white">{selectedPayment.storeName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">金額</p>
                          <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-white">¥{selectedPayment.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">支払方法</p>
                          <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-white">{PAYMENT_METHOD_LABELS[selectedPayment.paymentMethod]}</p>
                        </div>
                        <div>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">状態</p>
                          <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-white">{STATUS_LABELS[selectedPayment.status]}</p>
                        </div>
                        <div>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">出金日</p>
                          <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-white">{selectedPayment.withdrawalDate}</p>
                        </div>
                        <div>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">作成日</p>
                          <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-white">{new Date(selectedPayment.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleCloseModal}
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
```

- [ ] **Step 2: Verify** — Modal opens/closes, displays correct data

---

### Task 8: Wire Up Page Header and Success Message

**Files:**
- Modify: `src/app/delivery/payment/page.tsx`

- [ ] **Step 1: Add page header and success message**

In the `<main>` section, after the opening `<div>`:

```tsx
      <main className="flex-1 mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 rounded-md bg-green-50 dark:bg-green-900/20 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700 dark:text-green-300">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            出金一覧
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            出金レコードの管理
          </p>
        </div>
```

- [ ] **Step 2: Verify** — Page renders with header, success message appears briefly

---

### Task 9: Verify Navbar Link

**Files:**
- Check: `src/app/components/Navbar.tsx`

- [ ] **Step 1: Confirm existing link**

The Navbar already has the link at line 43:
```tsx
{ name: "出金一覧", href: "/delivery/payment" },
```

No changes needed. Verify by checking the file.

- [ ] **Step 2: Verify** — Clicking "出金一覧" in the Navbar navigates to `/delivery/payment`

---

## Self-Review Checklist

**1. Spec coverage:**
- [x] Page title "出金一覧" — Task 9
- [x] Search by payment/order number, store — Task 3
- [x] Filter by status (完了/保留中/取消) — Task 3
- [x] Filter by payment method (現金/銀行振込/クレジットカード) — Task 3
- [x] Date range filter — Task 3
- [x] Stat cards (総出金額, 完了金額, 保留中金額, 出金件数) — Task 4
- [x] Data table with all columns — Task 6
- [x] Detail modal — Task 7
- [x] Loading state — Task 2
- [x] Success message — Task 9
- [x] Dark mode support — throughout
- [x] Japanese labels — throughout

**2. Placeholder scan:**
- [x] No "TBD", "TODO", "implement later"
- [x] No "similar to Task N" — all code is self-contained
- [x] All types, method signatures, property names consistent

**3. Type consistency:**
- [x] `PaymentRecord` interface used consistently across all tasks
- [x] `STATUS_COLORS` and `STATUS_LABELS` shared between table and modal
- [x] `PAYMENT_METHOD_COLORS` and `PAYMENT_METHOD_LABELS` used in table
- [x] Handler functions (`handleViewDetail`, `handleCloseModal`, `handleSuccess`) defined in Task 3, used in Tasks 6-9
- [x] `filteredPayments` computed in Task 3, used in Tasks 4, 6

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-01-delivery-payment.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
