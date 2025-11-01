import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PreprocessingOutputs = () => {
  return (
    <article className="space-y-4 bg-card p-4 rounded-lg">
      <h2 className="font-medium text-lg">Pre-processing Outputs</h2>
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
    </article>
  );
};

export default PreprocessingOutputs;
