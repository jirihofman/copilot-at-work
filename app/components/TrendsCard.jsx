export default function TrendsCard({ weeklyChange, monthlyChange }) {
  const hasWeeklyData = weeklyChange !== null && weeklyChange !== undefined;
  const hasMonthlyData = monthlyChange !== null && monthlyChange !== undefined;

  if (!hasWeeklyData && !hasMonthlyData) {
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
        {hasWeeklyData && (
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Last 7 Days
            </span>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${getTrendColor(weeklyChange)}`}>
                {formatChange(weeklyChange)}
              </span>
              <span className={`text-2xl ${getTrendColor(weeklyChange)}`}>
                {getTrendIcon(weeklyChange)}
              </span>
            </div>
          </div>
        )}
        {hasMonthlyData && (
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Last 30 Days
            </span>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${getTrendColor(monthlyChange)}`}>
                {formatChange(monthlyChange)}
              </span>
              <span className={`text-2xl ${getTrendColor(monthlyChange)}`}>
                {getTrendIcon(monthlyChange)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
