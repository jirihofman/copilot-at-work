import { Suspense } from "react";
import ChartClient from "@/app/components/ChartClient";
import StatCard from "@/app/components/StatCard";
import TrendsCard from "@/app/components/TrendsCard";
import { fetchCopilotCommitData, fetchClaudeCommitData, fetchCursorCommitData, fetchCodexPRData } from "@/lib/server-actions";
import { calculateTrends } from "@/lib/trends";

export const dynamic = "force-dynamic";

const methodologyItems = [
  {
    title: "Public GitHub search",
    description:
      "The numbers come from GitHub's public search APIs. Each day the app queries worldwide public activity and asks GitHub for the total count returned by each tracked signal.",
  },
  {
    title: "Tracked signatures",
    description:
      "Copilot uses author:copilot-swe-agent[bot], Claude uses author:claude, and Cursor uses author:cursoragent with author-date:YYYY-MM-DD. Codex uses merged PRs with label:codex and merged:YYYY-MM-DD.",
  },
  {
    title: "Daily snapshots",
    description:
      "A cron endpoint runs once per day, stores the count for that day in Upstash Redis, and the chart reads back the stored history rather than recomputing old days on every page load.",
  },
  {
    title: "Important caveat",
    description:
      "This is a useful public signal, not a canonical dataset. Results depend on GitHub search indexing and on how each tool authors or signs commits, so counts may miss activity or include noise.",
  },
];

async function fetchData() {
  const copilotData = await fetchCopilotCommitData({ limit: 365 });
  const claudeData = await fetchClaudeCommitData({ limit: 365 });
  const cursorData = await fetchCursorCommitData({ limit: 365 });
  const codexData = await fetchCodexPRData({ limit: 365 });
  return { copilotData, claudeData, cursorData, codexData };
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl">Loading data...</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
      <p className="text-gray-600 dark:text-gray-400">
        No commit history available yet. Check back after the first cron job runs.
      </p>
    </div>
  );
}

function MethodologyCard() {
  return (
    <section className="mt-8 rounded-2xl border border-gray-200 bg-white/95 p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800/95 sm:p-8">
      <div className="max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
          Methodology
        </p>
        <h2 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
          How these numbers are gathered
        </h2>
        <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300 sm:text-base">
          This site tracks daily commit counts by taking one snapshot per day from GitHub&apos;s public search index.
          Codex is tracked with merged PRs carrying the public codex label. It does not have private access to GitHub or vendor telemetry.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {methodologyItems.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/60"
            >
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function Home() {
  const { copilotData, claudeData, cursorData, codexData } = await fetchData();
  const currentCopilotCount = copilotData.length > 0 ? copilotData[copilotData.length - 1].count : 0;
  const copilotTrends = calculateTrends(copilotData);
  const claudeTrends = calculateTrends(claudeData);
  const cursorTrends = calculateTrends(cursorData);
  const codexTrends = calculateTrends(codexData);

  return (
    <main className="min-h-screen bg-linear-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">

        <StatCard currentCount={currentCopilotCount} />

        <TrendsCard copilotTrends={copilotTrends} claudeTrends={claudeTrends} cursorTrends={cursorTrends} codexTrends={codexTrends} />

        <Suspense fallback={<LoadingFallback />}>
          {copilotData.length > 0 || claudeData.length > 0 || cursorData.length > 0 || codexData.length > 0 ? (
            <ChartClient copilotData={copilotData} claudeData={claudeData} cursorData={cursorData} codexData={codexData} />
          ) : (
            <EmptyState />
          )}
        </Suspense>

        <MethodologyCard />

        <div className="mt-8 text-center text-xs text-gray-400">
          <p>Commit history is updated daily.</p>
        </div>
      </div>
    </main>
  );
}
