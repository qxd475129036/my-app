# Delivery Payment Layout Redesign

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `src/app/delivery/payment/page.tsx` to match the layout pattern of `src/app/master/store/page.tsx`.

**Architecture:** Single file modification. Replace the current layout (wide centered main, large stat cards, grid filter bar) with master/store's compact layout (w-[80vw] container, inline search form, compact buttons, sticky table header).

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS 4, TypeScript.

---

## File Structure

- **Modify:** `src/app/delivery/payment/page.tsx` — replace layout section only (interface, constants, mock data, state, handlers stay the same)

## Design Decisions

- **Keep** all existing data model, constants, mock data, state variables, and handlers
- **Keep** all existing Japanese labels (出金番号, 状態, 支払方法, etc.)
- **Keep** the detail modal
- **Remove** the stat cards (master/store has no stat cards)
- **Keep** the filter bar but restructure to match master/store's inline form style
- **Keep** the table but update to match master/store's compact style with sticky header
- **Add** user info and sign-out link in header (matching master/store)
- **Add** Reset, Search, Create buttons in filter bar (matching master/store)
- **Use** `w-[80vw] px-3 py-6 lg:px-4` for main container (matching master/store)
- **Use** `bg-white dark:bg-zinc-800` for cards (matching master/store, not `dark:bg-zinc-900`)
- **Use** `rounded shadow-sm` (matching master/store, not `rounded-lg shadow`)
- **Use** `text-xs` for labels, `text-sm` for inputs (matching master/store)

---

### Task 1: Update Main Container and Header

**Files:**
- Modify: `src/app/delivery/payment/page.tsx`

- [ ] **Step 1: Replace the main container wrapper**

Change the main element from:
```tsx
<main className="flex-1 mx-auto max-w-7xl px-6 py-12 lg:px-8">
```
to:
```tsx
<main className="flex-1 mx-auto w-[80vw] px-3 py-6 lg:px-4">
```

- [ ] **Step 2: Replace the header section**

Replace the current header (lines 209-216):
```tsx
<div className="mb-8">
  <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
    出金一覧
  </h1>
  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
    出金履歴の管理画面
  </p>
</div>
```

with:
```tsx
<div className="mb-3 flex justify-between items-center">
  <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
    出金一覧
  </h1>
  <div className="flex items-center gap-3">
    <span className="text-xs text-zinc-600 dark:text-zinc-400">
      欢迎，{session?.user?.name || "用户"}
    </span>
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
    >
      退出登录
    </button>
  </div>
</div>
```

- [ ] **Step 3: Add signOut import**

Change the import from:
```tsx
import { useSession } from "next-auth/react";
```
to:
```tsx
import { signOut, useSession } from "next-auth/react";
```

- [ ] **Step 4: Verify** — Header renders with title on left, user info + sign-out on right

---

### Task 2: Replace Filter Bar with Inline Form

**Files:**
- Modify: `src/app/delivery/payment/page.tsx`

- [ ] **Step 1: Replace the filter bar**

Replace the current filter bar (lines 244-312) with an inline form matching master/store's style:

```tsx
{/* Filters */}
<div className="bg-white dark:bg-zinc-800 rounded shadow-sm p-3 mb-3">
  <form onSubmit={(e) => e.preventDefault()} className="flex flex-wrap items-end gap-2">
    <div className="flex-1 min-w-[140px]">
      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-0.5">
        出金番号
      </label>
      <input
        type="text"
        className="w-full px-2 py-1 text-sm border border-zinc-300 dark:border-zinc-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="出金番号, 注文番号, 店舗"
      />
    </div>
    <div className="w-32">
      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-0.5">
        状態
      </label>
      <select
        className="w-full px-2 py-1 text-sm border border-zinc-300 dark:border-zinc-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option value="all">すべて</option>
        <option value="completed">完了</option>
        <option value="pending">保留中</option>
        <option value="cancelled">取消</option>
      </select>
    </div>
    <div className="w-32">
      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-0.5">
        支払方法
      </label>
      <select
        className="w-full px-2 py-1 text-sm border border-zinc-300 dark:border-zinc-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
        value={methodFilter}
        onChange={(e) => setMethodFilter(e.target.value)}
      >
        <option value="all">すべて</option>
        <option value="cash">現金</option>
        <option value="bank">銀行振込</option>
        <option value="credit">クレジットカード</option>
      </select>
    </div>
    <div className="w-32">
      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-0.5">
        From Date
      </label>
      <input
        type="date"
        className="w-full px-2 py-1 text-sm border border-zinc-300 dark:border-zinc-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
        value={dateFrom}
        onChange={(e) => setDateFrom(e.target.value)}
      />
    </div>
    <div className="w-32">
      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-0.5">
        To Date
      </label>
      <input
        type="date"
        className="w-full px-2 py-1 text-sm border border-zinc-300 dark:border-zinc-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
        value={dateTo}
        onChange={(e) => setDateTo(e.target.value)}
      />
    </div>
    <div className="flex gap-1.5">
      <button
        type="button"
        className="px-3 py-1 text-xs border border-zinc-300 dark:border-zinc-600 rounded text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700"
        onClick={() => {
          setSearchTerm("");
          setStatusFilter("all");
          setMethodFilter("all");
          setDateFrom("");
          setDateTo("");
        }}
      >
        重置
      </button>
      <button
        type="button"
        className="px-3 py-1 text-xs border border-transparent rounded text-white bg-blue-600 hover:bg-blue-700"
      >
        搜索
      </button>
      <button
        type="button"
        className="px-3 py-1 text-xs border border-transparent rounded text-white bg-green-600 hover:bg-green-700"
      >
        创建
      </button>
    </div>
  </form>
</div>
```

- [ ] **Step 2: Remove the old stats section**

Remove the entire stats section (lines 314-348):
```tsx
<div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-4">
  ...
</div>
```

- [ ] **Step 3: Verify** — Filter bar renders as inline form with compact inputs and buttons

---

### Task 3: Update Table to Match master/store Style

**Files:**
- Modify: `src/app/delivery/payment/page.tsx`

- [ ] **Step 1: Update the table container**

Change the table wrapper from:
```tsx
<div className="bg-white dark:bg-zinc-900 shadow sm:rounded-lg overflow-hidden">
```
to:
```tsx
<div className="bg-white dark:bg-zinc-800 rounded shadow-sm overflow-hidden">
```

- [ ] **Step 2: Update the table header**

Change the thead from:
```tsx
<thead className="bg-zinc-50 dark:bg-zinc-800">
```
to:
```tsx
<thead className="bg-zinc-50 dark:bg-zinc-900 sticky top-20 z-0">
```

- [ ] **Step 3: Update table header cells**

Change all `<th>` cells from the current style to match master/store:
```tsx
<th className="px-3 py-2 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">
```
(Replace `px-6 py-3` with `px-3 py-2`, remove `tracking-wider`)

- [ ] **Step 4: Update table body cells**

Change all `<td>` cells from `px-6 py-4` to `px-3 py-2` for consistency.

- [ ] **Step 5: Verify** — Table has sticky header, compact cells, matching master/store style

---

### Task 4: Update Detail Modal to Match Style

**Files:**
- Modify: `src/app/delivery/payment/page.tsx`

- [ ] **Step 1: Update modal container**

Change the modal overlay from:
```tsx
<div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
```
to:
```tsx
<div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
```
(Keep as-is, it's already correct)

- [ ] **Step 2: Update modal content background**

Change from `bg-white dark:bg-zinc-800` to `bg-white dark:bg-zinc-800` (already correct).

- [ ] **Step 3: Update modal field labels**

Ensure all field labels in the modal use `text-xs` for labels and `text-sm` for values, matching master/store's FormField style.

- [ ] **Step 4: Verify** — Modal looks consistent with the new compact style

---

### Task 5: Update Success Message Style

**Files:**
- Modify: `src/app/delivery/payment/page.tsx`

- [ ] **Step 1: Update success message**

Change the success message from:
```tsx
<div className="mb-4 rounded-md bg-green-50 dark:bg-green-900/20 p-4">
```
to:
```tsx
<div className="mb-3 rounded bg-green-50 dark:bg-green-900/20 p-2">
```

- [ ] **Step 2: Verify** — Success message is more compact

---

### Task 6: Verify and Commit

**Files:**
- Verify: `src/app/delivery/payment/page.tsx`

- [ ] **Step 1: Run TypeScript check**

```bash
npx tsc --noEmit src/app/delivery/payment/page.tsx 2>&1 | head -20
```

- [ ] **Step 2: Verify layout matches master/store**

Check that:
- Main container uses `w-[80vw] px-3 py-6 lg:px-4`
- Header has user info and sign-out link
- Filter bar is inline form with compact inputs
- Table has sticky header
- All cards use `bg-white dark:bg-zinc-800`
- All cards use `rounded shadow-sm`
- Labels use `text-xs`
- Inputs use `text-sm`

- [ ] **Step 3: Commit**

```bash
git add src/app/delivery/payment/page.tsx
git commit -m "feat: redesign payment page layout to match master/store"
```

---

## Self-Review Checklist

**1. Spec coverage:**
- [x] Main container: `w-[80vw] px-3 py-6 lg:px-4` — Task 1
- [x] Header: title + user info + sign-out — Task 1
- [x] Filter bar: inline form, compact inputs, Reset/Search/Create buttons — Task 2
- [x] Stats: removed (matching master/store) — Task 2
- [x] Table: sticky header, compact cells, `bg-white dark:bg-zinc-800` — Task 3
- [x] Modal: consistent style — Task 4
- [x] Success message: compact — Task 5
- [x] signOut import added — Task 1
- [x] All Japanese labels preserved — throughout

**2. Placeholder scan:**
- [x] No "TBD", "TODO", "implement later"
- [x] All code shown explicitly
- [x] No "Similar to Task N"

**3. Type consistency:**
- [x] All existing state variables preserved
- [x] All existing handlers preserved
- [x] All existing constants preserved
- [x] signOut added to import

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-01-delivery-payment-layout.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
