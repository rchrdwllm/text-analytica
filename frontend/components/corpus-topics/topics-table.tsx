"use client";

import { ExpandedState } from "@tanstack/react-table";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type TopicDocument = {
  document: string;
  coherenceScore: string;
};

type TopicGroup = {
  topic: string;
  documents: TopicDocument[];
};

const data: TopicGroup[] = [
  {
    topic: "A, B, C",
    documents: [
      {
        document: "An Empirical Analysis of Search in GSAT",
        coherenceScore: "96.4%",
      },
      {
        document: "Software Agents: Completing Patte...",
        coherenceScore: "0.00%",
      },
      {
        document: "Decidable Reasoning in Terminolo...",
        coherenceScore: "0.00%",
      },
    ],
  },
  {
    topic: "D, E, F",
    documents: [
      {
        document: "Exploring the Decision Forest: An E...",
        coherenceScore: "0.00%",
      },
      {
        document: "Bias-Driven Revision of Logical Do...",
        coherenceScore: "0.00%",
      },
    ],
  },
];

const TopicsTable = () => {
  const [expanded, setExpanded] = useState<ExpandedState>({
    0: true,
    1: true,
  });

  return (
    <div className="bg-card p-4 rounded-lg">
      <h2 className="mb-4 font-medium text-lg">Topics</h2>
      <div className="rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Topic</TableHead>
              <TableHead>Document</TableHead>
              <TableHead className="w-[200px] text-right">
                Coherence Score
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((topicGroup, groupIndex) => (
              <>
                {topicGroup.documents.map((doc, docIndex) => (
                  <TableRow key={`${groupIndex}-${docIndex}`}>
                    {docIndex === 0 ? (
                      <TableCell
                        rowSpan={topicGroup.documents.length}
                        className="font-medium align-top"
                      >
                        {topicGroup.topic}
                      </TableCell>
                    ) : null}
                    <TableCell>{doc.document}</TableCell>
                    <TableCell className="text-right">
                      {doc.coherenceScore}
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TopicsTable;
