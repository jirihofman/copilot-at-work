import { NextResponse } from "next/server";
import { redis, COPILOT_COMMIT_KEY, CLAUDE_COMMIT_KEY, CURSOR_COMMIT_KEY, CODEX_PR_KEY } from "@/lib/redis";
import { getDailyScore, getPreviousUTCDateString, upsertHistoryDataPoint } from "@/lib/commit-history";
import { getAgentCommitCount, getCodexPRLabelCount } from "@/lib/github";
import { cronRateLimiter } from "@/lib/rate-limit";

const AGENTS = [
  { key: "copilot", name: "copilot-swe-agent[bot]", redisKey: COPILOT_COMMIT_KEY, getCount: (date) => getAgentCommitCount("copilot-swe-agent[bot]", date) },
  { key: "claude", name: "claude", redisKey: CLAUDE_COMMIT_KEY, getCount: (date) => getAgentCommitCount("claude", date) },
  { key: "cursor", name: "cursoragent", redisKey: CURSOR_COMMIT_KEY, getCount: (date) => getAgentCommitCount("cursoragent", date) },
  { key: "codex", name: "label:codex", redisKey: CODEX_PR_KEY, getCount: getCodexPRLabelCount },
];

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

    // The workflow runs at 00:00 UTC, so the current UTC day is still incomplete.
    const date = getPreviousUTCDateString();
    const score = getDailyScore(date);

    const dataPoints = await Promise.all(
      AGENTS.map(async (agent) => {
        const count = await agent.getCount(date);
        const dataPoint = { date, count, timestamp: score };

        await upsertHistoryDataPoint(redis, agent.redisKey, dataPoint);

        return [agent.key, dataPoint];
      })
    );

    const data = Object.fromEntries(dataPoints);

    console.log(
      `Stored activity data points: ${date} - Copilot commits: ${data.copilot.count}, Claude commits: ${data.claude.count}, Cursor commits: ${data.cursor.count}, Codex PRs: ${data.codex.count}`
    );

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error in cron job:", error);
    return NextResponse.json(
      { error: "Failed to update data", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
