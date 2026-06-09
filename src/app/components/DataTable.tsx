"use client";

import { Fragment, useMemo, useState, useCallback, useRef } from "react";
import { Pagination } from "./Pagination";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type Updater,
  PaginationState,
  type Row,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { useVirtualizer, type VirtualItem, type Virtualizer } from "@tanstack/react-virtual";

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  width?: string;
  align?: "left" | "center" | "right";
  wrapHeader?: boolean;
  wrapText?: boolean;
}

export interface VirtualizeOptions {
  /** Estimated row height in px for scrollbar. Default 33. */
  estimateSize?: number;
  /** Number of extra rows rendered outside the visible area. Default 5. */
  overscan?: number;
  /** Fixed height of the scroll container. Default "600px". */
  containerHeight?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  onSort?: (key: string, direction: "asc" | "desc") => void;
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  emptyMessage?: string;
  loading?: boolean;
  pageSize?: number;
  currentPage?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pagination?: boolean;
  expandedContent?: (row: T) => React.ReactNode;
  rowNumber?: boolean;
  rowNumberOffset?: number;
  wrapHeaders?: boolean;
  /** Enable virtualized row rendering for large datasets. */
  virtualize?: boolean;
  /** Options for virtualized mode. */
  virtualizeOptions?: VirtualizeOptions;
}

const SORT_NONE_ICON = (
  <svg className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 10l3 3 3-3M5 6l3-3 3 3" />
  </svg>
);

function parseWidth(px: string | undefined): number | undefined {
  if (!px) return undefined;
  const m = px.match(/^(\d+(?:\.\d+)?)px$/);
  return m ? parseFloat(m[1]) : undefined;
}

export function DataTable<T>({
  columns: colDefs,
  data,
  keyExtractor,
  selectable = false,
  selectedIds,
  onSelectionChange,
  onSort,
  sortKey,
  sortDirection,
  emptyMessage = "データがありません",
  loading = false,
  pageSize,
  currentPage,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pagination = true,
  expandedContent,
  rowNumber = true,
  rowNumberOffset,
  wrapHeaders = false,
  virtualize = false,
  virtualizeOptions,
}: DataTableProps<T>) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const vOpts: Required<VirtualizeOptions> = {
    estimateSize: virtualizeOptions?.estimateSize ?? 33,
    overscan: virtualizeOptions?.overscan ?? 5,
    containerHeight: virtualizeOptions?.containerHeight ?? "600px",
  };

  // ── Map Column<T> to ColumnDef<T> ──────────────────────────────
  const reactColumns = useMemo<ColumnDef<T>[]>(() => {
    return colDefs.map((col) => {
      const parsed = parseWidth(col.width);
      const def: ColumnDef<T> = {
        id: col.key,
        accessorFn: (row: T) => (row as Record<string, unknown>)[col.key],
        header: col.label,
        enableSorting: col.sortable ?? false,
        size: parsed ?? undefined,
        cell: (info) => {
          if (col.render) return col.render(info.row.original);
          const val = info.getValue();
          return (val != null ? String(val) : "-") as React.ReactNode;
        },
      };
      return def;
    });
  }, [colDefs]);

  // ── Sorting (controlled / uncontrolled) ────────────────────────
  const isControlled = !!onSort;
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);

  const sorting: SortingState = isControlled
    ? sortKey
      ? [{ id: sortKey, desc: sortDirection === "desc" }]
      : []
    : internalSorting;

  const onSortingChange = useCallback(
    (updaterOrValue: Updater<SortingState>) => {
      setExpandedIds(new Set());
      const newValue =
        typeof updaterOrValue === "function"
          ? updaterOrValue(sorting)
          : updaterOrValue;
      if (isControlled) {
        if (newValue[0]) {
          onSort!(newValue[0].id, newValue[0].desc ? "desc" : "asc");
        } else {
          onSort!("", "asc");
        }
      } else {
        setInternalSorting(newValue);
      }
    },
    [isControlled, onSort, sorting]
  );

  // ── Pagination (controlled / internal) ────────────────────────
  const paginated =
    pagination !== false &&
    pageSize != null &&
    currentPage != null &&
    totalItems != null;

  const scrollable = paginated && pageSize != null && pageSize > 10;

  const [internalPagination, setInternalPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const paginationState: PaginationState = paginated
    ? { pageIndex: (currentPage! - 1), pageSize: pageSize! }
    : internalPagination;

  const onPaginationChange = useCallback(
    (updaterOrValue: Updater<PaginationState>) => {
      const newValue =
        typeof updaterOrValue === 'function'
          ? updaterOrValue(paginationState)
          : updaterOrValue;
      if (paginated) {
        onPageChange!(newValue.pageIndex + 1);
        if (newValue.pageSize !== pageSize) {
          onPageSizeChange?.(newValue.pageSize);
        }
      } else {
        setInternalPagination(newValue);
      }
    },
    [paginated, paginationState, pageSize, onPageChange, onPageSizeChange]
  );

  // ── Row selection ──────────────────────────────────────────────
  const rowSelection = useMemo(() => {
    if (!selectedIds) return {};
    const sel: Record<string, boolean> = {};
    selectedIds.forEach((id) => {
      sel[id] = true;
    });
    return sel;
  }, [selectedIds]);

  const onRowSelectionChange = useCallback(
    (updaterOrValue: Updater<Record<string, boolean>>) => {
      if (!onSelectionChange) return;
      const newValue =
        typeof updaterOrValue === "function"
          ? updaterOrValue(rowSelection)
          : updaterOrValue;
      const ids = new Set(
        Object.keys(newValue).filter((k) => newValue[k])
      );
      onSelectionChange(ids);
    },
    [onSelectionChange, rowSelection]
  );

  // ── Column styles (align, wrapText) ────────────────────────────
  const colStyleMap = useMemo(() => {
    const map = new Map<string, React.CSSProperties>();
    for (const col of colDefs) {
      const style: React.CSSProperties = {};
      if (col.align) style.textAlign = col.align;
      if (col.wrapText) {
        style.whiteSpace = "normal";
        style.overflowWrap = "break-word";
        style.wordBreak = "break-word";
      } else {
        style.whiteSpace = "nowrap";
      }
      map.set(col.key, style);
    }
    return map;
  }, [colDefs]);

  // ── React Table ────────────────────────────────────────────────
  const enableRowSelection = selectable || undefined;

  const table = useReactTable({
    data,
    columns: reactColumns,
    state: {
      sorting,
      rowSelection,
      pagination: paginationState,
    },
    onSortingChange,
    onRowSelectionChange,
    onPaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection,
  });

  const tableRows = table.getRowModel().rows;

  // ── Virtualizer ────────────────────────────────────────────────
  const rowVirtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
    count: virtualize ? tableRows.length : 0,
    estimateSize: () => vOpts.estimateSize,
    getScrollElement: () => tableContainerRef.current,
    measureElement:
      typeof window !== "undefined" &&
      navigator.userAgent.indexOf("Firefox") === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
    overscan: vOpts.overscan,
    enabled: virtualize,
  });

  // ── Helpers ────────────────────────────────────────────────────
  const hasRowNumber = rowNumber !== false;
  const hasExpand = !!expandedContent;
  const extraColCount =
    (hasRowNumber ? 1 : 0) + (hasExpand ? 1 : 0) + (selectable ? 1 : 0);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getRowNumber = (index: number) => {
    const offset = rowNumberOffset ?? (paginated ? ((currentPage! - 1) * pageSize!) : 0);
    return offset + index + 1;
  };

  // ── Cell rendering (shared) ────────────────────────────────────
  const renderCells = (row: Row<T>, index: number) => {
    const id = keyExtractor(row.original);
    const isSelected = row.getIsSelected();

    return (
      <>
        {hasRowNumber && (
          <td className="px-4 py-3.5 text-right text-xs text-muted font-mono tabular-nums w-12">
            {getRowNumber(index)}
          </td>
        )}
        {hasExpand && (
          <td className="px-4 py-3.5 w-10">
            <button
              onClick={() => toggleExpand(id)}
              className="p-0.5 rounded hover:bg-gray-200 transition-colors cursor-pointer"
              aria-label={expandedIds.has(id) ? "折りたたむ" : "展開する"}
            >
              <svg
                className={`h-4 w-4 text-muted transition-transform ${
                  expandedIds.has(id) ? "rotate-180" : ""
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </td>
        )}
        {selectable && (
          <td className="px-4 py-3.5">
            <input
              type="checkbox"
              checked={!!isSelected}
              onChange={row.getToggleSelectedHandler()}
              className="h-4 w-4 rounded border-border text-accent focus:ring-accent/20 cursor-pointer"
            />
          </td>
        )}
        {row.getVisibleCells().map((cell) => (
          <td
            key={cell.id}
            style={colStyleMap.get(cell.column.id)}
            className="px-4 py-3.5 text-sm text-foreground"
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        ))}
      </>
    );
  };

  // ── Wrap header map ────────────────────────────────────────────
  const wrapHeaderMap = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const col of colDefs) {
      map.set(col.key, wrapHeaders || col.wrapHeader || false);
    }
    return map;
  }, [colDefs, wrapHeaders]);

  // ── Row count display ──────────────────────────────────────────
  // We place row count + loading indicator in a top bar.
  // The existing structure already handles this via pagination footer.

  // ── Empty state ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        <span className="ml-2 text-sm text-muted">Loading...</span>
      </div>
    );
  }

  const totalColumns = colDefs.length + extraColCount;

  // ════════════════════════════════════════════════════════════════
  // VIRTUALIZED MODE
  // ════════════════════════════════════════════════════════════════
  if (virtualize) {
    const virtualRows = rowVirtualizer.getVirtualItems();
    const totalSize = rowVirtualizer.getTotalSize();

    return (
      <div className="data-table-wrapper w-full overflow-x-auto">
        <div
          ref={tableContainerRef}
          className="overflow-auto border border-border rounded-lg shadow-sm"
          style={{ position: "relative", height: vOpts.containerHeight }}
        >
          <table style={{ display: "grid" }}>
            <thead
              style={{
                display: "grid",
                position: "sticky",
                top: 0,
                zIndex: 1,
              }}
            >
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="flex w-full bg-gray-50 shadow-[0_2px_0_0_#d1d5db]"
                >
                  {hasRowNumber && (
                    <th
                      className="flex items-center px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-600"
                      style={{ width: 48, flexShrink: 0 }}
                    >
                      #
                    </th>
                  )}
                  {hasExpand && (
                    <th
                      className="flex items-center px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-600"
                      style={{ width: 40, flexShrink: 0 }}
                    />
                  )}
                  {selectable && (
                    <th
                      className="flex items-center px-4 py-3.5"
                      style={{ width: 40, flexShrink: 0 }}
                    >
                      <input
                        type="checkbox"
                        checked={table.getIsAllRowsSelected()}
                        onChange={table.getToggleAllRowsSelectedHandler()}
                        className="h-4 w-4 rounded border-border text-accent focus:ring-accent/20 cursor-pointer"
                      />
                    </th>
                  )}
                  {headerGroup.headers.map((header) => {
                    const colDef = colDefs.find((c) => c.key === header.id);
                    const align = colDef?.align || "left";
                    const sorted = header.column.getIsSorted();
                    const canSort = header.column.getCanSort();
                    const wrapH = wrapHeaderMap.get(header.id) ?? false;
                    const sz = header.getSize();

                    return (
                      <th
                        key={header.id}
                        className="flex items-center px-4 py-3.5 text-xs font-semibold uppercase tracking-wider transition-colors"
                        style={{
                          width: sz,
                          flexShrink: 0,
                          textAlign: align,
                          whiteSpace: wrapH ? "normal" : "nowrap",
                          ...(wrapH ? { wordBreak: "break-word" as const } : {}),
                          ...(sorted
                            ? { color: "var(--accent)", backgroundColor: "var(--accent-light)" }
                            : { color: "var(--gray-500)" }),
                        }}
                        onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      >
                        <span
                          className={`inline-flex items-center gap-1.5 ${
                            sorted ? "font-bold" : ""
                          }`}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {canSort && (
                            <span className="inline-flex items-center ml-0.5">
                              {sorted === "asc" ? (
                                <svg className="h-4 w-4 text-accent" viewBox="0 0 16 16" fill="currentColor">
                                  <path d="M8 2l6 10H2z" />
                                </svg>
                              ) : sorted === "desc" ? (
                                <svg className="h-4 w-4 text-accent" viewBox="0 0 16 16" fill="currentColor">
                                  <path d="M8 14L2 4h12z" />
                                </svg>
                              ) : (
                                SORT_NONE_ICON
                              )}
                            </span>
                          )}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody
              style={{
                display: "grid",
                height: `${totalSize}px`,
                position: "relative",
              }}
            >
              {virtualRows.map((virtualRow: VirtualItem) => {
                const row = tableRows[virtualRow.index] as Row<T>;
                const id = keyExtractor(row.original);
                const isSelected = row.getIsSelected();

                return (
                  <tr
                    data-index={virtualRow.index}
                    ref={(node) => rowVirtualizer.measureElement(node)}
                    key={id}
                    className={`flex absolute w-full border-b border-gray-100 transition-colors ${
                      isSelected ? "bg-blue-50/70" : "even:bg-gray-100/60 hover:bg-blue-100/40"
                    }`}
                    style={{
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <>
                      {hasRowNumber && (
                        <td
                          className="px-4 py-3.5 text-right text-xs text-muted font-mono tabular-nums"
                          style={{ width: 48, flexShrink: 0 }}
                        >
                          {getRowNumber(virtualRow.index)}
                        </td>
                      )}
                      {hasExpand && (
                        <td
                          className="px-4 py-3.5"
                          style={{ width: 40, flexShrink: 0 }}
                        >
                          <button
                            onClick={() => toggleExpand(id)}
                            className="p-0.5 rounded hover:bg-gray-200 transition-colors cursor-pointer"
                            aria-label={expandedIds.has(id) ? '折りたたむ' : '展開する'}
                          >
                            <svg
                              className={`h-4 w-4 text-muted transition-transform ${
                                expandedIds.has(id) ? "rotate-180" : ""
                              }`}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </td>
                      )}
                      {selectable && (
                        <td
                          className="px-4 py-3.5"
                          style={{ width: 40, flexShrink: 0 }}
                        >
                          <input
                            type="checkbox"
                            checked={!!isSelected}
                            onChange={row.getToggleSelectedHandler()}
                            className="h-4 w-4 rounded border-border text-accent focus:ring-accent/20 cursor-pointer"
                          />
                        </td>
                      )}
                      {row.getVisibleCells().map((cell) => {
                        const cellStyle = {
                          ...(colStyleMap.get(cell.column.id) || {}),
                          width: cell.column.getSize(),
                          flexShrink: 0,
                        } as React.CSSProperties;
                        return (
                          <td
                            key={cell.id}
                            style={cellStyle}
                            className="px-4 py-3.5 text-sm text-foreground"
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        );
                      })}
                    </>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {paginated && (
          <Pagination
            currentPage={currentPage!}
            totalItems={totalItems!}
            pageSize={pageSize!}
            onPageChange={onPageChange!}
            onPageSizeChange={onPageSizeChange}
          />
        )}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // STANDARD MODE
  // Inner div: overflowX for horizontal scroll, overflowY for vertical
  // scroll (pageSize > 10). Height uses calc(100vh - 250px) to fill
  // available space dynamically instead of a fixed 480px cap.
  // Pagination sits outside the scroll container so it stays fixed.
  // ════════════════════════════════════════════════════════════════
  return (
    <div className="data-table-wrapper">
      <div
        className="w-full border border-border rounded-lg shadow-sm"
        style={{
          overflowX: "auto",
          ...(scrollable ? { maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' } : {}),
        }}
      >
        <table style={{ minWidth: "max-content", width: "100%" }}>
          <thead
            className={`${scrollable ? 'sticky top-0 z-10' : ''} bg-gray-50 shadow-[0_2px_0_0_#d1d5db]`}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {hasRowNumber && (
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-600 w-12 text-right">
                    #
                  </th>
                )}
                {hasExpand && (
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-600 w-10" />
                )}
                {selectable && (
                  <th className="px-4 py-3.5 w-10">
                    <input
                      type="checkbox"
                      checked={table.getIsAllRowsSelected()}
                      onChange={table.getToggleAllRowsSelectedHandler()}
                      className="h-4 w-4 rounded border-border text-accent focus:ring-accent/20 cursor-pointer"
                    />
                  </th>
                )}
                {headerGroup.headers.map((header) => {
                  const colDef = colDefs.find((c) => c.key === header.id);
                  const align = colDef?.align || "left";
                  const sorted = header.column.getIsSorted();
                  const canSort = header.column.getCanSort();
                  const wrapH = wrapHeaderMap.get(header.id) ?? false;

                  return (
                    <th
                      key={header.id}
                      style={{
                        textAlign: align,
                        whiteSpace: wrapH ? "normal" : "nowrap",
                        ...(wrapH ? { wordBreak: "break-word" as const } : {}),
                      }}
                      className={`px-4 py-3.5 text-xs font-semibold uppercase tracking-wider ${
                        sorted
                          ? "text-accent bg-accent-light/60"
                          : "text-gray-600"
                      } ${
                        canSort
                          ? "cursor-pointer select-none hover:text-gray-700 hover:bg-gray-100/60"
                          : ""
                      } transition-colors`}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <span
                        className={`inline-flex items-center gap-1.5 ${
                          sorted ? "font-bold" : ""
                        }`}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {canSort && (
                          <span className="inline-flex items-center ml-0.5">
                            {sorted === "asc" ? (
                              <svg className="h-4 w-4 text-accent" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M8 2l6 10H2z" />
                              </svg>
                            ) : sorted === "desc" ? (
                              <svg className="h-4 w-4 text-accent" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M8 14L2 4h12z" />
                              </svg>
                            ) : (
                              SORT_NONE_ICON
                            )}
                          </span>
                        )}
                      </span>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {tableRows.length === 0 ? (
              <tr>
                <td
                  colSpan={totalColumns}
                  className="px-4 py-12 text-center text-sm text-muted"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              tableRows.map((row, index) => {
                const id = keyExtractor(row.original);
                const isSelected = row.getIsSelected();
                const isExpanded = expandedIds.has(id);
                return (
                  <Fragment key={id}>
                    <tr
                      className={`border-b border-gray-100 transition-colors ${
                        isSelected
                          ? "bg-blue-50"
                          : "even:bg-gray-100/60 hover:bg-blue-100/40"
                      }`}
                    >
                      {hasRowNumber && (
                        <td className="px-4 py-3.5 text-right text-xs text-muted font-mono tabular-nums w-12">
                          {getRowNumber(index)}
                        </td>
                      )}
                      {hasExpand && (
                        <td className="px-4 py-3.5 w-10">
                          <button
                            onClick={() => toggleExpand(id)}
                            className="p-0.5 rounded hover:bg-gray-200 transition-colors cursor-pointer"
                            aria-label={isExpanded ? "折りたたむ" : "展開する"}
                          >
                            <svg
                              className={`h-4 w-4 text-muted transition-transform ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </td>
                      )}
                      {selectable && (
                        <td className="px-4 py-3.5">
                          <input
                            type="checkbox"
                            checked={!!isSelected}
                            onChange={row.getToggleSelectedHandler()}
                            className="h-4 w-4 rounded border-border text-accent focus:ring-accent/20 cursor-pointer"
                          />
                        </td>
                      )}
                      {row.getVisibleCells().map((cell) => {
                        return (
                          <td
                            key={cell.id}
                            style={colStyleMap.get(cell.column.id)}
                            className="px-4 py-3.5 text-sm text-foreground"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        );
                      })}
                    </tr>
                    {isExpanded && expandedContent && (
                      <tr className="border-t-0">
                        <td
                          colSpan={totalColumns}
                          className="px-4 py-4 bg-gray-50/80 border-b border-gray-100"
                        >
                          {expandedContent(row.original)}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {paginated && (
        <Pagination
          currentPage={currentPage!}
          totalItems={totalItems!}
          pageSize={pageSize!}
          onPageChange={onPageChange!}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}
