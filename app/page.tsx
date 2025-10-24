"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface DataPoint {
  date: string;
  count: number;
}

export default function Home() {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDevMode, setIsDevMode] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    // Check if we're in development mode
    setIsDevMode(process.env.NODE_ENV === 'development');
    
    async function fetchData() {
      try {
        const response = await fetch("/api/fetch-copilot-prs");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();
        setData(result.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleDevFetch = async () => {
    setIsFetching(true);
    try {
      const response = await fetch("/api/cron", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || ''}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to trigger cron job");
      }
      
      const result = await response.json();
      console.log("Cron job result:", result);
      
      // Refresh the data after successful cron run
      const dataResponse = await fetch("/api/fetch-copilot-prs");
      if (dataResponse.ok) {
        const dataResult = await dataResponse.json();
        setData(dataResult.data || []);
      }
      
      alert(`Successfully fetched! New count: ${result.data?.count || 'N/A'}`);
    } catch (err) {
      console.error("Error triggering cron:", err);
      alert(`Error: ${err instanceof Error ? err.message : "Failed to trigger cron job"}`);
    } finally {
      setIsFetching(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">Error: {error}</div>
      </main>
    );
  }

  const currentCount = data.length > 0 ? data[data.length - 1].count : 0;

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Copilot at Work</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Tracking merged Copilot PRs worldwide
        </p>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Total Merged Copilot PRs Worldwide</p>
            <p className="text-6xl font-bold text-blue-600 dark:text-blue-400">{currentCount}</p>
          </div>
        </div>

        {data.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">PR Count Over Time</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis 
                  tick={{ fill: 'currentColor' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--background)', 
                    border: '1px solid #ccc' 
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  name="Merged PRs"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">No data available yet. Check back after the first cron job runs.</p>
          </div>
        )}

        {isDevMode && (
          <div className="mt-8 text-center">
            <button
              onClick={handleDevFetch}
              disabled={isFetching}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold rounded-lg shadow-md transition-colors duration-200"
            >
              {isFetching ? "Fetching..." : "🔄 Run GitHub Query (Dev Only)"}
            </button>
            <p className="text-xs text-gray-500 mt-2">Development mode - manually trigger data fetch</p>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Data is updated daily via cron job</p>
        </div>
      </div>
    </main>
  );
}
