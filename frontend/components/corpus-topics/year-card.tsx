"use client";

import { useSelectedYear } from "@/context/selected-year-context";
import { callApiBlob, cn } from "@/lib/utils";

type YearCardProps = {
  name: string;
  topics: number;
  documents: number;
};

const YearCard = ({ name = "", topics = 0.0, documents = 0.0 }: YearCardProps) => {
  const { 
    selectedYear, 
    setSelectedYear, 
    setWordCloudUrl, 
    setIsLoadingWordCloud,
    abortControllerRef 
  } = useSelectedYear();
  const isActive = selectedYear === name;

  const handleClick = async () => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create a new AbortController for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setSelectedYear(name);
    setIsLoadingWordCloud(true);
    setWordCloudUrl(null);

    try {
      const response = await callApiBlob(
        `/api/corpus-wordcloud/${name}`,
        abortController.signal
      );

      // Check if request was cancelled
      if (response.cancelled) {
        console.log("Request cancelled:", name);
        return;
      }

      if (response.error) {
        throw response.error;
      }

      // Only update if this request wasn't cancelled
      if (!abortController.signal.aborted) {
        // Create a URL for the blob
        const imageUrl = URL.createObjectURL(response.success);
        setWordCloudUrl(imageUrl);
      }
    } catch (error) {
      console.error("Error fetching word cloud:", error);
      // Only clear if this request wasn't cancelled
      if (!abortController.signal.aborted) {
        setWordCloudUrl(null);
      }
    } finally {
      // Only update loading state if this request wasn't cancelled
      if (!abortController.signal.aborted) {
        setIsLoadingWordCloud(false);
      }
    }
  };

  return (
    <article
      onClick={handleClick}
      className={cn(
        "bg-card hover:bg-primary/10 p-4 rounded-lg hover:text-primary transition-colors cursor-pointer",
        isActive && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
      )}
    >
      <h3 className="font-medium text-lg">{name}</h3>
      <p>{topics} Topics</p>
      <p>{documents} Documents</p>
    </article>
  );
};

export default YearCard;
