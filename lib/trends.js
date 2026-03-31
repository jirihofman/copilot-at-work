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

function sumCounts(data) {
  return data.reduce((total, item) => total + Math.max(0, item.count || 0), 0);
}

function calculateWindowChange(data, days) {
  if (!data || data.length < days * 2) {
    return null;
  }

  const recentWindow = data.slice(-days);
  const previousWindow = data.slice(-days * 2, -days);

  return calculatePercentageChange(sumCounts(previousWindow), sumCounts(recentWindow));
}

/**
 * Calculate trends from historical data
 * @param {Array} data - Array of daily data points with {date, count, timestamp}
 * @returns {Object} - Object with weeklyChange and monthlyChange
 */
export function calculateTrends(data) {
  if (!data || data.length === 0) {
    return { weeklyChange: null, monthlyChange: null };
  }

  const weeklyChange = calculateWindowChange(data, 7);
  const monthlyChange = calculateWindowChange(data, 30);

  return { weeklyChange, monthlyChange };
}
