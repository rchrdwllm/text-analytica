import CorpusDocuments from "@/components/dashboard/corpus-documents";
import CorpusOverview from "@/components/dashboard/corpus-overview";
import TopicCountPerYear from "@/components/dashboard/topic-count-per-year";
import TrendingTopicsPerYear from "@/components/dashboard/trending-topics-per-year";
import ErrorAlert from "@/components/ui/error-alert";
import { getAllDocuments } from "@/lib/documents";
import { getCorpusOverview } from "@/lib/overview";
import { getTrendingTopicsPerYear } from "@/lib/topics";

const DashboardPage = async () => {
  const { documents, error: docsError } = await getAllDocuments(20);
  const { overview, error: overviewError } = await getCorpusOverview();
  const { trendingTopics, error: trendingTopicsError } =
    await getTrendingTopicsPerYear();

  const error = docsError || overviewError || trendingTopicsError;

  return (
    <main className="space-y-4 p-6 min-h-full">
      <h1 className="font-semibold text-2xl">Dashboard</h1>
      {error && <ErrorAlert error={error} />}
      <CorpusOverview
        loadedDocuments={overview?.loadedDocuments}
        identifiedTopics={overview?.identifiedTopics}
        authorCount={overview?.authorCount}
        connectionCount={overview?.connectionCount}
      />
      <div className="gap-4 grid grid-cols-8">
        <div className="col-span-5 h-full">
          <TopicCountPerYear />
        </div>
        <div className="col-span-3 h-full">
          <TrendingTopicsPerYear trendingTopics={trendingTopics} />
        </div>
      </div>
      <h2 className="font-medium text-lg">Corpus Documents</h2>
      <CorpusDocuments initialData={documents} />
    </main>
  );
};

export default DashboardPage;
