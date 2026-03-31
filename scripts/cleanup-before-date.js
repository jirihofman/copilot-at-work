#!/usr/bin/env node

/**
 * Cleanup Script for PR History
 * 
 * This script removes all history records before a specified date
 * for both Copilot and Claude agents.
 * 
 * Usage:
 *   node scripts/cleanup-before-date.js YYYY-MM-DD
 * 
 * Example:
 *   node scripts/cleanup-before-date.js 2025-01-01
 */

import { Redis } from "@upstash/redis";
import dotenv from 'dotenv';

// Load environment variables from .env.local or .env
dotenv.config({ path: '.env.local' });
dotenv.config();

// Validate environment variables
if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.error("Error: UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set");
  process.exit(1);
}

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const COPILOT_PR_KEY = "copilot:pr:history";
const CLAUDE_PR_KEY = "claude:pr:history";

/**
 * Remove all records before a specific date from a sorted set
 */
async function cleanupBeforeDate(key, dateStr) {
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

  console.log(`\nCleaning up ${key} - removing records before ${dateStr}...`);

  // Get the timestamp for the start of the specified date (00:00:00)
  const cutoffTimestamp = new Date(dateStr + "T00:00:00.000Z").getTime();
  
  // Get all records
  const allRecords = await redis.zrange(key, 0, -1, { withScores: false });
  
  if (!allRecords || allRecords.length === 0) {
    console.log(`No records found in ${key}`);
    return 0;
  }

  console.log(`Total records in ${key}: ${allRecords.length}`);
  
  // Filter records before the cutoff date
  const recordsToDelete = [];
  const recordsToKeep = [];
  
  for (const item of allRecords) {
    const record = typeof item === 'string' ? JSON.parse(item) : item;
    if (record.timestamp < cutoffTimestamp) {
      recordsToDelete.push(item);
    } else {
      recordsToKeep.push(item);
    }
  }
  
  console.log(`Found ${recordsToDelete.length} records before ${dateStr}`);
  console.log(`Keeping ${recordsToKeep.length} records from ${dateStr} onwards`);
  
  if (recordsToDelete.length === 0) {
    console.log(`No records to remove from ${key}`);
    return 0;
  }

  // Show sample of what will be deleted
  console.log(`Sample of records to be deleted:`);
  const samplesToShow = Math.min(5, recordsToDelete.length);
  for (let i = 0; i < samplesToShow; i++) {
    const record = typeof recordsToDelete[i] === 'string' ? JSON.parse(recordsToDelete[i]) : recordsToDelete[i];
    console.log(`  - ${record.date}: ${record.count} PRs`);
  }
  if (recordsToDelete.length > samplesToShow) {
    console.log(`  ... and ${recordsToDelete.length - samplesToShow} more`);
  }

  // Remove records by deleting members
  let removed = 0;
  for (const item of recordsToDelete) {
    // Convert to JSON string if it's an object
    const member = typeof item === 'string' ? item : JSON.stringify(item);
    await redis.zrem(key, member);
    removed++;
  }
  
  console.log(`✓ Removed ${removed} records from ${key}`);
  
  // Show remaining records count
  const remaining = await redis.zcard(key);
  console.log(`✓ Remaining records in ${key}: ${remaining}`);
  
  return removed;
}

// Main execution
const dateArg = process.argv[2];

if (!dateArg) {
  console.error("Error: Date argument required");
  console.error("Usage: node scripts/cleanup-before-date.js YYYY-MM-DD");
  console.error("Example: node scripts/cleanup-before-date.js 2025-01-01");
  process.exit(1);
}

async function main() {
  console.log(`========================================`);
  console.log(`Cleaning up PR history before ${dateArg}`);
  console.log(`========================================`);
  
  const copilotRemoved = await cleanupBeforeDate(COPILOT_PR_KEY, dateArg);
  const claudeRemoved = await cleanupBeforeDate(CLAUDE_PR_KEY, dateArg);
  
  console.log(`\n========================================`);
  console.log(`Cleanup Summary:`);
  console.log(`  Copilot records removed: ${copilotRemoved}`);
  console.log(`  Claude records removed: ${claudeRemoved}`);
  console.log(`  Total records removed: ${copilotRemoved + claudeRemoved}`);
  console.log(`========================================`);
}

main()
  .then(() => {
    console.log("\n✓ Cleanup completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n✗ Cleanup failed:", error.message);
    process.exit(1);
  });
