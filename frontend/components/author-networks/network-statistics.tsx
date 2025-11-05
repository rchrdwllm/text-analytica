"use client";

import {
  fetchNetworkStatistics,
  NetworkStatistics as NetworkStatisticsType,
} from "@/lib/network-statistics";
import { useEffect, useState } from "react";

const NetworkStatistics = () => {
  const [data, setData] = useState<NetworkStatisticsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        setLoading(true);
        const statistics = await fetchNetworkStatistics();
        setData(statistics);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load network statistics"
        );
      } finally {
        setLoading(false);
      }
    };

    loadStatistics();
  }, []);

  if (loading) {
    return (
      <article className="space-y-2 bg-card p-4 rounded-lg h-full">
        <h2 className="font-medium text-lg">Network Statistics</h2>
        <p className="text-muted-foreground">Loading...</p>
      </article>
    );
  }

  if (error) {
    return (
      <article className="space-y-2 bg-card p-4 rounded-lg h-full">
        <h2 className="font-medium text-lg">Network Statistics</h2>
        <p className="text-destructive">{error}</p>
      </article>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <article className="space-y-2 bg-card p-4 rounded-lg h-full">
      <h2 className="font-medium text-lg">Network Statistics</h2>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">Nodes</p>
          <p className="font-medium">{data.nodes}</p>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">Edges</p>
          <p className="font-medium">{data.edges}</p>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">Communities</p>
          <p className="font-medium">{data.communities}</p>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">Average Degree</p>
          <p className="font-medium">{data.averageDegree.toFixed(2)}</p>
        </div>
      </div>
    </article>
  );
};

export default NetworkStatistics;
