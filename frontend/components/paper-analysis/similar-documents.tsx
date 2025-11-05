"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SimilarDocument } from "@/types";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";

type DocumentData = {
  document: string;
  author: string;
};

type Props = {
  data?: SimilarDocument[] | null;
};

const SimilarDocuments = ({ data }: Props) => {
  const rows: DocumentData[] = useMemo(
    () =>
      (data || []).map((d) => ({
        document: d.title,
        author: (d.authors || []).join(", "),
      })),
    [data]
  );

  const columns: ColumnDef<DocumentData>[] = useMemo(
    () => [
      {
        accessorKey: "document",
        header: "Document",
        cell: ({ row }) => (
          <div className="min-w-[300px] break-words whitespace-normal">
            {row.getValue("document")}
          </div>
        ),
      },
      {
        accessorKey: "author",
        header: "Author",
        cell: ({ row }) => (
          <div className="min-w-[200px] break-words whitespace-normal">
            {row.getValue("author")}
          </div>
        ),
      },
    ],
    []
  );

  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <article className="space-y-4 bg-card p-4 rounded-lg">
      <h2 className="font-medium text-lg">Similar Documents</h2>
      <div className="rounded-md">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </article>
  );
};

export default SimilarDocuments;
