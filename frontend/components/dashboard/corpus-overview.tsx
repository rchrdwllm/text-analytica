const CorpusOverview = () => {
  return (
    <article className="space-y-7 bg-primary p-4 rounded-lg text-primary-foreground">
      <h2 className="text-lg">Corpus Overview</h2>
      <div className="grid grid-cols-4">
        <div className="border-r border-r-primary-foreground">
          <p>Loaded Documents</p>
          <h3 className="font-semibold text-2xl">0000</h3>
        </div>
        <div className="border-r border-r-primary-foreground text-center">
          <p>Identified Topics</p>
          <h3 className="font-semibold text-2xl">0000</h3>
        </div>
        <div className="text-center">
          <p>Authors in Network</p>
          <h3 className="font-semibold text-2xl">0000</h3>
        </div>
        <div className="border-l border-l-primary-foreground text-right">
          <p>Connections in Network</p>
          <h3 className="font-semibold text-2xl">0000</h3>
        </div>
      </div>
    </article>
  );
};

export default CorpusOverview;
