export interface BackendNode {
  id: string;
  group?: string;
  weight?: number;
  paper_count?: number;
  year?: string;
  // other optional fields returned by backend
  [k: string]: any;
}

export interface BackendLink {
  source: string;
  target: string;
  value?: number;
}
import { callApi } from "./utils";

export const fetchAuthorNetwork = async (author: string) => {
  const endpoint =
    "/api/author-networks" +
    (author ? `?author_name=${encodeURIComponent(author)}` : "");

  const res = await callApi(endpoint);

  if ((res as any).error) throw (res as any).error;

  return (res as any).success;
};

export const fetchFullGraph = async () => {
  return fetchAuthorNetwork("");
};
