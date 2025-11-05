"use server";

import { callApi } from "./utils";

export type Document = {
  title: string;
  authors: string;
  publicationYear: number;
  topics: string;
};

export const getAllDocuments = async (
  limit = 0
): Promise<{ documents: Document[]; error?: any }> => {
  const { success: documents, error } = await callApi("/api/corpus-documents");

  if (error) {
    return { error, documents: [] };
  }

  if (!Array.isArray(documents)) return { documents: [] };

  for (const row of documents) {
    row["authors"] = Array.isArray(row["authors"])
      ? row["authors"].join(", ")
      : row["authors"];
  }

  documents.sort((a: any, b: any) => b.publicationYear - a.publicationYear);

  if (limit) return { documents: documents.slice(0, limit) as Document[] };

  return { documents: documents as Document[] };
};
