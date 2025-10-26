import { redis, COPILOT_PR_KEY } from "../lib/redis.js";

async function removeZeroCounts(beforeDate) {
  // Get all data points
  const allData = await redis.zrange(COPILOT_PR_KEY, 0, -1, { withScores: false });
  if (!allData || allData.length === 0) {
    console.log("No data found in Redis.");
    return;
  }

  let removed = 0;
  for (const item of allData) {
    const data = typeof item === "string" ? JSON.parse(item) : item;
    if (
      data.count === 0 &&
      data.date <= beforeDate
    ) {
      // Remove this entry from Redis
      await redis.zrem(COPILOT_PR_KEY, JSON.stringify(data));
      removed++;
      console.log(`Removed zero-count for ${data.date}`);
    }
  }
  console.log(`Done. Removed ${removed} zero-count entries before and including ${beforeDate}.`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const beforeDate = process.argv[2];
  if (!beforeDate) {
    console.error("Usage: node scripts/remove-zero-counts.js YYYY-MM-DD");
    process.exit(1);
  }
  removeZeroCounts(beforeDate)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Error:", err);
      process.exit(1);
    });
}
