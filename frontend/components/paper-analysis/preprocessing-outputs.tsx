import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { PreprocessingOutputs as PreprocType } from "@/types";

type Props = {
  data?: PreprocType | null;
};

const PreprocessingOutputs = ({ data }: Props) => {
  return (
    <article className="space-y-4 bg-card p-4 rounded-lg">
      <h2 className="font-medium text-lg">Pre-processing Outputs</h2>
      {data ? (
        <div className="space-y-2 text-sm">
          <div>
            <strong>Filename:</strong> {data.filename}
          </div>
          <div>
            <strong>Word count:</strong> {data.word_count}
          </div>
          <div>
            <strong>Unique words:</strong> {data.unique_words}
          </div>
          <div>
            <strong>Sample words:</strong>{" "}
            {data.sample_words?.slice(0, 20).join(", ")}
          </div>
        </div>
      ) : (
        <Accordion type="single" collapsible>
          <AccordionItem value="processed_summary">
            <AccordionTrigger className="cursor-pointer">
              Processed Summary
            </AccordionTrigger>
            <AccordionContent>Processed Summary</AccordionContent>
          </AccordionItem>
          <AccordionItem value="text_cleaning">
            <AccordionTrigger className="cursor-pointer">
              Text Cleaning
            </AccordionTrigger>
            <AccordionContent>Text Cleaning</AccordionContent>
          </AccordionItem>
          <AccordionItem value="text_lemmatization">
            <AccordionTrigger className="cursor-pointer">
              Text Lemmatization
            </AccordionTrigger>
            <AccordionContent>Text Lemmatization</AccordionContent>
          </AccordionItem>
          <AccordionItem value="text_pos_tagging">
            <AccordionTrigger className="cursor-pointer">
              Text POS Tagging
            </AccordionTrigger>
            <AccordionContent>Text POS Tagging</AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </article>
  );
};

export default PreprocessingOutputs;
