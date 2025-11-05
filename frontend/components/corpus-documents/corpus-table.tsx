"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Document } from "@/lib/documents";

type CorpusTableProps = {
  initialFullData?: Document[];
  initialRenderedCount?: number;
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
    cell: ({ row }) => (
      <div className="max-w-md truncate">{row.getValue("authors")}</div>
    ),
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

const CorpusTable = ({
  initialFullData = [],
  initialRenderedCount = 20,
}: CorpusTableProps) => {
  const [renderedCount, setRenderedCount] = useState(initialRenderedCount);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [data, setData] = useState([] as Document[]);
  const [fullData, setFullData] = useState(initialFullData as Document[]);

  // keep local paging reactive to changes to fullData or renderedCount
  useEffect(() => {
    setData(fullData.slice(0, renderedCount));
  }, [renderedCount, fullData]);

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
    <article className="flex-1 bg-card p-4 rounded-lg">
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
        <Button
          type="submit"
          className="ml-auto"
          onClick={(e) => {
            e.preventDefault();
            setRenderedCount((v) => v + 20);
          }}
        >
          Load more rows (+20 )
        </Button>
      </div>
    </article>
  );
};

export default CorpusTable;
