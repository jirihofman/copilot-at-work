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

interface DataPoint {
  date: string;
  count: number;
}

interface DemoChartProps {
  data: DataPoint[];
}

export default function DemoChart({ data }: DemoChartProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">PR Count Over Time</h2>
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
