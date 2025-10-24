"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function ChartClient({ data }) {
  const [isFetching, setIsFetching] = useState(false);
  const isDevMode = process.env.NODE_ENV === "development";

  const handleDevFetch = async () => {
    setIsFetching(true);
    try {
      const response = await fetch("/api/cron", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || ""}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to trigger cron job");
      }

      const result = await response.json();
      console.log("Cron job result:", result);

      alert(`Successfully fetched! New count: ${result.data?.count || "N/A"}`);

      // Reload the page to see updated data
      window.location.reload();
    } catch (err) {
      console.error("Error triggering cron:", err);
      alert(
        `Error: ${err instanceof Error ? err.message : "Failed to trigger cron job"}`
      );
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">PR Count Over Time</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fill: "currentColor" }} />
            <YAxis tick={{ fill: "currentColor" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--background)",
                border: "1px solid #ccc",
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

      {isDevMode && (
        <div className="mt-8 text-center">
          <button
            onClick={handleDevFetch}
            disabled={isFetching}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold rounded-lg shadow-md transition-colors duration-200"
          >
            {isFetching ? "Fetching..." : "🔄 Run GitHub Query (Dev Only)"}
          </button>
          <p className="text-xs text-gray-400 mt-2">
            Development mode - manually trigger data fetch
          </p>
        </div>
      )}
    </>
  );
}
