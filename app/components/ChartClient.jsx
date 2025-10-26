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
import { calculateDailyPRCounts } from "@/lib/chart-utils";

export default function ChartClient({ data }) {
  const [isFetching, setIsFetching] = useState(false);
  const [chartType, setChartType] = useState("cumulative"); // "cumulative" or "daily"
  const isDevMode = process.env.NODE_ENV === "development";

  // Calculate daily data from cumulative data
  const dailyData = calculateDailyPRCounts(data);
  const chartData = chartType === "cumulative" ? data : dailyData;

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            {chartType === "cumulative" ? "Total PR Count Over Time" : "Daily PR Count"}
          </h2>
          
          <div className="flex gap-2">
            <button
              onClick={() => setChartType("cumulative")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                chartType === "cumulative"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              Cumulative
            </button>
            <button
              onClick={() => setChartType("daily")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                chartType === "daily"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              Daily
            </button>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
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
              name={chartType === "cumulative" ? "Total Merged PRs" : "PRs per Day"}
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
