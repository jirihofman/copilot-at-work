"use server";

import { redis, COPILOT_PR_KEY, PRDataPoint } from "@/lib/redis";

interface FetchDataOptions {
  limit?: number;
}

export async function fetchCopilotPRData(
  options: FetchDataOptions = {}
): Promise<PRDataPoint[]> {
  try {
    const { limit = 365 } = options;
    const limitValue = Math.min(Math.max(limit, 1), 1000); // Cap at 1000 records

    // Get recent data points from Redis sorted set (most recent first)
    const data = await redis.zrange<any[]>(COPILOT_PR_KEY, -limitValue, -1, {
      withScores: false,
    });

    if (!data || data.length === 0) {
      return [];
    }

    // Parse the JSON strings back to objects
    const parsedData: PRDataPoint[] = data;

    // Sort by timestamp to ensure correct order
    parsedData.sort((a, b) => a.timestamp - b.timestamp);

    return parsedData;
  } catch (error) {
    console.error("Error fetching data from Redis:", error);
    return [];
  }
}
