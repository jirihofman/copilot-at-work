import DemoChart from "@/app/components/DemoChart";
import StatCard from "@/app/components/StatCard";
import TrendsCard from "@/app/components/TrendsCard";

// Mock data for demonstration - simulating 30 days of data with growth
const mockData = [
  { date: "2024-12-26", count: 100, timestamp: Date.now() - 30 * 24 * 60 * 60 * 1000 },
  { date: "2024-12-27", count: 105, timestamp: Date.now() - 29 * 24 * 60 * 60 * 1000 },
  { date: "2024-12-28", count: 108, timestamp: Date.now() - 28 * 24 * 60 * 60 * 1000 },
  { date: "2024-12-29", count: 112, timestamp: Date.now() - 27 * 24 * 60 * 60 * 1000 },
  { date: "2024-12-30", count: 115, timestamp: Date.now() - 26 * 24 * 60 * 60 * 1000 },
  { date: "2024-12-31", count: 118, timestamp: Date.now() - 25 * 24 * 60 * 60 * 1000 },
  { date: "2025-01-01", count: 120, timestamp: Date.now() - 24 * 24 * 60 * 60 * 1000 },
  { date: "2025-01-02", count: 123, timestamp: Date.now() - 23 * 24 * 60 * 60 * 1000 },
  { date: "2025-01-03", count: 125, timestamp: Date.now() - 22 * 24 * 60 * 60 * 1000 },
  { date: "2025-01-04", count: 128, timestamp: Date.now() - 21 * 24 * 60 * 60 * 1000 },
  { date: "2025-01-05", count: 130, timestamp: Date.now() - 20 * 24 * 60 * 60 * 1000 },
  { date: "2025-01-06", count: 134, timestamp: Date.now() - 19 * 24 * 60 * 60 * 1000 },
  { date: "2025-01-07", count: 137, timestamp: Date.now() - 18 * 24 * 60 * 60 * 1000 },
  { date: "2025-01-08", count: 140, timestamp: Date.now() - 17 * 24 * 60 * 60 * 1000 },
  { date: "2025-01-09", count: 143, timestamp: Date.now() - 16 * 24 * 60 * 60 * 1000 },
  { date: "2025-01-10", count: 145, timestamp: Date.now() - 15 * 24 * 60 * 60 * 1000 },
  { date: "2025-01-11", count: 148, timestamp: Date.now() - 14 * 24 * 60 * 60 * 1000 },
  { date: "2025-01-12", count: 150, timestamp: Date.now() - 13 * 24 * 60 * 60 * 1000 },
  { date: "2025-01-13", count: 153, timestamp: Date.now() - 12 * 24 * 60 * 60 * 1000 },
  { date: "2025-01-14", count: 155, timestamp: Date.now() - 11 * 24 * 60 * 60 * 1000 },
  { date: "2025-01-15", count: 158, timestamp: Date.now() - 10 * 24 * 60 * 60 * 1000 },
  { date: "2025-01-16", count: 160, timestamp: Date.now() - 9 * 24 * 60 * 60 * 1000 },
  { date: "2025-01-17", count: 163, timestamp: Date.now() - 8 * 24 * 60 * 60 * 1000 },
  { date: "2025-01-18", count: 165, timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000 },
  { date: "2025-01-19", count: 168, timestamp: Date.now() - 6 * 24 * 60 * 60 * 1000 },
  { date: "2025-01-20", count: 170, timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000 },
  { date: "2025-01-21", count: 173, timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000 },
  { date: "2025-01-22", count: 175, timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000 },
  { date: "2025-01-23", count: 178, timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000 },
  { date: "2025-01-24", count: 180, timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000 },
];

export default function DemoPage() {
  const currentCount = mockData[mockData.length - 1].count;
  
  // Calculate mock trends
  const weekOldCount = mockData[mockData.length - 7].count; // 7 days ago
  const monthOldCount = mockData[0].count; // 30 days ago
  
  const weeklyChange = ((currentCount - weekOldCount) / weekOldCount) * 100;
  const monthlyChange = ((currentCount - monthOldCount) / monthOldCount) * 100;

  return (
    <main className="min-h-screen bg-linear-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
        <StatCard currentCount={currentCount} />

        <TrendsCard weeklyChange={weeklyChange} monthlyChange={monthlyChange} />

        <DemoChart data={mockData} />

        <div className="mt-8 text-center text-xs text-gray-400">
          <p>Data is updated daily.</p>
          <p className="mt-2">This is a demo page with mock data</p>
        </div>
      </div>
    </main>
  );
}
