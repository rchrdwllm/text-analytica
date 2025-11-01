import tempWordCloud from "@/public/images/temp_word_cloud.png";
import Image from "next/image";

const WordCloud = () => {
  return (
    <section className="bg-card p-4 rounded-lg">
      <h2 className="font-medium text-lg">Word Cloud of Corpus</h2>
      <Image src={tempWordCloud} alt="Word Cloud" />
    </section>
  );
};

export default WordCloud;
