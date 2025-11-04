"use client"

import { callApi } from "@/lib/health";
import { useEffect, useState } from "react";

const CorpusOverview = () => {
  const [loadedDocuments, setLoadedDocuments] = useState<number | null>(null);
  const [identifiedTopics, setIdentifiedTopics] = useState<number | null>(null);
  const [authorCount, setAuthorCount] = useState<number | null>(null);
  const [connectionCount, setConnectionCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await callApi("/api/corpus-overview");
      if (cancelled) return;

      const { total_authors: totalAuthors, total_connections: totalConnections } = result;
      const { total_documents: totalDocuments, total_topics: totalTopics } = result;

      console.log(result);

      setAuthorCount(totalAuthors);
      setConnectionCount(totalConnections);

      setLoadedDocuments(totalDocuments);
      setIdentifiedTopics(totalTopics);
    })();

    return () => {cancelled = true};
  }, []);

  return (
    <article className="space-y-7 bg-primary p-4 rounded-lg text-primary-foreground">
      <h2 className="text-lg">Corpus Overview</h2>
      <div className="grid grid-cols-4">
        <div className="border-r border-r-primary-foreground">
          <p>Loaded Documents</p>
          <h3 className="font-semibold text-2xl">{loadedDocuments ?? "0000"}</h3>
        </div>
        <div className="border-r border-r-primary-foreground text-center">
          <p>Identified Topics</p>
          <h3 className="font-semibold text-2xl">{identifiedTopics ?? "0000"}</h3>
        </div>
        <div className="text-center">
          <p>Authors in Network</p>
          <h3 className="font-semibold text-2xl">{authorCount ?? "0000"}</h3>
        </div>
        <div className="border-l border-l-primary-foreground text-right">
          <p>Connections in Network</p>
          <h3 className="font-semibold text-2xl">{connectionCount ?? "0000"}</h3>
        </div>
      </div>
    </article>
  );
};

export default CorpusOverview;
