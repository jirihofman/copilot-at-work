/**
 * Calculate percentage change between two values
 * @param {number} oldValue - The original value
 * @param {number} newValue - The new value
 * @returns {number|null} - Percentage change or null if calculation not possible
 */
export function calculatePercentageChange(oldValue, newValue) {
  if (oldValue === 0) {
    // If old value is 0 and new value is positive, it's 100% increase
    // If both are 0, it's 0% change
    return newValue > 0 ? 100 : 0;
  }
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Calculate trends from historical data
 * @param {Array} data - Array of data points with {date, count, timestamp}
 * @returns {Object} - Object with weeklyChange and monthlyChange
 */
export function calculateTrends(data) {
  if (!data || data.length === 0) {
    return { weeklyChange: null, monthlyChange: null };
  }

  const now = Date.now();
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

  // Get the most recent data point
  const latestData = data[data.length - 1];
  const latestCount = latestData.count;

  // Find data point closest to 7 days ago
  let weeklyChange = null;
  const weekOldData = data.find((point) => point.timestamp >= oneWeekAgo);
  if (weekOldData && data.length >= 7) {
    weeklyChange = calculatePercentageChange(weekOldData.count, latestCount);
  }

  // Find data point closest to 30 days ago
  let monthlyChange = null;
  const monthOldData = data.find((point) => point.timestamp >= oneMonthAgo);
  if (monthOldData && data.length >= 30) {
    monthlyChange = calculatePercentageChange(monthOldData.count, latestCount);
  }

  return { weeklyChange, monthlyChange };
}
