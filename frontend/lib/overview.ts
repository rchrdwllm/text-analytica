"use server";

import { callApi } from "./utils";

export type Overview = {
  loadedDocuments: number | null;
  identifiedTopics: number | null;
  authorCount: number | null;
  connectionCount: number | null;
};

export const getCorpusOverview = async (): Promise<{
  overview?: Overview;
  error?: any;
}> => {
  const { success: result, error } = await callApi("/api/corpus-overview");

  if (error) return { error };

  if (!result || typeof result !== "object") {
    return {
      overview: {
        loadedDocuments: null,
        identifiedTopics: null,
        authorCount: null,
        connectionCount: null,
      },
    };
  }

  const { total_authors, total_connections, total_documents, total_topics } =
    result;

  const overview: Overview = {
    loadedDocuments:
      typeof total_documents === "number" ? total_documents : null,
    identifiedTopics: typeof total_topics === "number" ? total_topics : null,
    authorCount: typeof total_authors === "number" ? total_authors : null,
    connectionCount:
      typeof total_connections === "number" ? total_connections : null,
  };

  return { overview };
};
