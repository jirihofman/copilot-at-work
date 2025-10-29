import { Suspense } from "react";
import ChartClient from "@/app/components/ChartClient";
import StatCard from "@/app/components/StatCard";
import TrendsCard from "@/app/components/TrendsCard";
import { fetchCopilotPRData, fetchClaudePRData } from "@/lib/server-actions";
import { calculateTrends } from "@/lib/trends";

export const dynamic = "force-dynamic";

async function fetchData() {
  const copilotData = await fetchCopilotPRData({ limit: 365 });
  const claudeData = await fetchClaudePRData({ limit: 365 });
  return { copilotData, claudeData };
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
        No data available yet. Check back after the first cron job runs.
      </p>
    </div>
  );
}

export default async function Home() {
  const { copilotData, claudeData } = await fetchData();
  const currentCopilotCount = copilotData.length > 0 ? copilotData[copilotData.length - 1].count : 0;
  const currentClaudeCount = claudeData.length > 0 ? claudeData[claudeData.length - 1].count : 0;
  const copilotTrends = calculateTrends(copilotData);
  const isDevMode = process.env.NODE_ENV === "development";

  return (
    <main className="min-h-screen bg-linear-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">

        <StatCard currentCount={currentCopilotCount} />

        <TrendsCard weeklyChange={copilotTrends.weeklyChange} monthlyChange={copilotTrends.monthlyChange} />

        <Suspense fallback={<LoadingFallback />}>
          {copilotData.length > 0 || claudeData.length > 0 ? (
            <ChartClient copilotData={copilotData} claudeData={claudeData} />
          ) : (
            <EmptyState />
          )}
        </Suspense>

        {isDevMode && (
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">
              Development mode - use the dev button in client component
            </p>
          </div>
        )}

        <div className="mt-8 text-center text-xs text-gray-400">
          <p>Data is updated daily.</p>
        </div>
      </div>
    </main>
  );
}
