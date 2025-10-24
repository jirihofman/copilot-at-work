import { Suspense } from "react";
import ChartClient from "@/app/components/ChartClient";
import StatCard from "@/app/components/StatCard";
import TrendsCard from "@/app/components/TrendsCard";
import { fetchCopilotPRData } from "@/lib/server-actions";
import { calculateTrends } from "@/lib/trends";

export const dynamic = "force-dynamic";

async function fetchData() {
  return fetchCopilotPRData({ limit: 365 });
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
  const data = await fetchData();
  const currentCount = data.length > 0 ? data[data.length - 1].count : 0;
  const trends = calculateTrends(data);
  const isDevMode = process.env.NODE_ENV === "development";

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-6xl mx-auto">

        <StatCard currentCount={currentCount} />

        <TrendsCard weeklyChange={trends.weeklyChange} monthlyChange={trends.monthlyChange} />

        <Suspense fallback={<LoadingFallback />}>
          {data.length > 0 ? (
            <ChartClient data={data} />
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
          <p>Data is updated daily via cron job</p>
        </div>
      </div>
    </main>
  );
}
