"use client";

import { useSelectedYear } from "@/context/selected-year-context";
import tempWordCloud from "@/public/images/temp_word_cloud.png";
import Image from "next/image";

const WordCloud = () => {
  const { selectedYear, wordCloudUrl, isLoadingWordCloud } = useSelectedYear();

  return (
    <section className="bg-card p-4 rounded-lg">
      <h2 className="font-medium text-lg">
        Word Cloud of Corpus {selectedYear && `- ${selectedYear}`}
      </h2>
      {isLoadingWordCloud ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">Loading word cloud...</p>
        </div>
      ) : wordCloudUrl ? (
        <div className="relative w-full">
          <img
            src={wordCloudUrl}
            alt="Word Cloud"
            className="w-full h-auto rounded-lg"
          />
        </div>
      ) : (
        <div className="relative">
          <Image src={tempWordCloud} alt="Word Cloud" />
          <p className="text-muted-foreground text-center mt-2">
            Select a year group to view word cloud
          </p>
        </div>
      )}
    </section>
  );
};

export default WordCloud;
