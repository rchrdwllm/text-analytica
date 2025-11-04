"use server";

import axios from "axios";

const PORT = 5000;

export const callApi = async (endpoint: string) => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || `http://127.0.0.1:${PORT}`}${endpoint}`;

  return axios.get(url).then((e) => e.data).catch((e) => ({"error": e}));
}

// sample function to check backend health endpoint
export const checkHealth = async () => {
  // lagay na lang sa .env if wala pa
  const { status } = await callApi('/api/health');

  return { success: status };
};
