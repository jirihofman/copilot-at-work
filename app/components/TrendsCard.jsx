export default function TrendsCard({ copilotTrends, claudeTrends }) {
  const hasCopilotWeeklyData = copilotTrends?.weeklyChange !== null && copilotTrends?.weeklyChange !== undefined;
  const hasCopilotMonthlyData = copilotTrends?.monthlyChange !== null && copilotTrends?.monthlyChange !== undefined;
  const hasClaudeWeeklyData = claudeTrends?.weeklyChange !== null && claudeTrends?.weeklyChange !== undefined;
  const hasClaudeMonthlyData = claudeTrends?.monthlyChange !== null && claudeTrends?.monthlyChange !== undefined;

  const hasAnyData = hasCopilotWeeklyData || hasCopilotMonthlyData || hasClaudeWeeklyData || hasClaudeMonthlyData;

  if (!hasAnyData) {
    return null;
  }

  const formatChange = (change) => {
    if (change === null || change === undefined) return null;
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(1)}%`;
  };

  const getTrendColor = (change) => {
    if (change === null || change === undefined) return "text-gray-500";
    return change >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
  };

  const getTrendIcon = (change) => {
    if (change === null || change === undefined) return null;
    return change >= 0 ? "↗" : "↘";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
        Trends
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(hasCopilotWeeklyData || hasClaudeWeeklyData) && (
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Last 7 Days
            </span>
            {hasCopilotWeeklyData && (
              <div className={`flex items-baseline gap-2 ${hasClaudeWeeklyData ? 'mb-3' : ''}`}>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium mr-2">
                  Copilot
                </span>
                <span className={`text-3xl font-bold ${getTrendColor(copilotTrends.weeklyChange)}`}>
                  {formatChange(copilotTrends.weeklyChange)}
                </span>
                <span className={`text-2xl ${getTrendColor(copilotTrends.weeklyChange)}`}>
                  {getTrendIcon(copilotTrends.weeklyChange)}
                </span>
              </div>
            )}
            {hasClaudeWeeklyData && (
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-orange-600 dark:text-orange-400 font-medium mr-2">
                  Claude
                </span>
                <span className={`text-3xl font-bold ${getTrendColor(claudeTrends.weeklyChange)}`}>
                  {formatChange(claudeTrends.weeklyChange)}
                </span>
                <span className={`text-2xl ${getTrendColor(claudeTrends.weeklyChange)}`}>
                  {getTrendIcon(claudeTrends.weeklyChange)}
                </span>
              </div>
            )}
          </div>
        )}
        {(hasCopilotMonthlyData || hasClaudeMonthlyData) && (
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Last 30 Days
            </span>
            {hasCopilotMonthlyData && (
              <div className={`flex items-baseline gap-2 ${hasClaudeMonthlyData ? 'mb-3' : ''}`}>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium mr-2">
                  Copilot
                </span>
                <span className={`text-3xl font-bold ${getTrendColor(copilotTrends.monthlyChange)}`}>
                  {formatChange(copilotTrends.monthlyChange)}
                </span>
                <span className={`text-2xl ${getTrendColor(copilotTrends.monthlyChange)}`}>
                  {getTrendIcon(copilotTrends.monthlyChange)}
                </span>
              </div>
            )}
            {hasClaudeMonthlyData && (
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-orange-600 dark:text-orange-400 font-medium mr-2">
                  Claude
                </span>
                <span className={`text-3xl font-bold ${getTrendColor(claudeTrends.monthlyChange)}`}>
                  {formatChange(claudeTrends.monthlyChange)}
                </span>
                <span className={`text-2xl ${getTrendColor(claudeTrends.monthlyChange)}`}>
                  {getTrendIcon(claudeTrends.monthlyChange)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
