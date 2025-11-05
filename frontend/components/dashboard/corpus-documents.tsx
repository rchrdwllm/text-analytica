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
import { useState } from "react";

type Document = {
  title: string;
  authors: string;
  publicationYear: number;
  topics: string;
};

type Props = {
  initialData: Document[];
};

const columns: ColumnDef<Document>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <div className="min-w-[300px] break-words whitespace-normal">
        {row.getValue("title")}
      </div>
    ),
  },
  {
    accessorKey: "authors",
    header: "Authors",
    cell: ({ row }) => (
      <div className="min-w-[250px] break-words whitespace-normal">
        {row.getValue("authors")}
      </div>
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
    cell: ({ row }) => (
      <div className="min-w-[200px] break-words whitespace-normal">
        {row.getValue("topics")}
      </div>
    ),
  },
];

const CorpusDocuments = ({ initialData }: Props) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  // initialize with server-provided data
  const [data, setData] = useState<Document[]>(initialData || []);

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
