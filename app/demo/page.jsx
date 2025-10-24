import DemoChart from "@/app/components/DemoChart";
import StatCard from "@/app/components/StatCard";

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

        <StatCard currentCount={currentCount} />

        <DemoChart data={mockData} />

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Data is updated daily via cron job</p>
          <p className="mt-2 text-xs">This is a demo page with mock data</p>
        </div>
      </div>
    </main>
  );
}
