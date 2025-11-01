"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Document = {
  title: string;
  authors: string;
  publicationYear: number;
  topics: string;
};

const data: Document[] = [
  {
    title: "A Market-Oriented Programming Environment and its A...",
    authors: "M. P. Wellman",
    publicationYear: 2025,
    topics: "A, B, C",
  },
  {
    title: "An Empirical Analysis of Search in GSAT",
    authors: "I. P. Gent",
    publicationYear: 2025,
    topics: "A, B, C",
  },
  {
    title: "The Difficulties of Learning Logic Programs with Cut...",
    authors: "F. Bergadano",
    publicationYear: 2025,
    topics: "A, B, C",
  },
  {
    title: "Software Agents: Completing Patterns and Constructing...",
    authors: "J. C. Schlimmer",
    publicationYear: 2025,
    topics: "A, B, C",
  },
  {
    title: "Exploring the Decision Forest: An Empirical Investigatio...",
    authors: "C. X. Ling",
    publicationYear: 2025,
    topics: "A, B, C",
  },
  {
    title: "Bias-Driven Revision of Logical Domain Theories",
    authors: "H. Zuniga",
    publicationYear: 2025,
    topics: "A, B, C",
  },
];

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
    cell: ({ row }) => <div>{row.getValue("authors")}</div>,
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

const CorpusTable = () => {
  const [sorting, setSorting] = useState<SortingState>([]);

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
      </div>
    </article>
  );
};

export default CorpusTable;
