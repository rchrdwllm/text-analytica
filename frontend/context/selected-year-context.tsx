"use client";

import { createContext, ReactNode, useContext, useRef, useState } from "react";

interface SelectedYearContextType {
  selectedYear: string | null;
  setSelectedYear: (year: string) => void;
  wordCloudUrl: string | null;
  setWordCloudUrl: (url: string | null) => void;
  isLoadingWordCloud: boolean;
  setIsLoadingWordCloud: (loading: boolean) => void;
  abortControllerRef: React.MutableRefObject<AbortController | null>;
}

const SelectedYearContext = createContext<SelectedYearContextType | undefined>(
  undefined
);

export function SelectedYearProvider({ children }: { children: ReactNode }) {
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [wordCloudUrl, setWordCloudUrl] = useState<string | null>(null);
  const [isLoadingWordCloud, setIsLoadingWordCloud] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  return (
    <SelectedYearContext.Provider
      value={{
        selectedYear,
        setSelectedYear,
        wordCloudUrl,
        setWordCloudUrl,
        isLoadingWordCloud,
        setIsLoadingWordCloud,
        abortControllerRef,
      }}
    >
      {children}
    </SelectedYearContext.Provider>
  );
}

export function useSelectedYear() {
  const context = useContext(SelectedYearContext);
  if (context === undefined) {
    throw new Error("useSelectedYear must be used within a SelectedYearProvider");
  }
  return context;
}
