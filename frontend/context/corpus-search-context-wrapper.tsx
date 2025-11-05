"use client";

import { createContext, ReactNode, useState } from "react";

export const CorpusSearchContext = createContext<{
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}>({
  searchQuery: "",
  setSearchQuery: () => {},
});

const CorpusSearchContextWrapper = ({ children }: { children: ReactNode }) => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <CorpusSearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      {children}
    </CorpusSearchContext.Provider>
  );
};

export default CorpusSearchContextWrapper;
