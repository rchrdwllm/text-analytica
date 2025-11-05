"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSelectedYear } from "@/context/selected-year-context";
import { callApi } from "@/lib/utils";
import { Fragment, useEffect, useState } from "react";

type TopicDocument = {
  title: string;
};

type TopicData = {
  topic: string;
  documents: TopicDocument[];
  coherence: number;
};

const TopicsTable = () => {
  const { selectedYear } = useSelectedYear();
  const [topics, setTopics] = useState<TopicData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedYear) {
      setTopics([]);
      return;
    }

    const fetchTopics = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await callApi(`/api/corpus-topics/${selectedYear}`);

        if (response.error) {
          throw response.error;
        }

        setTopics(response.success);
      } catch (err) {
        console.error("Error fetching topics:", err);
        setError("Failed to load topics");
        setTopics([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [selectedYear]);

  return (
    <div className="bg-card p-4 rounded-lg">
      <h2 className="mb-4 font-medium text-lg">
        Topics {selectedYear && `- ${selectedYear}`}
      </h2>

      {!selectedYear ? (
        <div className="py-8 text-muted-foreground text-center">
          Select a year group to view topics
        </div>
      ) : loading ? (
        <div className="py-8 text-muted-foreground text-center">
          Loading topics...
        </div>
      ) : error ? (
        <div className="py-8 text-destructive text-center">{error}</div>
      ) : topics.length === 0 ? (
        <div className="py-8 text-muted-foreground text-center">
          No topics found
        </div>
      ) : (
        <div className="rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Topic</TableHead>
                <TableHead className="min-w-[300px]">Document</TableHead>
                <TableHead className="min-w-[150px] text-right">
                  Coherence Score
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topics.map((topicData, groupIndex) => (
                <Fragment key={groupIndex}>
                  {topicData.documents.map((doc, docIndex) => (
                    <TableRow key={`${groupIndex}-${docIndex}`}>
                      {docIndex === 0 ? (
                        <TableCell
                          rowSpan={topicData.documents.length}
                          className="min-w-[200px] font-medium break-words align-top whitespace-normal"
                        >
                          {topicData.topic}
                        </TableCell>
                      ) : null}
                      <TableCell className="break-words whitespace-normal">
                        {doc.title}
                      </TableCell>
                      {docIndex === 0 ? (
                        <TableCell
                          rowSpan={topicData.documents.length}
                          className="min-w-[150px] text-right break-words align-top whitespace-normal"
                        >
                          {(topicData.coherence * 100).toFixed(2)}%
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default TopicsTable;
