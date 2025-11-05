import CorpusTable from "@/components/corpus-documents/corpus-table";
import SearchCorpusForm from "@/components/corpus-documents/search-corpus-form";
import ErrorAlert from "@/components/ui/error-alert";
import CorpusSearchContextWrapper from "@/context/corpus-search-context-wrapper";
import { getAllDocuments } from "@/lib/documents";

const CorpusDocumentsPage = async () => {
  const { documents, error } = await getAllDocuments();

  return (
    <CorpusSearchContextWrapper>
      <main className="flex flex-col space-y-4 p-6 min-h-full">
        <h1 className="font-semibold text-2xl">Corpus Documents</h1>
        <SearchCorpusForm />
        {error && <ErrorAlert error={error} />}
        <CorpusTable initialFullData={documents} initialRenderedCount={20} />
      </main>
    </CorpusSearchContextWrapper>
  );
};

export default CorpusDocumentsPage;
