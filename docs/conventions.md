# Conventions

## Layout & Styling

- **TopBar removed**: The global TopBar (breadcrumb + user info) has been removed. Page titles are rendered inline within each page's content area.
- **Page container spacing**: Data table pages use `px-8 py-4` (`w-full px-8 py-4`) for the root content div. Index/card pages may use `max-w-7xl mx-auto px-8 py-8`.
- **Mock data scale**: Master module pages generate **10,000 records** for realistic performance testing (e.g., store, request-cd, price pages).
- **Title format**: Page titles follow the pattern `{Module} / {Submodule}`, e.g., `Master管理 / 店铺管理`.
- **`"use client"`**: All data-display pages are client components for interactivity (modals, search, pagination).

## DataTable Usage

- **Do not pre-slice data**: Pass the full filtered dataset to DataTable's `data` prop. DataTable handles pagination internally via `@tanstack/react-table`'s `getPaginationRowModel()`. Pre-slicing (e.g., `.slice(start, end)`) causes double-pagination and breaks page navigation.
- Pass `totalItems={filteredData.length}`, `currentPage`, `pageSize`, `onPageChange`, `onPageSizeChange` for paginated tables.
- DataTable automatically detects pre-paginated data (when `data.length < totalItems`) and disables internal pagination as a fallback, but new pages should not rely on this — pass the full dataset.
