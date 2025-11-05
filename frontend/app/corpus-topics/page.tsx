"use client";

import TopicsTable from "@/components/corpus-topics/topics-table";
import WordCloud from "@/components/corpus-topics/word-cloud";
import YearCard from "@/components/corpus-topics/year-card";
import ErrorAlert from "@/components/ui/error-alert";
import { SelectedYearProvider } from "@/context/selected-year-context";
import { getCorpusTopics } from "@/lib/topics";
import { useEffect, useState } from "react";

const CorpusTopics = () => {
  const [allTopics, setAllTopics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const result = await getCorpusTopics();

        if (result.error != null) {
          setError(result.error);
        } else {
          const data = result.data;
          data.sort(
            (a: any, b: any) =>
              parseInt(b.group_name.split("_")[0]) -
              parseInt(a.group_name.split("-")[0])
          );
          setAllTopics(result);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <main className="p-6 min-h-full">
        <p className="text-muted-foreground">Loading...</p>
      </main>
    );
  }

  if (error) {
    return <ErrorAlert error={error} />;
  }

  if (!allTopics) {
    return null;
  }

  return (
    <SelectedYearProvider>
      <main className="p-6 min-h-full">
        <h1 className="top-6 sticky self-start mb-4 font-semibold text-2xl">
          Corpus Topics
        </h1>
        <div className="flex gap-4 shrink-0">
          <aside className="top-[calc(2.5rem+31.99px)] sticky self-start space-y-4 rounded-lg w-full min-w-[320px] max-w-[320px] h-[calc(100vh-1.5rem-31.99px-2.5rem)] overflow-y-auto scrollbar-hide">
            {allTopics.data.map((s: any) => (
              <YearCard
                key={s.group_name}
                name={s.group_name}
                topics={s.topics}
                documents={s.total_documents}
              />
            ))}
          </aside>
          <div className="flex-1 space-y-4">
            <WordCloud />
            <TopicsTable />
          </div>
        </div>
      </main>
    </SelectedYearProvider>
  );
};

export default CorpusTopics;
