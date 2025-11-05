import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import axios from "axios";

const PORT = 5000;

export const callApi = async (endpoint: string) => {
  const url = `${
    process.env.NEXT_PUBLIC_BACKEND_URL || `http://127.0.0.1:${PORT}`
  }${endpoint}`;

  try {
    console.log(`Calling API ${endpoint}`)
    const res = await axios.get(url);
    const { data } = res;

    return { success: data };
  } catch (error) {
    console.error(`API call to ${endpoint} failed:`, error);

    return { error };
  }
};

export const callApiBlob = async (
  endpoint: string,
  signal?: AbortSignal
) => {
  const url = `${
    process.env.NEXT_PUBLIC_BACKEND_URL || `http://127.0.0.1:${PORT}`
  }${endpoint}`;

  try {
    const res = await axios.get(url, {
      responseType: "blob",
      signal,
    });

    return { success: res.data };
  } catch (error) {
    if (axios.isCancel(error)) {
      return { error, cancelled: true };
    }
    console.error(`API call to ${endpoint} failed:`, error);

    return { error, cancelled: false };
  }
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
