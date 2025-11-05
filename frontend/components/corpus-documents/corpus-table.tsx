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

const CorpusTable = ({
  initialFullData = [],
  initialRenderedCount = 20,
}: CorpusTableProps) => {
  const { searchQuery } = useContext(CorpusSearchContext);
  const [renderedCount, setRenderedCount] = useState(initialRenderedCount);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [data, setData] = useState([] as Document[]);
  const [filteredData, setFilteredData] = useState([] as Document[]);

  // Filter data based on search query
  useEffect(() => {
    console.log({ initialFullData });

    if (!searchQuery.trim()) {
      setFilteredData(initialFullData);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = initialFullData.filter((doc) => {
      return (
        doc.title?.toLowerCase().includes(query) ||
        doc.authors?.toLowerCase().includes(query) ||
        doc.topics?.toLowerCase().includes(query) ||
        doc.publicationYear?.toString().includes(query)
      );
    });

    setFilteredData(filtered);
    setRenderedCount(20); // Reset to first 20 rows when filtering
  }, [searchQuery, initialFullData]);

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
