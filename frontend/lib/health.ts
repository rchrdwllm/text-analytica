"use server";

import { callApi } from "./utils";

// sample function to check backend health endpoint
export const checkHealth = async () => {
  // lagay na lang sa .env if wala pa
  const { success: status, error } = await callApi("/api/health");

  return { status, error };
};
