#!/usr/bin/env node

/**
 * Backfill Script for Copilot PR Tracker
 * 
 * This script backfills historical data for a specific date by querying
 * GitHub's GraphQL API for merged PRs created before that date and storing
 * the count in Redis.
 * 
 * Usage:
 *   node scripts/backfill.js YYYY-MM-DD
 * 
 * Example:
 *   node scripts/backfill.js 2024-01-15
 * 
 * The script will:
 * 1. Query GitHub for PRs merged on or before the specified date
 * 2. Store the count in Redis with the specified date
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

const COPILOT_PR_KEY = "copilot:pr:history";

/**
 * Fetches the count of merged pull requests created by Copilot up to a specific date.
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {Promise<number>} Number of merged Copilot PRs up to that date
 */
async function getCopilotPRCountForDate(dateStr) {
  const query = `is:pr is:merged author:copilot-swe-agent[bot] merged:<=${dateStr}`;

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { 
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          query CopilotAuthoredMergedPRsAccountWide($q: String!) {
            search(type: ISSUE, query: $q, first: 1) {
              issueCount
            }
          }
        `,
        variables: { q: query },
      }),
    });

    if (!res.ok) {
      console.error(`GitHub GraphQL API returned an error:`, res.status, res.statusText);
      throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
    }

    const response = await res.json();

    if (response.errors) {
      console.error(`GraphQL errors:`, response.errors);
      throw new Error(`GraphQL errors: ${JSON.stringify(response.errors)}`);
    }

    return response.data?.search?.issueCount || 0;
  } catch (error) {
    console.error(`Error getting Copilot PRs for date ${dateStr}:`, error);
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
  today.setHours(0, 0, 0, 0);
  if (date > today) {
    throw new Error(`Cannot backfill future date: ${dateStr}`);
  }

  console.log(`Backfilling data for ${dateStr}...`);

  // Fetch count from GitHub for this date
  const count = await getCopilotPRCountForDate(dateStr);
  console.log(`Found ${count} merged PRs on or before ${dateStr}`);

  // Create data point with end-of-day timestamp for the specified date
  const timestamp = new Date(dateStr + "T23:59:59.999Z").getTime();

  const dataPoint = {
    date: dateStr,
    count,
    timestamp,
  };

  // Store in Redis sorted set (using timestamp as score for sorting)
  await redis.zadd(COPILOT_PR_KEY, {
    score: timestamp,
    member: JSON.stringify(dataPoint),
  });

  console.log(`✓ Successfully stored data point: ${dateStr} - ${count} PRs (timestamp: ${timestamp})`);
  
  return dataPoint;
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
