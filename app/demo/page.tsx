"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Mock data for demonstration
const mockData = [
  { date: "2025-01-01", count: 5 },
  { date: "2025-01-02", count: 7 },
  { date: "2025-01-03", count: 9 },
  { date: "2025-01-04", count: 12 },
  { date: "2025-01-05", count: 15 },
  { date: "2025-01-06", count: 18 },
  { date: "2025-01-07", count: 22 },
  { date: "2025-01-08", count: 25 },
  { date: "2025-01-09", count: 28 },
  { date: "2025-01-10", count: 32 },
];

export default function DemoPage() {
  const currentCount = mockData[mockData.length - 1].count;

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

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">PR Count Over Time</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={mockData}>
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

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Data is updated daily via cron job</p>
          <p className="mt-2 text-xs">This is a demo page with mock data</p>
        </div>
      </div>
    </main>
  );
}
