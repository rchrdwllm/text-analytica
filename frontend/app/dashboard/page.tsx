import CorpusDocuments from "@/components/dashboard/corpus-documents";
import CorpusOverview from "@/components/dashboard/corpus-overview";
import TopicCountPerYear from "@/components/dashboard/topic-count-per-year";
import TrendingTopicsPerYear from "@/components/dashboard/trending-topics-per-year";

const DashboardPage = () => {
  return (
    <main className="space-y-4 p-6 min-h-full">
      <h1 className="font-semibold text-2xl">Dashboard</h1>
      <CorpusOverview />
      <div className="gap-4 grid grid-cols-8">
        <div className="col-span-5 h-full">
          <TopicCountPerYear />
        </div>
        <div className="col-span-3 h-full">
          <TrendingTopicsPerYear />
        </div>
      </div>
      <h2 className="font-medium text-lg">Corpus Documents</h2>
      <CorpusDocuments />
    </main>
  );
};

export default DashboardPage;
