#!/usr/bin/env node

/**
 * Backfill Script for Agent Commit History
 * 
 * This script backfills historical data for a specific date by querying
 * GitHub's commit search API for daily commit counts and storing
 * the count in Redis.
 * 
 * Usage:
 *   node scripts/backfill-agent.js <agent> YYYY-MM-DD
 * 
 * Example:
 *   node scripts/backfill-agent.js copilot 2024-01-15
 *   node scripts/backfill-agent.js claude 2024-01-15
 *   node scripts/backfill-agent.js cursor 2024-01-15
 * 
 * The script will:
 * 1. Query GitHub for commits authored on the specified date
 * 2. Store the count in Redis with the specified date
 * 3. Exit with status 0 on success, 1 on failure
 * 
 * To backfill multiple dates, run this script in a loop:
 *   for date in 2024-01-01 2024-01-02 2024-01-03; do
 *     node scripts/backfill-agent.js copilot $date
 *     sleep 2  # Rate limiting
 *   done
 */

import { Redis } from "@upstash/redis";
import dotenv from 'dotenv';

// Load environment variables from .env.local or .env
dotenv.config({ path: '.env.local' });
dotenv.config(); // Fallback to .env

// Validate environment variables
if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.error("Error: UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set");
  process.exit(1);
}

if (!process.env.GITHUB_TOKEN) {
  console.error("Error: GITHUB_TOKEN must be set");
  process.exit(1);
}

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const AGENT_CONFIG = {
  copilot: {
    botName: "copilot-swe-agent[bot]",
    redisKey: "copilot:commit:history",
  },
  claude: {
    botName: "claude",
    redisKey: "claude:commit:history",
  },
  cursor: {
    botName: "cursoragent",
    redisKey: "cursor:commit:history",
  },
};

/**
 * Fetches the count of commits authored by an agent on a specific date.
 * @param {string} agentName - Agent name (copilot, claude, or cursor)
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {Promise<number>} Number of commits for that date
 */
async function getAgentCommitCountForDate(agentName, dateStr) {
  const config = AGENT_CONFIG[agentName];
  if (!config) {
    throw new Error(`Unknown agent: ${agentName}. Use 'copilot', 'claude' or 'cursor'`);
  }

  const query = encodeURIComponent(`author:${config.botName} author-date:${dateStr}`);

  try {
    const res = await fetch(`https://api.github.com/search/commits?q=${query}&per_page=1`, {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!res.ok) {
      console.error(`GitHub REST API returned an error:`, res.status, res.statusText);
      throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
    }

    const response = await res.json();

    return response.total_count || 0;
  } catch (error) {
    console.error(`Error getting ${agentName} commits for date ${dateStr}:`, error);
    throw error;
  }
}

/**
 * Main function to backfill data for a specific date
 */
async function backfillDate(agentName, dateStr) {
  const config = AGENT_CONFIG[agentName];
  if (!config) {
    throw new Error(`Unknown agent: ${agentName}. Use 'copilot', 'claude' or 'cursor'`);
  }

  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) {
    throw new Error(`Invalid date format: ${dateStr}. Expected YYYY-MM-DD`);
  }

  // Validate that the date is valid
  const date = new Date(dateStr + "T00:00:00.000Z");
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${dateStr}`);
  }

  // Don't allow future dates (compare date strings to avoid timezone issues)
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  if (dateStr > todayStr) {
    throw new Error(`Cannot backfill future date: ${dateStr}`);
  }

  console.log(`Backfilling ${agentName} commit data for ${dateStr}...`);

  // Fetch count from GitHub for this date
  const count = await getAgentCommitCountForDate(agentName, dateStr);
  console.log(`Found ${count} commits on ${dateStr}`);

  // Create data point with end-of-day timestamp for the specified date
  const timestamp = new Date(dateStr + "T23:59:59.999Z").getTime();

  const dataPoint = {
    date: dateStr,
    count,
    timestamp,
  };

  // Store in Redis sorted set (using timestamp as score for sorting)
  await redis.zadd(config.redisKey, {
    score: timestamp,
    member: JSON.stringify(dataPoint),
  });

  console.log(`✓ Successfully stored data point: ${dateStr} - ${count} commits (timestamp: ${timestamp})`);
  
  return dataPoint;
}

// Main execution
const agentArg = process.argv[2];
const dateArg = process.argv[3];

if (!agentArg || !dateArg) {
  console.error("Error: Agent and date arguments required");
  console.error("Usage: node scripts/backfill-agent.js <agent> YYYY-MM-DD");
  console.error("Example: node scripts/backfill-agent.js copilot 2024-01-15");
  console.error("         node scripts/backfill-agent.js claude 2024-01-15");
  process.exit(1);
}

backfillDate(agentArg, dateArg)
  .then((dataPoint) => {
    console.log("Backfill completed successfully");
    // Exit with special code if count is 0 to help shell scripts detect this
    process.exit(dataPoint.count === 0 ? 2 : 0);
  })
  .catch((error) => {
    console.error("Backfill failed:", error.message);
    process.exit(1);
  });
