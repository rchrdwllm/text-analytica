import CorpusDocuments from "@/components/dashboard/corpus-documents";
import CorpusOverview from "@/components/dashboard/corpus-overview";
import TopicCountPerGroup from "@/components/dashboard/topic-count-per-group";
import TrendingTopicsPerGroup from "@/components/dashboard/trending-topics-per-group";
import ErrorAlert from "@/components/ui/error-alert";
import { getAllDocuments } from "@/lib/documents";
import { getCorpusOverview } from "@/lib/overview";
import { getTrendingTopicsPerGroup } from "@/lib/topics";

const DashboardPage = async () => {
  const { documents, error: docsError } = await getAllDocuments(20);
  const { overview, error: overviewError } = await getCorpusOverview();
  const { trendingTopics, error: trendingTopicsError } =
    await getTrendingTopicsPerGroup();

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
          <TopicCountPerGroup />
        </div>
        <div className="col-span-3 h-full">
          <TrendingTopicsPerGroup trendingTopics={trendingTopics} />
        </div>
      </div>
      <h2 className="font-medium text-lg">Corpus Documents</h2>
      <CorpusDocuments initialData={documents} />
    </main>
  );
};

export default DashboardPage;
