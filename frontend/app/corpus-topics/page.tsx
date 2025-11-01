import TopicsTable from "@/components/corpus-topics/topics-table";
import WordCloud from "@/components/corpus-topics/word-cloud";
import YearCard from "@/components/corpus-topics/year-card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CorpusTopics = () => {
  return (
    <main className="p-6 min-h-full">
      <h1 className="top-6 sticky self-start mb-4 font-semibold text-2xl">
        Corpus Topics
      </h1>
      <div className="flex gap-4">
        <aside className="top-[calc(2.5rem+31.99px)] sticky self-start space-y-4 rounded-lg w-full max-w-[320px] h-[calc(100vh-1.5rem-31.99px-2.5rem)] overflow-y-auto scrollbar-hide">
          <Select defaultValue="arxiv">
            <SelectTrigger className="bg-none border-none w-full">
              <SelectValue placeholder="Select corpus" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Corpus</SelectLabel>
                <SelectItem value="arxiv">arXiv</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <YearCard />
          <YearCard />
          <YearCard />
          <YearCard />
          <YearCard />
          <YearCard />
          <YearCard />
        </aside>
        <div className="flex-1 space-y-4">
          <WordCloud />
          <TopicsTable />
        </div>
      </div>
    </main>
  );
};

export default CorpusTopics;
