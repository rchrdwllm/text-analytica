"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TopicSimilarityItem } from "@/types";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";

type TopicRow = {
  topic: string;
  coherenceScore: number;
};

type TopicSimilarityProps = {
  topics: TopicSimilarityItem[];
};

const TopicSimilarity = ({ topics = [] }: TopicSimilarityProps) => {
  const data: TopicRow[] = useMemo(
    () =>
      topics.map((t) => ({
        topic: t.label,
        coherenceScore: t.probability,
      })),
    [topics]
  );

  const columns: ColumnDef<TopicRow>[] = useMemo(
    () => [
      {
        accessorKey: "topic",
        header: "Topic",
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("topic")}</div>
        ),
      },
      {
        accessorKey: "coherenceScore",
        header: () => <div className="text-right">Coherence Score</div>,
        cell: ({ row }) => (
          <div className="text-right">
            {(row.getValue<number>("coherenceScore") * 100).toFixed(2)}%
          </div>
        ),
        enableSorting: true,
      },
    ],
    []
  );

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
    <article className="bg-card p-4 rounded-lg">
      <h2 className="mb-4 font-medium text-lg">Topic Similarity</h2>
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

export default TopicSimilarity;
