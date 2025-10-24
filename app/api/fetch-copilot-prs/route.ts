import { NextResponse } from "next/server";
import { redis, COPILOT_PR_KEY, PRDataPoint } from "@/lib/redis";

export async function GET() {
  try {
    // Get all data points from Redis sorted set
    const data = await redis.zrange<string[]>(COPILOT_PR_KEY, 0, -1, {
      withScores: false,
    });

    if (!data || data.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // Parse the JSON strings back to objects
    const parsedData: PRDataPoint[] = data.map((item) => JSON.parse(item));

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
