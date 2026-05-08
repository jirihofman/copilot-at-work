"use server";

import { redis, COPILOT_COMMIT_KEY, CLAUDE_COMMIT_KEY, CURSOR_COMMIT_KEY, CODEX_COMMIT_KEY } from "@/lib/redis";

async function fetchHistoryData(key, options = {}) {
  try {
    const { limit = 365 } = options;
    const limitValue = Math.min(Math.max(limit, 1), 1000); // Cap at 1000 records

    // Get recent data points from Redis sorted set (most recent first)
    const data = await redis.zrange(key, -limitValue, -1, {
      withScores: false,
    });

    if (!data || data.length === 0) {
      return [];
    }

    // Parse the JSON strings back to objects
    const parsedData = data.map(item => 
      typeof item === 'string' ? JSON.parse(item) : item
    );

    // Sort by timestamp to ensure correct order
    parsedData.sort((a, b) => a.timestamp - b.timestamp);

    return parsedData;
  } catch (error) {
    console.error("Error fetching data from Redis:", error);
    return [];
  }
}

export async function fetchCopilotCommitData(options = {}) {
  return fetchHistoryData(COPILOT_COMMIT_KEY, options);
}

export async function fetchClaudeCommitData(options = {}) {
  return fetchHistoryData(CLAUDE_COMMIT_KEY, options);
}

export async function fetchCursorCommitData(options = {}) {
  return fetchHistoryData(CURSOR_COMMIT_KEY, options);
}

export async function fetchCodexCommitData(options = {}) {
  return fetchHistoryData(CODEX_COMMIT_KEY, options);
}
