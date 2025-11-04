"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { callApi } from "@/lib/health";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";

type Document = {
  title: string;
  authors: string;
  publicationYear: number;
  topics: string;
};


const columns: ColumnDef<Document>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <div className="max-w-md truncate">{row.getValue("title")}</div>
    ),
  },
  {
    accessorKey: "authors",
    header: "Authors",
    cell: ({ row }) => <div className="max-w-md truncate">{row.getValue("authors")}</div>,
  },
  {
    accessorKey: "publicationYear",
    header: "Publication Year",
    cell: ({ row }) => <div>{row.getValue("publicationYear")}</div>,
  },
  {
    accessorKey: "topics",
    header: "Topics",
    cell: ({ row }) => <div className="min-w-64">{row.getValue("topics")}</div>,
  },
];

const CorpusDocuments = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [data, setData] = useState([] as Document[]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await callApi("/api/corpus-documents");
      if (cancelled) return;

      for (const row of result) {
        row["authors"] = row["authors"].join(", ");
      }

      result.sort((a: Document, b: Document) => b.publicationYear - a.publicationYear);
      setData(result.slice(0, 20));
    })();

    return () => {cancelled = true};
  }, []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <article className="bg-card p-4 rounded-lg">
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

export default CorpusDocuments;
