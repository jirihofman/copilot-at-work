"use client";

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

export default function DemoChart({ data }) {
  return (
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
  );
}
