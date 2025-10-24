import { NextRequest, NextResponse } from "next/server";
import { redis, COPILOT_PR_KEY, PRDataPoint } from "@/lib/redis";

export async function GET(request: NextRequest) {
  try {
    // Support pagination to limit data returned
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "365", 10); // Default to 1 year of daily data
    const limitValue = Math.min(Math.max(limit, 1), 1000); // Cap at 1000 records
    
    // Get recent data points from Redis sorted set (most recent first)
    const data = await redis.zrange<any[]>(COPILOT_PR_KEY, -limitValue, -1, {
      withScores: false,
    });

    if (!data || data.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // Parse the JSON strings back to objects
    const parsedData: PRDataPoint[] = data;

    // Sort by timestamp to ensure correct order
    parsedData.sort((a, b) => a.timestamp - b.timestamp);

    return NextResponse.json({ data: parsedData });
  } catch (error) {
    console.error("Error fetching data from Redis:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
