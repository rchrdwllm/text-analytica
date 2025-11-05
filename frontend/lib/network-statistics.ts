export interface NetworkStatistics {
  nodes: number,
  edges: number;
  communities: number;
  averageDegree: number;
}

import { callApi } from "./utils";

export const fetchNetworkStatistics = async () => {
  const endpoint = "/api/network-statistics";
  const res = await callApi(endpoint);

  if ((res as any).error) throw (res as any).error;
  const {
    nodes: nodes,
    edges: edges,
    communities: communities,
    average_degree: averageDegree,
  } = (res as any).success as {
    nodes: number,
    edges: number;
    communities: number;
    average_degree: number;
  };

  return {nodes, edges, communities, averageDegree} as NetworkStatistics;
};
