#!/usr/bin/env node

/**
 * Backfill Script for Commit History
 * 
 * This script backfills daily commit counts for all tracked agents for a
 * specific date and stores those counts in Redis.
 * 
 * Usage:
 *   node scripts/backfill.js YYYY-MM-DD
 * 
 * Example:
 *   node scripts/backfill.js 2024-01-15
 * 
 * The script will:
 * 1. Query GitHub for commits authored on the specified date
 * 2. Store daily counts in Redis for all tracked agents
 * 3. Exit with status 0 on success, 1 on failure
 * 
 * To backfill multiple dates, run this script in a loop:
 *   for date in 2024-01-01 2024-01-02 2024-01-03; do
 *     node scripts/backfill.js $date
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

const AGENTS = [
  { key: "copilot", name: "copilot-swe-agent[bot]", redisKey: "copilot:commit:history" },
  { key: "claude", name: "claude", redisKey: "claude:commit:history" },
  { key: "cursor", name: "cursoragent", redisKey: "cursor:commit:history" },
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetches the count of commits authored by an agent on a specific date.
 * Uses GitHub REST search API.
 * @param {string} agentName - Agent login
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {Promise<number>} Number of commits for that day
 */
async function getAgentCommitCountForDate(agentName, dateStr) {
  const query = encodeURIComponent(`author:${agentName} author-date:${dateStr}`);

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
    console.error(`Error getting commits for ${agentName} on ${dateStr}:`, error);
    throw error;
  }
}

/**
 * Main function to backfill data for a specific date
 */
async function backfillDate(dateStr) {
  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) {
    throw new Error(`Invalid date format: ${dateStr}. Expected YYYY-MM-DD`);
  }

  // Validate that the date is valid
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${dateStr}`);
  }

  // Don't allow future dates
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (date > today) {
    throw new Error(`Cannot backfill future date: ${dateStr}`);
  }

  console.log(`Backfilling commit data for ${dateStr}...`);

  // Create data point with end-of-day timestamp for the specified date
  const timestamp = new Date(dateStr + "T23:59:59.999Z").getTime();

  const results = [];

  for (const [index, agent] of AGENTS.entries()) {
    const count = await getAgentCommitCountForDate(agent.name, dateStr);
    const dataPoint = {
      date: dateStr,
      count,
      timestamp,
    };

    await redis.zadd(agent.redisKey, {
      score: timestamp,
      member: JSON.stringify(dataPoint),
    });

    results.push({ key: agent.key, count });

    if (index < AGENTS.length - 1) {
      await sleep(1500);
    }
  }

  console.log(
    `✓ Successfully stored data point: ${dateStr} - ${results
      .map((result) => `${result.key}: ${result.count} commits`)
      .join(", ")}`
  );

  return results;
}

// Main execution
const dateArg = process.argv[2];

if (!dateArg) {
  console.error("Error: Date argument required");
  console.error("Usage: node scripts/backfill.js YYYY-MM-DD");
  console.error("Example: node scripts/backfill.js 2024-01-15");
  process.exit(1);
}

backfillDate(dateArg)
  .then(() => {
    console.log("Backfill completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Backfill failed:", error.message);
    process.exit(1);
  });
