export type Keyword = {
  weight: number;
  word: string;
};

export type Topic = {
  document_count: number;
  topic_id: number;
  keywords: Keyword[];
};

export type TrendingTopic = {
  group: string;
  topics: Topic[];
};
