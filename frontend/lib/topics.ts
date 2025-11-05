"use server";

import { TopicSummary, TrendingTopic } from "@/types";
import { callApi } from "./utils";

export const getCorpusTopics = async () => {
  const { success: data, error } = await callApi(
    "/api/corpus-topics"
  );

  if (error) {
    return { error, data: [] };
  }

  return { data } as { data: TopicSummary[]; error: null };};

export const getTrendingTopicsPerGroup = async () => {
  const { success: trendingTopics, error } = await callApi(
    "/api/trending-topics-per-group"
  );

  if (error) {
    return { error, trendingTopics: [] };
  }

  return { trendingTopics } as { trendingTopics: TrendingTopic[]; error: null };
};
