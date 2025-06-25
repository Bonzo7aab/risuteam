import React from "react";

interface Column<T> {
  key: keyof T | string;
  header: React.ReactNode;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyText?: string;
}

export function Table<T extends { id?: string | number }>({
  columns,
  data,
  loading,
  emptyText,
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border text-xs md:text-sm bg-background">
        <thead className="bg-muted">
          <tr>
            {columns.map((col, i) => (
              <th
                key={i}
                className={"p-2 border font-semibold " + (col.className || "")}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="p-2 text-center">
                Ładowanie...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="p-2 text-center">
                {emptyText || "Brak danych."}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={row.id ?? idx} className="border-b">
                {columns.map((col, i) => (
                  <td key={i} className={"p-2 border " + (col.className || "")}>
                    {col.render
                      ? col.render(row)
                      : (row[col.key as keyof T] as any)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
