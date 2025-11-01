import CorpusTable from "@/components/corpus-documents/corpus-table";
import SearchCorpusForm from "@/components/corpus-documents/search-corpus-form";

const CorpusDocumentsPage = () => {
  return (
    <main className="flex flex-col space-y-4 p-6 min-h-full">
      <h1 className="font-semibold text-2xl">Corpus Documents</h1>
      <SearchCorpusForm />
      <CorpusTable />
    </main>
  );
};

export default CorpusDocumentsPage;
