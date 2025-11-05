"use client";

import CorpusTable from "@/components/corpus-documents/corpus-table";
import SearchCorpusForm from "@/components/corpus-documents/search-corpus-form";
import ErrorAlert from "@/components/ui/error-alert";
import { getAllDocuments } from "@/lib/documents";
import { createContext, useState } from "react";

export const CorpusSearchContext = createContext<{
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}>({
  searchQuery: "",
  setSearchQuery: () => {},
});

const CorpusDocumentsPage = async () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { documents, error } = await getAllDocuments();

  if (error) return <ErrorAlert error={error} />;

  return (
    <CorpusSearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      <main className="flex flex-col space-y-4 p-6 min-h-full">
        <h1 className="font-semibold text-2xl">Corpus Documents</h1>
        <SearchCorpusForm />
        {/* <CorpusTable initialFullData={documents} initialRenderedCount={20} /> */}
        <CorpusTable />
      </main>
    </CorpusSearchContext.Provider>
  );
};

export default CorpusDocumentsPage;
