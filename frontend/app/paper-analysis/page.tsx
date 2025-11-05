"use client";

import PreprocessingOutputs from "@/components/paper-analysis/preprocessing-outputs";
import SimilarDocuments from "@/components/paper-analysis/similar-documents";
import TopicSimilarity from "@/components/paper-analysis/topic-similarity";
import UploadForm from "@/components/paper-analysis/upload-form";
import type { AnalysisResult, TopicSimilarityItem } from "@/types";
import { useCallback, useState } from "react";

const PaperAnalysis = () => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  // Memoize the callback to prevent infinite loops
  const onAnalysis = useCallback((res: AnalysisResult | null) => {
    setAnalysis(res);
  }, []);

  return (
    <main className="space-y-4 p-6 min-h-full">
      <h1 className="font-semibold text-2xl">Paper Analysis</h1>
      <div className="gap-4 grid grid-cols-2">
        <UploadForm onAnalysis={onAnalysis} />
        <TopicSimilarity
          topics={(analysis?.topic_similarity as TopicSimilarityItem[]) || []}
        />
        <PreprocessingOutputs data={analysis?.preprocessing_outputs} />
        <SimilarDocuments data={analysis?.similar_documents} />
      </div>
    </main>
  );
};

export default PaperAnalysis;
