"use client";

import { useState, useMemo } from "react";
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

export default function DemoChart({ data }) {
  const [chartType, setChartType] = useState("cumulative"); // "cumulative" or "daily"
  const [timeRange, setTimeRange] = useState("all"); // "all", "week", "month"

  // Calculate daily data from cumulative data
  const dailyData = calculateDailyPRCounts(data);
  
  // Filter data based on time range
  const filterDataByTimeRange = (chartData) => {
    if (timeRange === "all") return chartData;
    
    const now = new Date();
    const cutoffDate = new Date();
    
    if (timeRange === "week") {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (timeRange === "month") {
      cutoffDate.setDate(now.getDate() - 30);
    }
    
    const cutoffString = cutoffDate.toISOString().split('T')[0];
    return chartData.filter(item => item.date >= cutoffString);
  };
  
  const filteredCumulativeData = useMemo(
    () => filterDataByTimeRange(data),
    [data, timeRange]
  );
  
  const filteredDailyData = useMemo(
    () => filterDataByTimeRange(dailyData),
    [dailyData, timeRange]
  );
  
  const chartData = chartType === "cumulative" ? filteredCumulativeData : filteredDailyData;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
        
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setTimeRange("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setTimeRange("week")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === "week"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Last Week
          </button>
          <button
            onClick={() => setTimeRange("month")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === "month"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Last Month
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
  );
}
