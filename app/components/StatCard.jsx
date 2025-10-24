import CopilotIcon from "./CopilotIcon";

export default function StatCard({ currentCount }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8 border-l-4 border-blue-600 dark:border-blue-400">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="text-blue-600 dark:text-blue-400">
            <CopilotIcon size={48} />
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 font-medium uppercase tracking-wide">
          Total Merged Copilot PRs Worldwide - Public
        </p>
        <p className="text-7xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent">
          {currentCount}
        </p>
      </div>
    </div>
  );
}
