import { NextResponse } from "next/server";
import { getAgentCommitCount, getCodexCommitCount } from "@/lib/github";

const AGENTS = [
  { key: "copilot", name: "copilot-swe-agent[bot]", getCount: (date) => getAgentCommitCount("copilot-swe-agent[bot]", date) },
  { key: "claude", name: "claude", getCount: (date) => getAgentCommitCount("claude", date) },
  { key: "cursor", name: "cursoragent", getCount: (date) => getAgentCommitCount("cursoragent", date) },
  { key: "codex", name: "Co-authored-by: Codex", getCount: getCodexCommitCount },
];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "Invalid or missing date parameter. Use YYYY-MM-DD format." },
      { status: 400 }
    );
  }

  try {
    const results = await Promise.all(
      AGENTS.map(async (agent) => {
        const count = await agent.getCount(date);
        return { key: agent.key, name: agent.name, count };
      })
    );

    const data = Object.fromEntries(results.map(({ key, name, count }) => [key, { name, count }]));

    return NextResponse.json({ date, data });
  } catch (error) {
    console.error("Error fetching commit counts:", error);
    return NextResponse.json(
      { error: "Failed to fetch commit counts", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
