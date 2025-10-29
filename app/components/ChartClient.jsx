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
import { calculateDailyPRCounts, mergeTwoAgentData } from "@/lib/chart-utils";

export default function ChartClient({ copilotData, claudeData }) {
  const [chartType, setChartType] = useState("cumulative"); // "cumulative" or "daily"

  // Calculate daily data from cumulative data for both agents
  const copilotDailyData = calculateDailyPRCounts(copilotData);
  const claudeDailyData = calculateDailyPRCounts(claudeData);
  
  // Merge the data sets by date
  const cumulativeChartData = mergeTwoAgentData(copilotData, claudeData);
  const dailyChartData = mergeTwoAgentData(copilotDailyData, claudeDailyData);
  
  const chartData = chartType === "cumulative" ? cumulativeChartData : dailyChartData;

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
              dataKey="copilotCount"
              stroke="#2563eb"
              strokeWidth={2}
              name={chartType === "cumulative" ? "Copilot Total PRs" : "Copilot PRs per Day"}
            />
            <Line
              type="monotone"
              dataKey="claudeCount"
              stroke="#f97316"
              strokeWidth={2}
              name={chartType === "cumulative" ? "Claude Total PRs" : "Claude PRs per Day"}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
