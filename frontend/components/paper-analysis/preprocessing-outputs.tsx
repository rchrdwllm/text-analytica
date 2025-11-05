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
            <strong>Sample pre-processed words:</strong>{" "}
            {data.sample_words?.slice(0, 20).join(", ")}
          </div>
        </div>
      ) : (
        <div className="space-y-2 text-sm">
          <div>
            <strong>Filename:</strong>
          </div>
          <div>
            <strong>Word count:</strong>
          </div>
          <div>
            <strong>Unique words:</strong>
          </div>
          <div>
            <strong>Sample pre-processed words:</strong>
          </div>
        </div>
      )}
    </article>
  );
};

export default PreprocessingOutputs;
