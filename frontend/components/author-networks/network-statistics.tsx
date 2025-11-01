const NetworkStatistics = () => {
  return (
    <article className="space-y-2 bg-card p-4 rounded-lg h-full">
      <h2 className="font-medium text-lg">Network Statistics</h2>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <p className="font-medium">Nodes</p>
          <p>0</p>
        </div>
        <div className="flex justify-between items-center">
          <p className="font-medium">Edges</p>
          <p>0</p>
        </div>
        <div className="flex justify-between items-center">
          <p className="font-medium">Communities</p>
          <p>0</p>
        </div>
        <div className="flex justify-between items-center">
          <p className="font-medium">Average Degree</p>
          <p>0</p>
        </div>
      </div>
    </article>
  );
};

export default NetworkStatistics;
