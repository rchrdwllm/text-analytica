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

export type PreprocessingOutputs = {
  filename: string;
  sample_words: string[];
  unique_words: number;
  word_count: number;
};

export type TopicSimilarityItem = {
  keywords: string[];
  label: string;
  probability: number;
  topic_id: number;
  year_group: string;
};

export type SimilarDocument = {
  title: string;
  authors: string[];
  year: string;
  similarity: number;
};

export type AnalysisResult = {
  preprocessing_outputs: PreprocessingOutputs;
  similar_documents: SimilarDocument[];
  topic_similarity: TopicSimilarityItem[];
};

export type TopicSummary = {
  "group_name": string,
  "topics": number,
  "total_documents": number,
}
