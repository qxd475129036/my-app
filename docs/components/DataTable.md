# DataTable Component Design

## Overview

`DataTable` (`src/app/components/DataTable.tsx`) is the primary table component used across all master data pages. It wraps `@tanstack/react-table` with custom rendering and Tailwind CSS 4 styling.

---

## Styling (Tailwind CSS 4)

### Container

| Property | Value | Notes |
|---|---|---|
| Outer wrapper | `data-table-wrapper` | See ultra-wide constraint below |
| Inner container | `overflow-x-auto border border-border rounded-lg shadow-sm` | Standard table wrapper |
| Border color | `var(--border)` → `#e2e8f0` | Defined in `globals.css` |

### Ultra-Wide Constraint (`>= 1920px`)

```css
@media (min-width: 1920px) {
  .data-table-wrapper {
    max-width: 1920px;
    margin-left: auto;
    margin-right: auto;
    overflow-x: auto;
  }
}
```

On screens `>= 1920px`, the table is capped at `1920px` width and scrolls horizontally within the wrapper.

---

### Header (`<thead>`)

| Element | Classes | Notes |
|---|---|---|
| `<thead>` | `bg-gray-50 shadow-[0_2px_0_0_#d1d5db]` | `shadow-*` replaces `border-b-2` for reliable sticky rendering during scroll |
| + sticky mode | `sticky top-0 z-10` | Applied when `scrollable` (pageSize > 10) |
| `<th>` (data columns) | `px-4 py-3.5 text-xs font-semibold uppercase tracking-wider` | — |
| `<th>` text (unsorted) | `text-gray-600` | — |
| `<th>` text (sorted) | `text-accent bg-accent-light/60` | Blue highlight for sorted column |
| `<th>` (sortable hover) | `cursor-pointer select-none hover:text-gray-700 hover:bg-gray-100/60 transition-colors` | — |
| `<th>` (row number, expand) | `text-gray-600` | Same text color as data column headers |

**Design intent:** Light gray header (`bg-gray-50`) stays neutral and doesn't compete with the sorted column's blue accent highlight. The shadow-based bottom line (`#d1d5db`) cleanly separates the header from the body rows and remains visible during vertical scrolling.

---

### Body (`<tbody>`)

| Element | Classes | Notes |
|---|---|---|
| `<tbody>` | _(no class)_ | Individual row borders handle separators |
| `<tr>` | `border-b border-gray-100 transition-colors` | Clean per-row separator |
| `<tr>` (even) | `even:bg-gray-100/60` | Subtle alternating row striping |
| `<tr>` (hover) | `hover:bg-blue-100/40` | Blue-tinted hover for row interaction feedback |
| `<tr>` (selected) | `bg-blue-50/70` | Different opacity from header `bg-blue-50` to stay distinct |
| `<td>` (data columns) | `px-4 py-3.5 text-sm text-foreground` | — |
| `<td>` (row number) | `px-4 py-3.5 text-right text-xs text-muted font-mono tabular-nums w-12` | Fixed-width, monospace |
| `<td>` (expand) | `px-4 py-3.5 w-10` | — |
| `<td>` (checkbox) | `px-4 py-3.5` | — |

**Row number offset** when `paginated`: `(currentPage - 1) * pageSize` — the index shown is the **global** row number, not just the page-local index.

---

### Empty state

| Element | Classes |
|---|---|
| `<td>` (empty message) | `px-4 py-12 text-center text-sm text-muted` |

---

## Pagination (`Pagination.tsx`)

| Element | Classes / Details |
|---|---|
| Container | `flex items-center justify-between border-t border-border px-4 py-3` |
| Record count | `text-xs text-muted` — format: `{startItem}-{endItem} / {totalItems}件` |
| Page size `<select>` | `rounded border border-border px-2 py-1 text-xs text-foreground bg-white focus:outline-none focus:ring-1 focus:ring-accent` |
| Options | `[10, 50]` + `すべて表示` |
| Page buttons | `min-w-[28px] rounded px-1.5 py-1 text-xs font-medium transition-colors` |
| — active | `bg-accent text-white` |
| — inactive | `text-muted hover:text-foreground hover:bg-gray-100` |
| — disabled | `disabled:opacity-40 disabled:cursor-not-allowed` |
| — prev/next | `rounded px-2 py-1 text-xs text-muted hover:text-foreground hover:bg-gray-100` |
| Ellipsis | `px-1 text-xs text-muted` |

**Page number logic:** Shows up to 5 visible page buttons with ellipsis (`...`) for large page counts.

---

## Scroll behavior

| Condition | Behavior | Implementation |
|---|---|---|
| `pageSize > 10` | Table body scrolls vertically inside a fixed-height container | `maxHeight: '480px', overflowY: 'auto'` on table wrapper, `sticky top-0 z-10` on `<thead>` |
| `screen >= 1920px` | Table constrained to 1920px width with horizontal scroll | CSS media query on `data-table-wrapper` |
| Normal (`pageSize <= 10`) | No scroll, full height | Default layout |

---

## Modes

### Standard mode (default)

Standard HTML `<table>` layout. Used when `virtualize` prop is not set.

### Virtualized mode

CSS `display: grid` based layout with `@tanstack/react-virtual`. Styling is kept visually identical to standard mode:
- Header row: `flex w-full bg-gray-50 shadow-[0_2px_0_0_#d1d5db]`
- Body rows: `flex absolute w-full border-b border-gray-100 transition-colors`
- Same even/hover/selected class pattern as standard mode

---

## Previous style changes (log)

| Date | Change |
|---|---|
| — | `border-b-2` on `<thead>` replaced with `shadow-[0_2px_0_0_#d1d5db]` — box-shadow doesn't clip during overflow scrolling on sticky elements |
| — | Header background set to `bg-gray-50` (neutral, avoids clash with sorted column's blue accent) |
| — | Row padding increased from `py-3` to `py-3.5` |
| — | Even row striping: `even:bg-gray-100/60` |
| — | Row hover: `hover:bg-blue-100/40` |
| — | Selected row: `bg-blue-50/70` |
| — | Page size > 10 triggers vertical scroll (`maxHeight: 480px`) with sticky header |
