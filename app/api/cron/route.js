import { NextResponse } from "next/server";
import { redis, COPILOT_PR_KEY, CLAUDE_PR_KEY, CURSOR_PR_KEY } from "@/lib/redis";
import { getCopilotPRCount, getClaudePRCount, getCursorPRCount } from "@/lib/github";
import { cronRateLimiter } from "@/lib/rate-limit";

export async function GET(request) {
  try {
    // Apply rate limiting based on IP address (before auth to prevent brute force attacks)
    // Extract the first IP from x-forwarded-for in case of proxy chains
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : request.headers.get("x-real-ip") ?? "127.0.0.1";
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

    // Fetch current count from GitHub (worldwide) for both agents
    const copilotCount = await getCopilotPRCount();
    const claudeCount = await getClaudePRCount();
    const cursorCount = await getCursorPRCount();

    // Create data point
    const timestamp = Date.now();
    const date = new Date(timestamp).toISOString().split("T")[0]; // YYYY-MM-DD format

    const copilotDataPoint = {
      date,
      count: copilotCount,
      timestamp,
    };

    const claudeDataPoint = {
      date,
      count: claudeCount,
      timestamp,
    };

    const cursorDataPoint = {
      date,
      count: cursorCount,
      timestamp,
    };

    // Store in Redis sorted set (using timestamp as score for sorting)
    await redis.zadd(COPILOT_PR_KEY, {
      score: timestamp,
      member: JSON.stringify(copilotDataPoint),
    });

    await redis.zadd(CLAUDE_PR_KEY, {
      score: timestamp,
      member: JSON.stringify(claudeDataPoint),
    });

    await redis.zadd(CURSOR_PR_KEY, {
      score: timestamp,
      member: JSON.stringify(cursorDataPoint),
    });

    console.log(`Stored data points: ${date} - Copilot: ${copilotCount} PRs, Claude: ${claudeCount} PRs, Cursor: ${cursorCount} PRs`);

    return NextResponse.json({
      success: true,
      data: {
        copilot: copilotDataPoint,
        claude: claudeDataPoint,
        cursor: cursorDataPoint,
      },
    });
  } catch (error) {
    console.error("Error in cron job:", error);
    return NextResponse.json(
      { error: "Failed to update data", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
