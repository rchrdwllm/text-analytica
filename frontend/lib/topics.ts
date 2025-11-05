"use server";

import { TrendingTopic } from "@/types";
import { callApi } from "./utils";

export const getTrendingTopicsPerYear = async () => {
  const { success: trendingTopics, error } = await callApi(
    "/api/trending-topics-per-year"
  );

  if (error) {
    return { error, trendingTopics: [] };
  }

  return { trendingTopics } as { trendingTopics: TrendingTopic[]; error: null };
};
