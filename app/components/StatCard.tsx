interface StatCardProps {
  currentCount: number;
}

export default function StatCard({ currentCount }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
          Total Merged Copilot PRs Worldwide
        </p>
        <p className="text-6xl font-bold text-blue-600 dark:text-blue-400">
          {currentCount}
        </p>
      </div>
    </div>
  );
}
