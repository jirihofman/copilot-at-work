import { Suspense } from "react";
import ChartClient from "@/app/components/ChartClient";
import StatCard from "@/app/components/StatCard";

interface DataPoint {
  date: string;
  count: number;
}

async function fetchData(): Promise<DataPoint[]> {
  try {
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : "http://localhost:3000";
    
    const response = await fetch(`${baseUrl}/api/fetch-copilot-prs`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }
    
    const result = await response.json();
    return result.data || [];
  } catch (err) {
    console.error("Error fetching data:", err);
    return [];
  }
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
  const isDevMode = process.env.NODE_ENV === "development";

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">

        <StatCard currentCount={currentCount} />

        <Suspense fallback={<LoadingFallback />}>
          {data.length > 0 ? (
            <ChartClient data={data} />
          ) : (
            <EmptyState />
          )}
        </Suspense>

        {isDevMode && (
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              Development mode - use the dev button in client component
            </p>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Data is updated daily via cron job</p>
        </div>
      </div>
    </main>
  );
}
