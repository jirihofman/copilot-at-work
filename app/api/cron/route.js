import { NextResponse } from "next/server";
import { redis, COPILOT_PR_KEY } from "@/lib/redis";
import { getCopilotPRCount } from "@/lib/github";
import { cronRateLimiter } from "@/lib/rate-limit";

export async function GET(request) {
  try {
    // Apply rate limiting based on IP address
    const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "127.0.0.1";
    const { success: rateLimitSuccess, limit, reset, remaining } = await cronRateLimiter.limit(ip);
    
    if (!rateLimitSuccess) {
      return NextResponse.json(
        { 
          error: "Too many requests", 
          limit,
          remaining,
          reset: new Date(reset).toISOString()
        },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          }
        }
      );
    }

    // Verify authorization header for cron jobs using constant-time comparison
    const authHeader = request.headers.get("authorization");
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
    
    if (!authHeader || authHeader.length !== expectedAuth.length) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Constant-time comparison to prevent timing attacks
    let isValid = true;
    for (let i = 0; i < expectedAuth.length; i++) {
      if (authHeader[i] !== expectedAuth[i]) {
        isValid = false;
      }
    }
    
    if (!isValid) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch current count from GitHub (worldwide)
    const count = await getCopilotPRCount();

    // Create data point
    const timestamp = Date.now();
    const date = new Date(timestamp).toISOString().split("T")[0]; // YYYY-MM-DD format

    const dataPoint = {
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
