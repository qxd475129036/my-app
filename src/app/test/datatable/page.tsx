"use client";

import { useState, useCallback } from "react";
import { DataTable, Column } from "@/app/components/DataTable";
import { makeData, Person } from "./makeData";

const columns: Column<Person>[] = [
  { key: "id", label: "ID", width: "60px", sortable: true },
  { key: "firstName", label: "First Name", sortable: true },
  { key: "lastName", label: "Last Name", sortable: true },
  { key: "age", label: "Age", width: "50px", sortable: true },
  { key: "visits", label: "Visits", width: "50px", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "progress", label: "Profile Progress", width: "80px", sortable: true },
  {
    key: "createdAt",
    label: "Created At",
    width: "250px",
    sortable: true,
    render: (row) => row.createdAt.toLocaleString(),
  },
];

export default function DataTableTestPage() {
  const [data, setData] = useState(() => makeData(50_000));

  const refreshData = useCallback(() => {
    setData(makeData(50_000));
  }, []);

  return (
    <div className="w-full px-8 py-4">
      <h1 className="mb-4 text-lg font-semibold text-foreground">
        Test / DataTable (Virtual + 50k rows)
      </h1>

      <div className="mb-3 flex items-center gap-4">
        <span className="text-sm text-muted">({data.length} rows)</span>
        <button
          onClick={refreshData}
          className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
        >
          Refresh Data
        </button>
      </div>

      <DataTable<Person>
        columns={columns}
        data={data}
        keyExtractor={(row) => String(row.id)}
        rowNumber
        virtualize
        virtualizeOptions={{ containerHeight: "800px" }}
      />
    </div>
  );
}
