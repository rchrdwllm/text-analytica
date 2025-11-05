"use server";

import { callApi } from "./utils";

export type DocumentTopicCount = {
  group: string;
  topicCount: number;
};

export const getTopicCountPerGroup = async (): Promise<{ documents: DocumentTopicCount[]; error?: any }> => {
  const { success: documents, error } = await callApi("/api/topic-count-per-group");

  if (error) {
    return { error, documents: [] };
  }

  return { documents: documents.map((d: any) => ({group: d.group, topicCount: d.topic_count})) };
};
