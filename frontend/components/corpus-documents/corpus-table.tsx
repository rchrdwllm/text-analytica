"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Document } from "@/lib/documents";
import { callApi } from "@/lib/utils";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useContext, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { CorpusSearchContext } from "@/context/corpus-search-context-wrapper";

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

const CorpusTable = ({ initialFullData = [], initialRenderedCount = 20 }) => {
  const { searchQuery } = useContext(CorpusSearchContext);
  const [renderedCount, setRenderedCount] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [data, setData] = useState([] as Document[]);
  const [fullData, setFullData] = useState([] as Document[]);
  const [filteredData, setFilteredData] = useState([] as Document[]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await callApi("/api/corpus-documents");
      if (cancelled || result.success == null) return;

      const data = result.success as Document[];
      for (const row of data) {
        /// sybau
        row["authors"] = (row["authors"] as unknown as string[]).join(", ");
      }

      data.sort(
        (a: Document, b: Document) => b.publicationYear - a.publicationYear
      );
      setRenderedCount(20);
      setFullData(data);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Filter data based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredData(fullData);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = fullData.filter((doc) => {
      return (
        doc.title?.toLowerCase().includes(query) ||
        doc.authors?.toLowerCase().includes(query) ||
        doc.topics?.toLowerCase().includes(query) ||
        doc.publicationYear?.toString().includes(query)
      );
    });

    setFilteredData(filtered);
    setRenderedCount(20); // Reset to first 20 rows when filtering
  }, [searchQuery, fullData]);

  useEffect(() => {
    setData(filteredData.slice(0, renderedCount));
  }, [renderedCount, filteredData]);

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
      <div className="space-y-4 rounded-md">
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
        {renderedCount < filteredData.length && (
          <Button
            type="submit"
            className="ml-auto"
            onClick={(e) => {
              e.preventDefault();
              setRenderedCount((v) => Math.min(v + 20, filteredData.length));
            }}
          >
            Load more rows (+{Math.min(20, filteredData.length - renderedCount)}
            )
          </Button>
        )}
      </div>
    </article>
  );
};

export default CorpusTable;
