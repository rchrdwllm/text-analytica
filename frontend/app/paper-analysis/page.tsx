import PreprocessingOutputs from "@/components/paper-analysis/preprocessing-outputs";
import SimilarDocuments from "@/components/paper-analysis/similar-documents";
import TopicSimilarity from "@/components/paper-analysis/topic-similarity";
import UploadForm from "@/components/paper-analysis/upload-form";

const PaperAnalysis = () => {
  return (
    <main className="space-y-4 p-6 min-h-full">
      <h1 className="font-semibold text-2xl">Paper Analysis</h1>
      <div className="gap-4 grid grid-cols-2">
        <UploadForm />
        <TopicSimilarity />
        <PreprocessingOutputs />
        <SimilarDocuments />
      </div>
    </main>
  );
};

export default PaperAnalysis;
