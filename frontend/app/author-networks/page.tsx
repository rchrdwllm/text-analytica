import NetworkStatistics from "@/components/author-networks/network-statistics";
import SocialNetwork from "@/components/author-networks/social-network";
import CorpusTable from "@/components/corpus-documents/corpus-table";
import SearchCorpusForm from "@/components/corpus-documents/search-corpus-form";
import ErrorAlert from "@/components/ui/error-alert";
import CorpusSearchContextWrapper from "@/context/corpus-search-context-wrapper";
import { getAllDocuments } from "@/lib/documents";

const AuthorNetworksPage = async () => {
  const { documents, error } = await getAllDocuments();

  return (
    <main className="space-y-4 p-6 min-h-full">
      <h1 className="font-semibold text-2xl">Author Networks</h1>
      {error && <ErrorAlert error={error} />}
      <section className="gap-4 grid grid-cols-6 min-h-[700px]">
        <div className="col-span-4">
          <SocialNetwork />
        </div>
        <div className="col-span-2">
          <NetworkStatistics />
        </div>
      </section>
      <CorpusSearchContextWrapper>
        <SearchCorpusForm />
        {error && <ErrorAlert error={error} />}
        <CorpusTable initialFullData={documents} initialRenderedCount={20} />
      </CorpusSearchContextWrapper>
    </main>
  );
};

export default AuthorNetworksPage;
