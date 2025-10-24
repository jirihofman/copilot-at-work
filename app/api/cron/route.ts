import { NextRequest, NextResponse } from "next/server";
import { redis, COPILOT_PR_KEY, PRDataPoint } from "@/lib/redis";
import { getCopilotPRCount } from "@/lib/github";

export async function GET(request: NextRequest) {
  try {
    // Verify authorization header for cron jobs
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!process.env.GITHUB_USERNAME) {
      return NextResponse.json(
        { error: "GITHUB_USERNAME not configured" },
        { status: 500 }
      );
    }

    // Fetch current count from GitHub
    const count = await getCopilotPRCount(process.env.GITHUB_USERNAME);

    // Create data point
    const timestamp = Date.now();
    const date = new Date(timestamp).toISOString().split("T")[0]; // YYYY-MM-DD format

    const dataPoint: PRDataPoint = {
      date,
      count,
      timestamp,
    };

    // Store in Redis sorted set (using timestamp as score for sorting)
    await redis.zadd(COPILOT_PR_KEY, {
      score: timestamp,
      member: JSON.stringify(dataPoint),
    });

    console.log(`Stored data point: ${date} - ${count} PRs`);

    return NextResponse.json({
      success: true,
      data: dataPoint,
    });
  } catch (error) {
    console.error("Error in cron job:", error);
    return NextResponse.json(
      { error: "Failed to update data", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
