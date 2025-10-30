"use server";

import axios from "axios";

// sample function to check backend health endpoint
export const checkHealth = async () => {
  // lagay na lang sa .env if wala pa
  const { data } = await axios.get(
    `${
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5000"
    }/api/health`
  );
  const { status } = data;

  return { success: status };
};
